// TODO: Créer le fichier tokens/colors.ts avec les couleurs du design system
// import { colors } from '../../../tokens/colors';

/**
 * Fonction helper pour générer les couleurs hover
 * @param baseColor - Couleur de base
 * @returns Couleur pour l'état hover
 */
export const getHoverColor = (baseColor: string): string => {
  // Cas spéciaux
  if (baseColor === 'inherit') return 'inherit';

  // Retourne la couleur originale pour l'instant
  // TODO: Implémenter le mapping des couleurs quand tokens/colors sera créé
  return baseColor;
};
