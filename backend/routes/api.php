<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\MovementController;
use App\Http\Controllers\Api\V1\TransferController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
| All endpoints are served under the /api/v1 prefix (per conception §4.2).
*/
Route::prefix('v1')->group(function () {

    // Public
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Authenticated (Sanctum token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/user', fn (Request $request) => $request->user());
        Route::post('/logout', [AuthController::class, 'logout']);

        /*
        | Role-protected resource routes are added here by the team, e.g.:
        |   Route::middleware('checkrole:administrateur')->group(function () {
        |       Route::apiResource('users', UserController::class);
        |       Route::apiResource('warehouses', WarehouseController::class);
        |   });
        |   Route::middleware('checkrole:gestionnaire,administrateur')->group(...);
        | Available role aliases: checkrole (custom), role / permission (Spatie).
        */

        /*
        |------------------------------------------------------------------
        | Othman — Controllers groupe 2 (stocks, mouvements, transferts,
        | inventaires, dashboard, rapports). Conception §4.2.
        |------------------------------------------------------------------
        */

        // Stocks (lecture pour tout authentifié)
        Route::get('/stocks', [StockController::class, 'index']);
        Route::get('/stocks/alerts', [StockController::class, 'alerts']);

        // Mouvements de stock
        Route::get('/movements', [MovementController::class, 'index']);
        Route::post('/movements', [MovementController::class, 'store'])
            ->middleware('permission:movements.create');

        // Transferts inter-entrepôts — cycle complet
        Route::get('/transfers', [TransferController::class, 'index']);
        Route::get('/transfers/{transfer}', [TransferController::class, 'show']);
        Route::post('/transfers', [TransferController::class, 'store'])
            ->middleware('permission:transfers.create');
        Route::put('/transfers/{transfer}', [TransferController::class, 'update'])
            ->middleware('permission:transfers.create');
        Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy'])
            ->middleware('permission:transfers.create');
        Route::post('/transfers/{transfer}/submit', [TransferController::class, 'submit'])
            ->middleware('permission:transfers.create');
        Route::post('/transfers/{transfer}/validate', [TransferController::class, 'validateTransfer'])
            ->middleware('permission:transfers.validate');
        Route::post('/transfers/{transfer}/receive', [TransferController::class, 'receive'])
            ->middleware('permission:transfers.receive');
        Route::post('/transfers/{transfer}/cancel', [TransferController::class, 'cancel'])
            ->middleware('permission:transfers.cancel');

        // Inventaires
        Route::get('/inventories', [InventoryController::class, 'index']);
        Route::get('/inventories/{inventory}', [InventoryController::class, 'show']);
        Route::post('/inventories', [InventoryController::class, 'store'])
            ->middleware('permission:inventories.create');
        Route::put('/inventories/{inventory}/items/{item}', [InventoryController::class, 'recordCount'])
            ->middleware('permission:inventories.update');
        Route::post('/inventories/{inventory}/close', [InventoryController::class, 'close'])
            ->middleware('permission:inventories.update|inventories.adjust');
        Route::post('/inventories/{inventory}/adjust', [InventoryController::class, 'adjust'])
            ->middleware('permission:inventories.adjust');

        // Dashboard & rapports
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->middleware('permission:view-dashboard');
        Route::get('/reports/{type}', [ReportController::class, 'show'])
            ->middleware('permission:view-reports');
    });
});
