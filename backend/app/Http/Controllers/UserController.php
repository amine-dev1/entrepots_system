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
            'nom'       => 'required|string|max:80',
            'prenom'    => 'required|string|max:80',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'role'      => 'nullable|string|exists:roles,name',
        ]);

        $user = User::create([
            'nom'       => $data['nom'],
            'prenom'    => $data['prenom'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'telephone' => $data['telephone'] ?? null,
            'actif'     => true,
        ]);

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
            'telephone' => 'nullable|string|max:20',
            'role'      => 'nullable|string|exists:roles,name',
        ]);

        $user->update($data);

        if (!empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json($user->fresh('roles'));
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
