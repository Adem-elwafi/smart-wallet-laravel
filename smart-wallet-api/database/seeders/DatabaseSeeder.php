<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adem = User::factory()->create([
            'firstname' => 'Adem',
            'lastname' => 'Dev',
            'email' => 'Adem@gmail.com',
            'password' => 'password123',
        ]);

        $friend = User::factory()->create([
            'firstname' => 'John',
            'lastname' => 'Counterparty',
            'email' => 'friend@example.com',
            'password' => 'password123',
        ]);

        $ademWallet = $adem->wallet()->create([
            'wallet_number' => 'SW-10000001',
            'balance' => 1250.00,
            'currency' => 'TND',
        ]);

        $friendWallet = $friend->wallet()->create([
            'wallet_number' => 'SW-20000002',
            'balance' => 500.00,
            'currency' => 'TND',
        ]);

        Transaction::create([
            'sender_wallet_id' => null,
            'receiver_wallet_id' => $ademWallet->id,
            'amount' => 1500.00,
            'type' => 'DEPOSIT',
            'description' => 'Initial bank top-up',
            'created_at' => now()->subDays(4),
        ]);

        Transaction::create([
            'sender_wallet_id' => $ademWallet->id,
            'receiver_wallet_id' => $friendWallet->id,
            'amount' => 300.00,
            'type' => 'TRANSFER',
            'description' => 'Dinner split',
            'created_at' => now()->subDays(3),
        ]);

        Transaction::create([
            'sender_wallet_id' => $friendWallet->id,
            'receiver_wallet_id' => $ademWallet->id,
            'amount' => 75.00,
            'type' => 'TRANSFER',
            'description' => 'Refund for drinks',
            'created_at' => now()->subDays(2),
        ]);

        Transaction::create([
            'sender_wallet_id' => $ademWallet->id,
            'receiver_wallet_id' => null,
            'amount' => 25.00,
            'type' => 'WITHDRAWAL',
            'description' => 'ATM Cash',
            'created_at' => now()->subDay(),
        ]);
    }
}
