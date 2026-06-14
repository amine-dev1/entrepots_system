<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Ref
{
    /**
     * Generate the next sequential reference for a given prefix, e.g.
     * Ref::next('MVT', 'stock_movements') => "MVT-2026-000001".
     *
     * Relies on the surrounding transaction / row lock for concurrency safety.
     */
    public static function next(string $prefix, string $table, string $column = 'reference'): string
    {
        $year = date('Y');
        $like = "{$prefix}-{$year}-%";

        $last = DB::table($table)
            ->where($column, 'like', $like)
            ->orderByDesc($column)
            ->value($column);

        $seq = $last ? ((int) substr($last, -6)) + 1 : 1;

        return sprintf('%s-%s-%06d', $prefix, $year, $seq);
    }
}
