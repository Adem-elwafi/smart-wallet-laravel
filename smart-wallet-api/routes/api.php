<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', 'App\\Http\\Controllers\\ProfileController@getProfile');
    Route::put('/profile', 'App\\Http\\Controllers\\ProfileController@updateProfile');

    Route::get('/wallets/my-wallet', 'App\\Http\\Controllers\\WalletController@getWallet');

    Route::prefix('transactions')->group(function () {
        Route::post('/transfer', 'App\\Http\\Controllers\\TransactionController@transfer');
        Route::post('/deposit', 'App\\Http\\Controllers\\TransactionController@deposit');
        Route::post('/withdraw', 'App\\Http\\Controllers\\TransactionController@withdraw');
        Route::get('/my-transactions', 'App\\Http\\Controllers\\TransactionController@getHistory');
    });
});