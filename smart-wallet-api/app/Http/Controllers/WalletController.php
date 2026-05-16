<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function getWallet(Request $request): JsonResponse
    {
        $wallet = $request->user()->wallet()->firstOrFail();

        return response()->json([
            'id' => $wallet->id,
            'balance' => (float) $wallet->balance,
            'currency' => $wallet->currency,
            'wallet_number' => $wallet->wallet_number,
            'accountNumber' => $wallet->wallet_number,
        ]);
    }
}