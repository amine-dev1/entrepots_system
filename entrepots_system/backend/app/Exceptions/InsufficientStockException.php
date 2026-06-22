<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(string $message = 'Stock disponible insuffisant pour ce mouvement.')
    {
        parent::__construct($message);
    }
}
