'use client';

import React from 'react';

interface TopBarProps {
  text?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  text = 'Cash on delivery nationwide · Free delivery in Dhaka over ৳5,000 · 7-day free exchanges',
}) => {
  return (
    <div className="w-full bg-ink-900 text-paper text-xs py-2 px-4 text-center tracking-wide font-normal select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <span>{text}</span>
      </div>
    </div>
  );
};
