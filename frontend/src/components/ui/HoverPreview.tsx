'use client';

import { useState } from 'react';

interface HoverPreviewProps {
  children: React.ReactNode;
  preview: {
    title: string;
    description: string;
    essence?: string;
    features: string[];
  };
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HoverPreview({ children, preview, position = 'bottom' }: HoverPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => setIsVisible(false), 100);
    setTimeoutId(id);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 w-80 ${getPositionClasses()}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                {preview.title.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{preview.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{preview.description}</p>
              </div>
            </div>
            
            {preview.essence && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  💡 <span className="font-medium">Essence:</span> {preview.essence}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key Features</h5>
              <ul className="space-y-1">
                {preview.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
