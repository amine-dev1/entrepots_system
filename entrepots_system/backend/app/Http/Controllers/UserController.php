<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // display all users with role
    public function index()
    {
        $users = User::with('roles')->get();
        return response()->json($users);
    }


    //create user
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'                  => 'required|string|max:80',
            'prenom'               => 'required|string|max:80',
            'email'                => 'required|email|unique:users,email',
            'password'             => 'required|string|min:8',
            'password_confirmation' => 'required|string|same:password',
            'telephone'            => 'nullable|string|max:20',
            'role'                 => 'required|string|exists:roles,name',
        ]);

        // Clean data - only pass fillable fields to create
        $userData = [
            'nom'       => $data['nom'],
            'prenom'    => $data['prenom'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'telephone' => $data['telephone'] ?? null,
            'actif'     => true,
        ];

        $user = User::create($userData);

        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        return response()->json($user->load('roles'), 201);
    }


    //update user
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'nom'       => 'sometimes|string|max:80',
            'prenom'    => 'sometimes|string|max:80',
            'email'     => 'sometimes|email|unique:users,email,' . $user->id,
            'password'  => 'nullable|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'role'      => 'nullable|string|exists:roles,name',
        ]);

        // Remove password fields if empty
        if (empty($data['password'])) {
            unset($data['password']);
            unset($data['password_confirmation']);
        } else {
            $data['password'] = Hash::make($data['password']);
            unset($data['password_confirmation']);
        }

        $user->update($data);

        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json($user->fresh('roles'));
    }

    // delete user
    public function destroy(User $user)
    {
        try {
            $user->delete();
            return response()->json(['message' => 'Utilisateur supprimé.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // display one user with roule
    public function show(User $user)
    {
        return response()->json($user->load('roles'));
    }


    // change status user
    public function toggle(User $user)
    {
        $user->update(['actif' => !$user->actif]);

        return response()->json([
            'message' => $user->actif ? 'Utilisateur activé.' : 'Utilisateur désactivé.',
            'actif'   => $user->actif,
        ]);
    }
}
