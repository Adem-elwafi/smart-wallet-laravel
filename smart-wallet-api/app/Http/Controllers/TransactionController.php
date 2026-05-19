<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function transfer(Request $request): JsonResponse
    {
        $senderUser = $request->user();
        $sourceWallet = $senderUser->wallet;

        $validated = $request->validate([
            'receiverWalletNumber' => ['required_without:receiver_wallet_number', 'string', 'max:32'],
            'receiver_wallet_number' => ['required_without:receiverWalletNumber', 'string', 'max:32'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:64'],
        ]);

        $receiverWalletNumber = $validated['receiverWalletNumber'] ?? $validated['receiver_wallet_number'];

        if ($sourceWallet && $receiverWalletNumber === $sourceWallet->wallet_number) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => [
                    'receiver_wallet_number' => ["Impossible d'envoyer de l'argent à votre propre compte."],
                ],
            ], 422);
        }

        $receiverWallet = Wallet::query()->where('wallet_number', $receiverWalletNumber)->first();

        if (! $receiverWallet) {
            return response()->json([
                'error' => 'Recipient wallet not found',
            ], 404);
        }

        DB::transaction(function () use ($senderUser, $receiverWallet, $validated): void {
            $senderWallet = Wallet::query()->where('user_id', $senderUser->id)->lockForUpdate()->firstOrFail();
            $receiverWallet = Wallet::query()->where('wallet_number', $receiverWallet->wallet_number)->lockForUpdate()->firstOrFail();

            if ((float) $senderWallet->balance < (float) $validated['amount']) {
                throw new HttpResponseException(response()->json([
                    'error' => 'Insufficient balance',
                ], 400));
            }

            $senderWallet->balance = (float) $senderWallet->balance - (float) $validated['amount'];
            $senderWallet->save();

            $receiverWallet->balance = (float) $receiverWallet->balance + (float) $validated['amount'];
            $receiverWallet->save();

            Transaction::query()->create([
                'sender_wallet_id' => $senderWallet->id,
                'receiver_wallet_id' => $receiverWallet->id,
                'amount' => $validated['amount'],
                'type' => 'TRANSFER',
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Transfer completed successfully',
        ]);
    }

    public function deposit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:64'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            $wallet = Wallet::query()->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();

            $wallet->balance = (float) $wallet->balance + (float) $validated['amount'];
            $wallet->save();

            Transaction::query()->create([
                'sender_wallet_id' => null,
                'receiver_wallet_id' => $wallet->id,
                'amount' => $validated['amount'],
                'type' => 'DEPOSIT',
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Deposit successful',
        ]);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        if (! $wallet) {
            return response()->json([
                'message' => 'Wallet not found',
            ], 404);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'category' => ['required', 'string', 'max:64'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        if ((float) $wallet->balance < (float) $validated['amount']) {
            return response()->json([
                'message' => 'Solde insuffisant pour cette dépense.',
            ], 422);
        }

        DB::transaction(function () use ($wallet, $validated): void {
            $wallet = Wallet::query()->where('id', $wallet->id)->lockForUpdate()->firstOrFail();

            if ((float) $wallet->balance < (float) $validated['amount']) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Solde insuffisant pour cette dépense.',
                ], 422));
            }

            $wallet->balance = (float) $wallet->balance - (float) $validated['amount'];
            $wallet->save();

            Transaction::query()->create([
                'sender_wallet_id' => $wallet->id,
                'receiver_wallet_id' => null,
                'amount' => $validated['amount'],
                'type' => 'WITHDRAWAL',
                'category' => $validated['category'],
                'description' => $validated['description'] ?? 'Dépense personnelle',
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Dépense enregistrée avec succès !',
        ]);
    }

    public function getHistory(Request $request): JsonResponse
    {
        $wallet = Wallet::query()->where('user_id', $request->user()->id)->firstOrFail();

        $transactions = Transaction::query()
            ->where('sender_wallet_id', $wallet->id)
            ->orWhere('receiver_wallet_id', $wallet->id)
            ->with(['senderWallet.user', 'receiverWallet.user'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'amount' => (float) $transaction->amount,
                'type' => $transaction->type,
                'description' => $transaction->description,
                'createdAt' => $transaction->created_at?->utc()?->format('Y-m-d\TH:i:s\Z'),
                'senderWalletId' => $transaction->sender_wallet_id,
                'receiverWalletId' => $transaction->receiver_wallet_id,
                'senderAccountNumber' => $transaction->senderWallet?->wallet_number,
                'recipientAccountNumber' => $transaction->receiverWallet?->wallet_number,
                'senderFirstname' => $transaction->senderWallet?->user?->firstname,
                'senderLastname' => $transaction->senderWallet?->user?->lastname,
                'recipientFirstname' => $transaction->receiverWallet?->user?->firstname,
                'recipientLastname' => $transaction->receiverWallet?->user?->lastname,
                'category' => $transaction->category,
            ])
            ->values();

        return response()->json($transactions);
    }
}