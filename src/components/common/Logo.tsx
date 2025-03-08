import { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo = ({ className = "h-8 w-auto", onClick }: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span 
        className="text-xl font-bold gradient-text"
        onClick={onClick}
      >
        oddKINGS
      </span>
    );
  }

  return (
    <img 
      src="/logo.png"
      alt="oddKINGS"
      className={`transition-all duration-200 opacity-0 ${className}`}
      onLoad={(e) => {
        e.currentTarget.classList.remove('opacity-0');
        e.currentTarget.classList.add('opacity-100');
      }}
      onError={() => setImageError(true)}
      onClick={onClick}
    />
  );
};
