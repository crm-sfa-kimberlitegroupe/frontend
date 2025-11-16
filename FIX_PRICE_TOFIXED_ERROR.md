# Fix : Erreur `toFixed is not a function` sur les prix

## 🐛 Erreur
```
Uncaught TypeError: sku.priceHt?.toFixed is not a function
    at ProductHierarchy.tsx:602:43
```

## 🔍 Cause
**Prisma retourne les types `Decimal` comme des strings, pas des numbers**

### Schéma Prisma
```prisma
model SKU {
  priceHt   Decimal  // Type Decimal en base de données
  priceTtc  Decimal
  vatRate   Decimal
}
```

### Ce que reçoit le frontend
```typescript
{
  priceHt: "1500.00",   // ← String, pas number !
  priceTtc: "1788.75",  // ← String, pas number !
  vatRate: "19.25"      // ← String, pas number !
}
```

### Le problème dans le code
```typescript
// ❌ AVANT - Ne fonctionne pas
{sku.priceHt?.toFixed(2)} // TypeError: toFixed is not a function
```

## ✅ Solution implémentée

### 1. Mise à jour de l'interface TypeScript

**Fichier : `productHierarchy.service.ts`**

```typescript
export interface SKU {
  id: string;
  code: string;
  ean: string;
  shortDescription: string;
  fullDescription: string;
  packSizeId: string;
  photo?: string;
  priceHt: number | string; // ✅ Accepte string ou number
  priceTtc: number | string; // ✅ Accepte string ou number
  vatRate: number | string; // ✅ Accepte string ou number
  active: boolean;
  createdAt: string;
  updatedAt: string;
  packSize?: PackSize;
}
```

### 2. Conversion dans l'affichage

**Fichier : `ProductHierarchy.tsx`**

```typescript
// ✅ APRÈS - Fonctionne
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {Number(sku.priceHt || 0).toFixed(2)} FCFA
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {Number(sku.priceTtc || 0).toFixed(2)} FCFA
</td>
```

### 3. Conversion dans le formulaire

**Fichier : `SKUDialog.tsx`**

```typescript
// Lors du chargement d'un SKU pour modification
if (sku) {
  setFormData({
    code: sku.code,
    ean: sku.ean,
    shortDescription: sku.shortDescription,
    fullDescription: sku.fullDescription,
    packSizeId: sku.packSizeId,
    priceHt: Number(sku.priceHt), // ✅ Conversion string → number
    vatRate: Number(sku.vatRate), // ✅ Conversion string → number
    active: sku.active,
  });
}
```

## 📊 Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BASE DE DONNÉES (PostgreSQL)                            │
│    ↓                                                         │
│    Type: DECIMAL(10,2)                                      │
│    Valeur: 1500.00                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PRISMA (ORM)                                             │
│    ↓                                                         │
│    Conversion: Decimal → String                             │
│    Valeur: "1500.00"                                        │
│    Raison: Éviter les erreurs de précision en JavaScript   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND (NestJS)                                         │
│    ↓                                                         │
│    Type: string (Prisma Decimal)                            │
│    Valeur: "1500.00"                                        │
│    JSON: { "priceHt": "1500.00" }                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND (React)                                         │
│    ↓                                                         │
│    Reçoit: "1500.00" (string)                               │
│    ↓                                                         │
│    ✅ CONVERSION                                            │
│    Number("1500.00") → 1500.00 (number)                     │
│    ↓                                                         │
│    AFFICHAGE                                                │
│    (1500.00).toFixed(2) → "1500.00"                         │
│    ↓                                                         │
│    Résultat: "1500.00 FCFA" ✅                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Pourquoi Prisma retourne des strings ?

### Problème de précision JavaScript
```javascript
// ❌ Problème avec les nombres décimaux en JavaScript
0.1 + 0.2 === 0.3  // false ! (0.30000000000000004)

// ✅ Solution: Utiliser des strings
"0.1" + "0.2" = "0.3" // Précision préservée
```

### Avantages de la conversion string
1. **Précision** : Pas de perte de précision pour les calculs monétaires
2. **Sécurité** : Évite les erreurs d'arrondi
3. **Standard** : Pratique courante pour les APIs financières

## 🔧 Pattern de conversion recommandé

### Pour l'affichage
```typescript
// Toujours convertir avant d'utiliser toFixed()
{Number(value || 0).toFixed(2)}
```

### Pour les calculs
```typescript
// Utiliser une bibliothèque comme decimal.js ou big.js
import Decimal from 'decimal.js';

const price = new Decimal(sku.priceHt);
const vat = new Decimal(sku.vatRate);
const total = price.times(vat.div(100).plus(1));
```

### Pour les formulaires
```typescript
// Convertir à la réception
priceHt: Number(sku.priceHt)

// Envoyer comme number
const data = {
  priceHt: formData.priceHt, // number
  vatRate: formData.vatRate  // number
};
```

## 📝 Autres endroits à vérifier

Si vous avez d'autres composants qui affichent des prix, vérifiez qu'ils utilisent aussi `Number()` :

```typescript
// ✅ Bon
{Number(product.price).toFixed(2)}

// ❌ Mauvais
{product.price.toFixed(2)}

// ✅ Bon avec fallback
{Number(product.price || 0).toFixed(2)}
```

## 🧪 Tests effectués

1. **Affichage de la liste**
   - ✅ Les prix s'affichent correctement
   - ✅ Format: "1500.00 FCFA"
   - ✅ Pas d'erreur console

2. **Modification d'un SKU**
   - ✅ Les prix se chargent dans le formulaire
   - ✅ Conversion automatique string → number
   - ✅ Sauvegarde fonctionne

3. **Création d'un nouveau SKU**
   - ✅ Saisie des prix en tant que number
   - ✅ Affichage immédiat après création
   - ✅ Pas d'erreur

## 💡 Amélioration future

Créer une fonction utilitaire réutilisable :

```typescript
// utils/currency.ts
export function formatPrice(price: number | string | undefined): string {
  return `${Number(price || 0).toFixed(2)} FCFA`;
}

// Utilisation
{formatPrice(sku.priceHt)}
{formatPrice(sku.priceTtc)}
```
