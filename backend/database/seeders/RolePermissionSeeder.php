<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Créer les permissions
        $permissions = [
            'manage-users',
            'manage-warehouses',
            'view-activity',
            'view-dashboard',
            'view-reports',
            'export',
            'movements.create',
            'transfers.create',
            'transfers.validate',
            'transfers.cancel',
            'transfers.receive',
            'inventories.create',
            'inventories.update',
            'inventories.adjust',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Créer les rôles + assigner permissions
        $admin = Role::firstOrCreate(['name' => 'administrateur']);
        $admin->syncPermissions(Permission::all());

        $gestionnaire = Role::firstOrCreate(['name' => 'gestionnaire']);
        $gestionnaire->syncPermissions([
            'view-dashboard', 'view-reports', 'export',
            'transfers.validate', 'transfers.cancel',
            'inventories.create', 'inventories.adjust',
        ]);

        $magasinier = Role::firstOrCreate(['name' => 'magasinier']);
        $magasinier->syncPermissions([
            'movements.create',
            'transfers.create', 'transfers.receive',
            'inventories.update',
        ]);

        $auditeur = Role::firstOrCreate(['name' => 'auditeur']);
        $auditeur->syncPermissions([
            'view-activity', 'view-reports', 'export', 'view-dashboard',
        ]);
    }
}