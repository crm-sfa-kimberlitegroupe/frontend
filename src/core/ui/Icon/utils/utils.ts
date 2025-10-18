import { colors } from '../../../tokens/colors';

/**
 * Fonction helper pour générer les couleurs hover
 * @param baseColor - Couleur de base
 * @returns Couleur pour l'état hover
 */
export const getHoverColor = (baseColor: string): string => {
  // Cas spéciaux
  if (baseColor === 'inherit') return 'inherit';

  // Mapping des couleurs principales vers leurs variantes light/dark
  const colorMap: Record<string, string> = {
    // Primary colors
    [colors.primary]: colors.primaryLight,
    [colors.primaryLight]: colors.primary,

    // Red colors
    [colors.red]: colors.redLight,
    [colors.redLight]: colors.red,

    // Green colors
    [colors.green]: colors.greenLight,
    [colors.greenLight]: colors.green,

    // Grayscale progression
    [colors.white]: colors.lightGrey,
    [colors.lightGrey]: colors.grey,
    [colors.grey]: colors.darkGrey,
    [colors.darkGrey]: colors.black,

    // Black stays darkGrey for better visibility
    [colors.black]: colors.darkGrey,
  };

  // Retourne la couleur mappée ou la couleur originale si pas de mapping
  return colorMap[baseColor] || baseColor;
};
