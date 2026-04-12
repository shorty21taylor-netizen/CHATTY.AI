'use client';

import { forwardRef, Children, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none';

const variants = {
  default:
    'bg-[var(--emerald-bright)] text-[#06140e] shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_8px_24px_rgba(52,211,153,0.25)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_12px_32px_rgba(52,211,153,0.35)]',
  outline:
    'bg-transparent border border-[var(--dark-border)] text-[var(--text-bright)] hover:border-[var(--emerald-bright)] hover:text-[var(--emerald-bright)]',
  ghost:
    'bg-transparent text-[var(--text-bright)] hover:bg-white/5 hover:text-[var(--emerald-bright)]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef(function Button(
  {
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    children,
    ...props
  },
  ref
) {
  const classes = cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);

  if (asChild && isValidElement(Children.only(children))) {
    return cloneElement(children, {
      className: cn(children.props.className, classes),
      ref,
      ...props,
    });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export { Button };
