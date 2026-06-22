<?php

namespace App\Enums;

enum MovementType: string
{
    // Entrées
    case Achat = 'achat';
    case RetourFournisseur = 'retour_fournisseur';
    case AjustementEntree = 'ajustement_entree';
    case TransfertEntree = 'transfert_entree';

    // Sorties
    case Vente = 'vente';
    case Consommation = 'consommation';
    case Perte = 'perte';
    case AjustementSortie = 'ajustement_sortie';
    case TransfertSortie = 'transfert_sortie';

    /**
     * Movement types that decrease stock (sorties).
     *
     * @return array<int, self>
     */
    public static function sorties(): array
    {
        return [
            self::Vente,
            self::Consommation,
            self::Perte,
            self::AjustementSortie,
            self::TransfertSortie,
        ];
    }

    /**
     * Whether the given type (string or enum) is a stock decrease.
     */
    public static function isSortie(string|self $type): bool
    {
        $type = $type instanceof self ? $type : self::from($type);

        return in_array($type, self::sorties(), true);
    }

    /**
     * Whether this type is a stock increase (entrée).
     */
    public function isEntree(): bool
    {
        return ! self::isSortie($this);
    }
}
