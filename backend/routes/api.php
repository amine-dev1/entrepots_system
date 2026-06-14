<?php

use App\Http\Controllers\AuthController;
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
    });
});
