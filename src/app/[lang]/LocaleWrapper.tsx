// src/app/[lang]/LocaleWrapper.tsx

'use client'; // This component must be a Client Component

import React from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ScrollToTop from '../components/ScrollToTop';

// Define the component props
interface LocaleWrapperProps {
  children: React.ReactNode;
  lang: string;
}

/**
 * Client-side component to wrap the UI structure (Header, ThemeProvider, Footer)
 * This was moved out of [lang]/layout.tsx to satisfy Next.js's strict Server Component typing.
 */
const LocaleWrapper: React.FC<LocaleWrapperProps> = ({ children, lang }) => {
  return (
    <ThemeProvider
        attribute='class'
        enableSystem={false}
        defaultTheme='light'>
        {/* Pass the lang prop to Header for correct linking */}
        <Header lang={lang} /> 
        {children}
        <Footer />
        <ScrollToTop />
    </ThemeProvider>
  );
};

export default LocaleWrapper;