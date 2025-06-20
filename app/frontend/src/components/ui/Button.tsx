import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right', // Default to right, consistent with original
  isLoading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-100 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5';
  const sizeStyles = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700',
    secondary:
      'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white shadow-lg hover:shadow-xl dark:from-secondary-500 dark:to-secondary-600 dark:hover:from-secondary-600 dark:hover:to-secondary-700',
    outline:
      'border-2 border-neutral-200 bg-transparent hover:border-primary-300 hover:bg-primary-50 text-neutral-700 dark:border-dark-200 dark:hover:border-primary-500 dark:hover:bg-primary-950 dark:text-dark-700',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 dark:hover:bg-dark-100 dark:text-dark-700',
  };

  const buttonClasses = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && 'w-full',
    isLoading && 'opacity-70 cursor-not-allowed', // General style for loading
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSpinner = () => (
    <svg
      className='animate-spin h-4 w-4 text-current'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  );

  const renderLeadingIcon = () => {
    if (isLoading && iconPosition === 'left') return renderSpinner();
    if (!isLoading && icon && iconPosition === 'left') return <span className={children ? 'mr-2' : ''}>{icon}</span>;
    return null;
  };

  const renderTrailingIcon = () => {
    if (isLoading && iconPosition === 'right') return renderSpinner();
    if (!isLoading && icon && iconPosition === 'right') return <span className={children ? 'ml-2' : ''}>{icon}</span>;
    return null;
  };

  return (
    <button className={buttonClasses} disabled={isLoading || props.disabled} {...props}>
      {renderLeadingIcon()}
      {!isLoading && children}
      {renderTrailingIcon()}
    </button>
  );
};

export default Button;
