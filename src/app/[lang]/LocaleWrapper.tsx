// src/app/[lang]/LocaleWrapper.tsx

'use client'; 

import React from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ScrollToTop from '../components/ScrollToTop';
import Chatbot from '../components/Chatbot'; 

// Define the component props
interface LocaleWrapperProps {
  children: React.ReactNode;
  lang: string;
}

/**
 * Client-side component to wrap the UI structure (Header, ThemeProvider, Footer)
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
        {/* 💡 FIX: Pass the active language to the Chatbot */}
        <Chatbot lang={lang} /> 
        {/* <ScrollToTop /> */}
    </ThemeProvider>
  );
};

export default LocaleWrapper;