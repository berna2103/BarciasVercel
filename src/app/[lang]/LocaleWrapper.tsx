// src/app/[lang]/LocaleWrapper.tsx

'use client'; 

import React from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ScrollToTop from '../components/ScrollToTop';
import Chatbot from '../components/Chatbot'; // <-- Import the new Chatbot component

// Define the component props
interface LocaleWrapperProps {
  children: React.ReactNode;
  lang: string;
}

const LocaleWrapper: React.FC<LocaleWrapperProps> = ({ children, lang }) => {
  return (
    <ThemeProvider
        attribute='class'
        enableSystem={false}
        defaultTheme='light'>
        <Header lang={lang} /> 
        {children}
        <Footer />
        {/* Add the Chatbot component here */}
        <Chatbot /> 
        {/* <ScrollToTop /> */}
    </ThemeProvider>
  );
};

export default LocaleWrapper;