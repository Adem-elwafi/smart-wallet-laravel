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
            'image' => $user->image ?? null,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_if($user === null, 401, 'Unauthenticated.');

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\pN\s\'-]+$/u'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\pN\s\'-]+$/u'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'image' => ['nullable', 'string'],
        ]);

        $user->update([
            'firstname' => trim(strip_tags($validated['firstname'])),
            'lastname' => trim(strip_tags($validated['lastname'])),
            'email' => trim($validated['email']),
            'image' => $validated['image'] ?? $user->image,
        ]);

        $user->firstname = trim(strip_tags($validated['firstname']));
        $user->lastname = trim(strip_tags($validated['lastname']));
        $user->email = trim($validated['email']);
        $user->image = $validated['image'] ?? $user->image;
        $user->saveOrFail();

        $user->refresh();

        return response()->json([
            'id' => $user->id,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'image' => $user->image ?? null,
        ]);
    }
}