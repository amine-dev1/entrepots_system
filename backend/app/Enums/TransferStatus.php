<?php

namespace App\Enums;

enum TransferStatus: string
{
    case Brouillon = 'brouillon';
    case EnAttente = 'en_attente';
    case Valide = 'valide';
    case Recu = 'recu';
    case Annule = 'annule';

    /**
     * Allowed transitions from this status.
     *
     * @return array<int, self>
     */
    public function allowedNext(): array
    {
        return match ($this) {
            self::Brouillon => [self::EnAttente, self::Annule],
            self::EnAttente => [self::Valide, self::Annule],
            self::Valide    => [self::Recu, self::Annule],
            self::Recu, self::Annule => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedNext(), true);
    }
}
