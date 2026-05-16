<?php

namespace Laravel\Sanctum;

use App\Models\PersonalAccessToken;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;
use Laravel\Sanctum\NewAccessToken;

trait HasApiTokens
{
    public function tokens(): MorphMany
    {
        return $this->morphMany(PersonalAccessToken::class, 'tokenable');
    }

    public function createToken(string $name, array $abilities = ['*']): NewAccessToken
    {
        $plainTextToken = Str::random(40);

        $accessToken = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
        ]);

        return new NewAccessToken($accessToken, $accessToken->getKey().'|'.$plainTextToken);
    }
}