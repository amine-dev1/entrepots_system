<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AccessController extends Controller
{
    /**
     * Catalogue des permissions : libellé FR + groupe, pour l'affichage.
     */
    private const CATALOG = [
        'view-dashboard'     => ['Tableau de bord', 'Voir le tableau de bord'],
        'manage-users'       => ['Utilisateurs',    'Gérer les utilisateurs et leurs accès'],
        'manage-warehouses'  => ['Entrepôts',       'Créer, modifier et supprimer des entrepôts'],
        'manage-catalogue'   => ['Catalogue',       'Gérer les produits et les catégories'],
        'movements.create'   => ['Mouvements',      'Enregistrer un mouvement de stock'],
        'transfers.create'   => ['Transferts',      'Créer un transfert'],
        'transfers.validate' => ['Transferts',      'Valider un transfert'],
        'transfers.receive'  => ['Transferts',      'Réceptionner un transfert'],
        'transfers.cancel'   => ['Transferts',      'Annuler un transfert'],
        'inventories.create' => ['Inventaires',     'Démarrer une session d\'inventaire'],
        'inventories.update' => ['Inventaires',     'Saisir un comptage'],
        'inventories.adjust' => ['Inventaires',     'Ajuster le stock après inventaire'],
        'view-reports'       => ['Rapports',        'Consulter les rapports'],
        'export'             => ['Rapports',        'Exporter les données (PDF / Excel)'],
        'view-activity'      => ['Journal',         'Consulter le journal d\'activité'],
    ];

    /**
     * Liste de toutes les permissions, enrichies (label + groupe).
     */
    public function permissions()
    {
        $perms = Permission::orderBy('name')->pluck('name')->map(function ($name) {
            [$group, $label] = self::CATALOG[$name] ?? ['Autres', $name];
            return ['name' => $name, 'label' => $label, 'group' => $group];
        });

        return response()->json($perms->values());
    }

    /**
     * Les 4 rôles avec leurs permissions.
     */
    public function roles()
    {
        $roles = Role::with('permissions:id,name')->orderBy('id')->get()
            ->map(fn ($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => $role->users()->count(),
            ]);

        return response()->json($roles);
    }

    /**
     * Met à jour les permissions d'un rôle (sync).
     */
    public function updateRole(Request $request, Role $role)
    {
        $data = $request->validate([
            'permissions'   => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $role->syncPermissions($data['permissions']);

        ActivityLogger::log(
            'modification',
            "Mise à jour des permissions du rôle « {$role->name} »",
            null,
            ['permissions' => $data['permissions']]
        );

        return response()->json([
            'id'          => $role->id,
            'name'        => $role->name,
            'permissions' => $role->permissions()->pluck('name')->values(),
        ]);
    }

    /**
     * Accès d'un utilisateur : rôles, permissions directes, permissions effectives.
     */
    public function userAccess(User $user)
    {
        return response()->json([
            'user' => [
                'id'     => $user->id,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'email'  => $user->email,
            ],
            'roles'              => $user->getRoleNames()->values(),
            'direct_permissions' => $user->getDirectPermissions()->pluck('name')->values(),
            'all_permissions'    => $user->getAllPermissions()->pluck('name')->values(),
            // Périmètre entrepôts (vide = accès à tous).
            'warehouses'         => $user->warehouses()->pluck('warehouses.id')->values(),
        ]);
    }

    /**
     * Synchronise les rôles ET les permissions directes d'un utilisateur.
     */
    public function updateUserAccess(Request $request, User $user)
    {
        $data = $request->validate([
            'roles'         => ['present', 'array'],
            'roles.*'       => ['string', Rule::exists('roles', 'name')],
            'permissions'   => ['present', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'warehouses'    => ['present', 'array'],
            'warehouses.*'  => ['uuid', Rule::exists('warehouses', 'id')],
        ]);

        $user->syncRoles($data['roles']);
        $user->syncPermissions($data['permissions']); // permissions directes (hors rôle)
        $user->warehouses()->sync($data['warehouses']); // périmètre de données

        ActivityLogger::log(
            'modification',
            "Mise à jour des accès de {$user->prenom} {$user->nom}",
            $user,
            ['roles' => $data['roles'], 'permissions' => $data['permissions'], 'warehouses' => $data['warehouses']]
        );

        return response()->json([
            'roles'              => $user->getRoleNames()->values(),
            'direct_permissions' => $user->getDirectPermissions()->pluck('name')->values(),
            'all_permissions'    => $user->fresh()->getAllPermissions()->pluck('name')->values(),
            'warehouses'         => $user->warehouses()->pluck('warehouses.id')->values(),
        ]);
    }
}
