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
    'inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800';
  const sizeStyles = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' };
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm dark:bg-purple-500 dark:hover:bg-purple-600',
    outline:
      'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300',
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
