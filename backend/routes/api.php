<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
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

        Route::get('warehouses',             [WarehouseController::class, 'index']);
        Route::get('warehouses/{warehouse}', [WarehouseController::class, 'show']);

        Route::get('categories',             [CategoryController::class, 'index']);
        Route::get('categories/{category}',  [CategoryController::class, 'show']);

        Route::get('products',           [ProductController::class, 'index']);
        Route::get('products/{product}', [ProductController::class, 'show']);

        /*
        | Role-protected resource routes are added here by the team, e.g.:
        |   Route::middleware('checkrole:administrateur')->group(function () {
        |       Route::apiResource('users', UserController::class);
        |       Route::apiResource('warehouses', WarehouseController::class);
        |   });
        |   Route::middleware('checkrole:gestionnaire,administrateur')->group(...);
        | Available role aliases: checkrole (custom), role / permission (Spatie).
        */

        Route::middleware('checkrole:administrateur')->group(function () {
            Route::get('users',              [UserController::class, 'index']);
            Route::post('users',             [UserController::class, 'store']);
            Route::put('users/{user}',       [UserController::class, 'update']);
            Route::get('users/{user}',       [UserController::class, 'show']);
            Route::post('users/{user}/toggle', [UserController::class, 'toggle']);


            Route::post('warehouses',              [WarehouseController::class, 'store']);
            Route::put('warehouses/{warehouse}',   [WarehouseController::class, 'update']);
            Route::delete('warehouses/{warehouse}',[WarehouseController::class, 'destroy']);
        });

        Route::middleware('checkrole:gestionnaire,administrateur')->group(function () {
            Route::post('categories',              [CategoryController::class, 'store']);
            Route::put('categories/{category}',    [CategoryController::class, 'update']);
            Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

            Route::post('products',           [ProductController::class, 'store']);
            Route::post('products/{product}', [ProductController::class, 'update']);
            Route::delete('products/{product}', [ProductController::class, 'destroy']);
        });
    });
});
