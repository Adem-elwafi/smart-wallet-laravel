<?php

namespace Database\Factories;

use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_wallet_id' => Wallet::factory(),
            'receiver_wallet_id' => Wallet::factory(),
            'amount' => fake()->randomFloat(2, 1, 5000),
            'type' => 'TRANSFER',
            'description' => fake()->optional()->sentence(),
            'created_at' => now(),
        ];
    }

    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender_wallet_id' => null,
            'type' => 'DEPOSIT',
        ]);
    }

    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'receiver_wallet_id' => null,
            'type' => 'WITHDRAWAL',
        ]);
    }
}