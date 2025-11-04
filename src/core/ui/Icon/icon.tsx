import type { ComponentProps } from 'react';
import React, { forwardRef, type KeyboardEvent } from 'react';
import type { IconName, IconProps, IconSize, IconVariant } from './icon.types';
import { ICON_MAP } from './icon.config';

/**
 * Composant Icon réutilisable avec Tailwind CSS
 *
 * @example
 * ```tsx
 * <Icon name="home" />
 * <Icon name="settings" variant="primary" size="lg" />
 * <Icon name="user" onClick={() => console.log('clicked')} />
 * ```
 */
export const Icon = forwardRef<HTMLButtonElement | HTMLSpanElement, IconProps>(
  (
    {
      name,
      variant = 'grey',
      size = 'md',
      className = '',
      onClick,
      ariaLabel,
      title,
      disabled = false,
      id,
      'data-testid': dataTestId,
      ...rest
    },
    ref,
  ) => {
    // Vérifie que le nom de l'icône est valide
    if (!name || !(name in ICON_MAP)) {
      console.error(`Icon name is not valid. Available icons`);
      return null;
    }

    const IconComponent = ICON_MAP[name as IconName];
    // Détermine si l'icône est interactive
    const isInteractive = Boolean(onClick && !disabled);

    // Génère les classes Tailwind CSS
    const getIconClasses = (): string => {
      const baseClasses = 'inline-flex items-center justify-center transition-all duration-200';
      
      // Tailles
      const sizeClasses: Record<IconSize, string> = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
      };
      
      // Couleurs
      const variantClasses: Record<IconVariant, string> = {
        primary: 'text-primary',
        primaryLight: 'text-primary-light',
        red: 'text-danger',
        redLight: 'text-red-300',
        green: 'text-success',
        greenLight: 'text-green-300',
        yellow: 'text-warning',
        black: 'text-black',
        white: 'text-white',
        grey: 'text-gray-500',
        darkGrey: 'text-gray-700',
        lightGrey: 'text-gray-300',
        inherit: 'text-inherit',
        disabled: 'text-gray-400',
      };
      
      // Classes interactives
      const interactiveClasses = isInteractive
        ? 'cursor-pointer rounded p-0.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95'
        : '';
      
      // Classes désactivées
      const disabledClasses = disabled
        ? 'opacity-50 cursor-not-allowed'
        : '';
      
      const actualVariant = disabled ? 'disabled' : variant;
      
      return [
        baseClasses,
        sizeClasses[size],
        variantClasses[actualVariant],
        interactiveClasses,
        disabledClasses,
        className
      ]
        .filter(Boolean)
        .join(' ');
    };


    // Gestion des événements clavier pour l'accessibilité
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!onClick || disabled) return;

      // Activation avec Enter ou Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    };

    // Gestion du clic
    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    // Props communes
    const commonProps = {
      id,
      className: getIconClasses(),
      title,
      'data-testid': dataTestId,
      ...rest,
    };

    // Props d'accessibilité
    const accessibilityProps = {
      'aria-label': ariaLabel,
      'aria-disabled': disabled,
      ...(isInteractive && {
        role: 'button',
        tabIndex: disabled ? -1 : 0,
      }),
    };

    // Rendu de l'icône
    const renderIconElement = () => {
      return React.createElement(IconComponent, {
        className: 'w-full h-full',
        'aria-hidden': true,
      } as ComponentProps<typeof IconComponent>);
    };

    // Si l'icône est interactive, utilise un bouton
    if (isInteractive) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...commonProps}
          {...accessibilityProps}
        >
          {renderIconElement()}
        </button>
      );
    }

    // Sinon, utilise un span
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        {...commonProps}
        {...accessibilityProps}
      >
        {renderIconElement()}
      </span>
    );
  },
);

Icon.displayName = 'Icon';

// Hook personnalisé pour utiliser l'icône avec état
export const useIconState = (initialVariant: IconVariant = 'grey') => {
  const [variant, setVariant] = React.useState<IconVariant>(initialVariant);
  const [disabled, setDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const resetState = () => {
    setVariant(initialVariant);
    setDisabled(false);
    setLoading(false);
  };

  return {
    variant,
    setVariant,
    disabled,
    setDisabled,
    loading,
    setLoading,
    resetState,
  };
};

// Composants pré-configurés pour usage fréquent
export const IconButton = forwardRef<HTMLButtonElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props} onClick={props.onClick || (() => {})} />
  ),
);

IconButton.displayName = 'IconButton';

// Utilitaires de validation
export const isValidIconSize = (size: string): size is IconSize => {
  return ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(size);
};

export const isValidIconVariant = (variant: string): variant is IconVariant => {
  return [
    'primary',
    'primaryLight',
    'red',
    'redLight',
    'green',
    'greenLight',
    'yellow',
    'black',
    'white',
    'grey',
    'darkGrey',
    'lightGrey',
    'inherit',
    'disabled',
  ].includes(variant);
};

export default Icon;
