// Variantes de couleur disponibles basées sur le système de couleurs
export type IconVariant =
  | 'primary'
  | 'primaryLight'
  | 'red'
  | 'redLight'
  | 'green'
  | 'greenLight'
  | 'yellow'
  | 'black'
  | 'white'
  | 'grey'
  | 'darkGrey'
  | 'lightGrey'
  | 'inherit'
  | 'disabled';

// Liste stricte des noms d'icônes autorisés
export type IconName =
  | 'user'
  | 'chevronDown'
  | 'settings'
  | 'userCircle'
  | 'store'
  | 'home'
  | 'eye'
  | 'building'
  | 'refresh'
  | 'check'
  | 'checkCircle'
  | 'warning'
  | 'disk'
  | 'search'
  | 'fingerprint'
  | 'folder'
  | 'download'
  | 'cube'
  | 'sideMenuopen'
  | 'map'
  | 'locationMarker'
  | 'camera'
  | 'package'
  | 'cart'
  | 'note'
  | 'edit'
  | 'flag'
  | 'clock'
  | 'lightbulb'
  | 'chartBar'
  | 'calendar'
  | 'phone'
  | 'mail'
  | 'truck'
  | 'star'
  | 'plus'
  | 'minus'
  | 'x'
  | 'arrowLeft'
  | 'arrowRight';

// Tailles d'icônes disponibles
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Interface principale du composant Icon
export interface IconProps {
  /** Nom de l'icône à afficher */
  name: IconName;

  /** Variante de couleur (défaut: 'grey') */
  variant?: IconVariant;

  /** Taille de l'icône (défaut: 'md') */
  size?: IconSize;

  /** Classes CSS personnalisées */
  className?: string;

  /** Gestionnaire de clic */
  onClick?: () => void;

  /** Label pour l'accessibilité */
  ariaLabel?: string;

  /** Texte du tooltip */
  title?: string;

  /** État désactivé */
  disabled?: boolean;

  /** ID personnalisé */
  id?: string;

  /** Données de test */
  'data-testid'?: string;
}

