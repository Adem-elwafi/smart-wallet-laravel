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
        $now = now();

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

        $sarah = User::factory()->create([
            'firstname' => 'Sarah',
            'lastname' => 'Martin',
            'email' => 'sarah@example.com',
            'password' => 'password123',
        ]);

        $luc = User::factory()->create([
            'firstname' => 'Luc',
            'lastname' => 'Bensaid',
            'email' => 'luc@example.com',
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

        $sarahWallet = $sarah->wallet()->create([
            'wallet_number' => 'SW-30000003',
            'balance' => 980.00,
            'currency' => 'TND',
        ]);

        $lucWallet = $luc->wallet()->create([
            'wallet_number' => 'SW-40000004',
            'balance' => 210.00,
            'currency' => 'TND',
        ]);

        $transactions = [
            [
                'sender_wallet_id' => null,
                'receiver_wallet_id' => $ademWallet->id,
                'amount' => 1800.00,
                'type' => 'DEPOSIT',
                'category' => 'Salaire',
                'description' => 'Monthly salary payment',
                'created_at' => $now->copy()->subDays(6),
            ],
            [
                'sender_wallet_id' => $ademWallet->id,
                'receiver_wallet_id' => null,
                'amount' => 28.50,
                'type' => 'WITHDRAWAL',
                'category' => 'Alimentation',
                'description' => 'Achat Sandwich',
                'created_at' => $now->copy()->subDays(5),
            ],
            [
                'sender_wallet_id' => $ademWallet->id,
                'receiver_wallet_id' => $friendWallet->id,
                'amount' => 300.00,
                'type' => 'TRANSFER',
                'category' => 'Loisirs',
                'description' => 'Dinner split',
                'created_at' => $now->copy()->subDays(4),
            ],
            [
                'sender_wallet_id' => $ademWallet->id,
                'receiver_wallet_id' => null,
                'amount' => 12.00,
                'type' => 'WITHDRAWAL',
                'category' => 'Transport',
                'description' => 'Ticket de Bus',
                'created_at' => $now->copy()->subDays(4)->addHours(3),
            ],
            [
                'sender_wallet_id' => $friendWallet->id,
                'receiver_wallet_id' => $ademWallet->id,
                'amount' => 75.00,
                'type' => 'TRANSFER',
                'category' => 'Loisirs',
                'description' => 'Refund for drinks',
                'created_at' => $now->copy()->subDays(3),
            ],
            [
                'sender_wallet_id' => null,
                'receiver_wallet_id' => $ademWallet->id,
                'amount' => 250.00,
                'type' => 'DEPOSIT',
                'category' => 'Freelance',
                'description' => 'Side project payment',
                'created_at' => $now->copy()->subDays(2),
            ],
            [
                'sender_wallet_id' => $ademWallet->id,
                'receiver_wallet_id' => null,
                'amount' => 96.00,
                'type' => 'WITHDRAWAL',
                'category' => 'Factures',
                'description' => 'Internet bill',
                'created_at' => $now->copy()->subDay(),
            ],
            [
                'sender_wallet_id' => $sarahWallet->id,
                'receiver_wallet_id' => $lucWallet->id,
                'amount' => 44.00,
                'type' => 'TRANSFER',
                'category' => 'Transport',
                'description' => 'Taxi reimbursement',
                'created_at' => $now->copy()->subHours(18),
            ],
            [
                'sender_wallet_id' => $lucWallet->id,
                'receiver_wallet_id' => null,
                'amount' => 18.00,
                'type' => 'WITHDRAWAL',
                'category' => 'Alimentation',
                'description' => 'Coffee and snack',
                'created_at' => $now->copy()->subHours(8),
            ],
        ];

        foreach ($transactions as $transaction) {
            Transaction::create($transaction);
        }
    }
}
