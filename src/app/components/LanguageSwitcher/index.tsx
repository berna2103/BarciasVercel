// src/app/components/LanguageSwitcher/index.tsx
'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

// UPDATED: Removed 'pl'
const locales = [
  { locale: 'en', label: 'EN' },
  { locale: 'es', label: 'ES' },
];

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname(); // pathname can be null
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en'); 

  // Function to determine if a path already has a locale prefix
  const isLocaleInPath = (pathSegments: string[], supportedLocales: { locale: string }[]) => {
      return pathSegments.length > 0 && supportedLocales.some(l => l.locale === pathSegments[0]);
  };

  // Hydration fix: Determine the current locale safely after mounting
  useEffect(() => {
    // 💥 FIX: Check if pathname is null before attempting to split/filter
    if (!pathname) { 
        return; // Exit early if pathname is null
    }
      
    // Splits the path and filters out empty strings: ['', 'en', 'contact'] -> ['en', 'contact']
    const pathSegments = pathname.split('/').filter(Boolean);
    const localeSegment = pathSegments[0]; 

    // Check if the first segment is a recognized locale.
    if (locales.some(l => l.locale === localeSegment)) {
        setCurrentLocale(localeSegment);
    } else {
        // Fallback to default 'en'
        setCurrentLocale('en');
    }
  }, [pathname]);

  const handleLocaleChange = (newLocale: string) => {
    // 1. Get the current full path, including hash (anchors)
    const currentURL = window.location.pathname + window.location.hash;
    const [pathOnly, hash] = currentURL.split('#');
    
    // 2. Extract non-locale path segments
    const pathSegments = pathOnly.split('/').filter(Boolean);
    
    const remainingSegments = isLocaleInPath(pathSegments, locales) 
        ? pathSegments.slice(1) 
        : pathSegments;
    
    // 3. Reconstruct the new pathname: /newLocale/remaining/segments
    // We use .join('/') and clean any potential trailing slash
    let newPathname = `/${newLocale}/${remainingSegments.join('/')}`.replace(/\/+$/, '');
    
    // Ensure the root path remains clean (e.g., /en, not /en/)
    if (newPathname.endsWith('/') && remainingSegments.length === 0) {
        newPathname = newPathname.slice(0, -1);
    }

    // 4. Append the original hash/anchor
    const newPath = `${newPathname}${hash ? '#' + hash : ''}`;

    // Push the full new URL
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-primary dark:text-white border border-primary dark:border-white rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white duration-300"
      >
        {locales.find(l => l.locale === currentLocale)?.label || 'EN'}
        <Icon icon="ic:round-keyboard-arrow-down" width={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-darklight shadow-lg rounded-lg z-50">
          {locales.map(({ locale, label }) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className="block w-full text-left px-4 py-2 text-sm text-darkblue dark:text-white hover:bg-neutral-50 dark:hover:bg-darkmode/10 hover:text-primary dark:hover:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;