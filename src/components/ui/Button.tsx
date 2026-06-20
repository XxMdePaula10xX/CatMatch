import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { soundManager } from '../../services/soundManager';

type Variant = 'green' | 'blue' | 'pink' | 'purple' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  small?: boolean;
  icon?: boolean;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  green: '',
  blue: 'btn--blue',
  pink: 'btn--pink',
  purple: 'btn--purple',
  ghost: 'btn--ghost',
};

/** Big, glossy mobile-game button with a click sound. */
export function Button({
  variant = 'green',
  block,
  small,
  icon,
  children,
  className = '',
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        'btn',
        variantClass[variant],
        block ? 'btn--block' : '',
        small ? 'btn--sm' : '',
        icon ? 'btn--icon' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        soundManager.play('button');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
