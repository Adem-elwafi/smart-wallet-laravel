<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'email' => $user->email,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\pN\s\'-]+$/u'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\pN\s\'-]+$/u'],
        ]);

        $user = $request->user();
        $user->firstname = trim(strip_tags($validated['firstname']));
        $user->lastname = trim(strip_tags($validated['lastname']));
        $user->save();

        return response()->json([
            'id' => $user->id,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'email' => $user->email,
        ]);
    }
}