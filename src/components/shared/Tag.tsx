
import React from 'react';

interface TagProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  category?: string;
  disabled?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  label,
  isSelected,
  onClick,
  category = 'default',
  disabled = false
}) => {
  const getSelectedColor = () => {
    switch (category) {
      case 'workout':
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'mindfulness':
        return 'bg-gradient-to-r from-purple-500 to-violet-500';
      case 'reading':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'hydration':
        return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      case 'sleep':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case 'social':
        return 'bg-gradient-to-r from-pink-500 to-rose-500';
      case 'screenTime':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'creative':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'productivity':
        return 'bg-gradient-to-r from-orange-500 to-amber-500';
      case 'selfCare':
        return 'bg-gradient-to-r from-rose-400 to-pink-500';
      default:
        return 'bg-[#f0a742]';
    }
  };

  return (
    <button 
      className={`px-3 py-1 rounded-full text-sm transition-all ${
        isSelected 
          ? `${getSelectedColor()} text-white font-medium shadow-lg scale-105` 
          : 'bg-[#1a2e25] text-gray-300 hover:bg-[#243b31]'
      } ${disabled ? 'opacity-80 cursor-default' : 'cursor-pointer'}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
