import React from 'react';

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <rect x="10" y="20" width="8" height="60" />
        <rect x="25" y="30" width="8" height="50" />
        <rect x="40" y="25" width="8" height="55" />
        <rect x="55" y="35" width="8" height="45" />
        <rect x="70" y="40" width="8" height="40" />
        <rect x="85" y="45" width="8" height="35" />
      </g>
    </svg>
  );
}