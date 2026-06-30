// components/ProgressBarProvider.tsx
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const customStyles = `
#nprogress .bar {
  background: linear-gradient(90deg, #f63bab, #c55cf6) !important;
  height: 4px !important;
  box-shadow: 0 0 10px #f63bab, 0 0 5px #f65cd7 !important;
}
#nprogress .spinner {
  display: none !important;
}
`;

export default function ProgressBarProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    NProgress.configure({ 
      minimum: 0.1,
      easing: 'ease',
      speed: 300,
      showSpinner: false,
      trickleSpeed: 200
    });

    // Handle link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        NProgress.start();
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.head.removeChild(styleElement);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    NProgress.start();
    
    const timer = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}