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
        $validated = $request->validate([
            'receiverWalletNumber' => ['required', 'string', 'max:32'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $senderUser = $request->user();
        $receiverWallet = Wallet::query()->where('wallet_number', $validated['receiverWalletNumber'])->first();

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
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            $wallet = Wallet::query()->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();

            if ((float) $wallet->balance < (float) $validated['amount']) {
                throw new HttpResponseException(response()->json([
                    'error' => 'Insufficient balance',
                ], 400));
            }

            $wallet->balance = (float) $wallet->balance - (float) $validated['amount'];
            $wallet->save();

            Transaction::query()->create([
                'sender_wallet_id' => $wallet->id,
                'receiver_wallet_id' => null,
                'amount' => $validated['amount'],
                'type' => 'WITHDRAWAL',
                'description' => $validated['description'] ?? null,
                'created_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Withdrawal successful',
        ]);
    }

    public function getHistory(Request $request): JsonResponse
    {
        $wallet = Wallet::query()->where('user_id', $request->user()->id)->firstOrFail();

        $transactions = Transaction::query()
            ->where('sender_wallet_id', $wallet->id)
            ->orWhere('receiver_wallet_id', $wallet->id)
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
            ])
            ->values();

        return response()->json($transactions);
    }
}