<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::viaRequest('sanctum', function (Request $request) {
            $token = $request->bearerToken();

            if (! is_string($token) || $token === '') {
                return null;
            }

            if (! str_contains($token, '|')) {
                return null;
            }

            [$tokenId, $plainTextToken] = explode('|', $token, 2);

            $accessToken = PersonalAccessToken::query()->find($tokenId);

            if (! $accessToken || ! hash_equals($accessToken->token, hash('sha256', $plainTextToken))) {
                return null;
            }

            $accessToken->forceFill([
                'last_used_at' => now(),
            ])->save();

            return $accessToken->tokenable;
        });
    }
}
