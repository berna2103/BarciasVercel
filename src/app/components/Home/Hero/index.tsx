// src/app/components/Home/Hero/index.tsx

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { HeroType } from '@/app/types/hero'
import HeroSkeleton from '../../Skeleton/Hero'
import Link from 'next/link'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

// Define the expected props for translation
interface HeroProps {
  dict: { 
    hero: { 
      headline: string, 
      subHeadline: string, 
      primaryCta: string, 
      secondaryCta: string,
      // DYNAMIC WORDS KEYS
      dynamic_words_es?: string[], 
      static_prefix_es?: string,
      static_suffix_es?: string,
      dynamic_words_en?: string[], 
      static_prefix_en?: string,    
      static_suffix_en?: string,    
    } 
  };
  lang: string;
}

const Hero: React.FC<HeroProps> = ({ dict, lang }) => {
  const [heroimg, setHeroimg] = useState<HeroType[]>([])
  const [loading, setLoading] = useState(true)

  // --- DYNAMIC TEXT ROTATOR LOGIC ---
  // Select dynamic keys based on the current language
  const dynamicKey = `dynamic_words_${lang}` as 'dynamic_words_en' | 'dynamic_words_es';
  const prefixKey = `static_prefix_${lang}` as 'static_prefix_en' | 'static_prefix_es';
  const suffixKey = `static_suffix_${lang}` as 'static_suffix_en' | 'static_suffix_es';

  const words = dict.hero[dynamicKey] || [];
  const isDynamic = words.length > 0;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (!isDynamic) return;

    // Set interval to change the word every 2.5 seconds
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isDynamic, words.length]);
  // --- END DYNAMIC TEXT ROTATOR LOGIC ---


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setHeroimg(data.HeroData)
      } catch (error) {
        console.error('Error fetching service', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 500,
    cssEase: 'linear',
  }

  // Helper function to render the headline based on language mode
  const renderHeadline = () => {
    if (isDynamic) {
        const prefix = dict.hero[prefixKey];
        const suffix = dict.hero[suffixKey];
        
        return (
            // h1 has responsive alignment: text-center on mobile, lg:text-start on desktop
            <h1 className='lg:text-start text-center max-w-lg'>
                {prefix}
                <br className="sm:hidden" />
                {/* 1. h-20 is a safe height (80px) to prevent vertical clipping. 
                    2. my-0 removes extra vertical gap.
                */}
                <span className='block w-full h-20 relative overflow-hidden text-primary dark:text-primary my-0'> 
                  <span 
                      key={currentWordIndex}
                      // FIX ALIGNMENT & CLIPPING:
                      className={`absolute top-1/2 text-primary dark:text-primary transition-all duration-700 ease-in-out transform -translate-y-1/2 text-5xl md:text-6xl font-bold 
                          
                          /* Mobile Centering (Center the text span itself) */
                          left-1/2 -translate-x-1/2 
                          
                          /* Desktop Left-Alignment (Override centering) */
                          lg:left-0 lg:translate-x-0`}
                      style={{ whiteSpace: 'nowrap' }} // Prevents word from wrapping and clipping
                  >
                      {words[currentWordIndex]}
                  </span>
                </span>
                {suffix}
            </h1>
        );
    }
    // Fallback if dynamic keys are missing or not set up for the current language
    return (
        <h1 className='lg:text-start text-center max-w-lg'>
            {dict.hero.headline}
        </h1>
    );
  };


  return (
    <section>
      <div className='overflow-hidden'>
        <div className='container relative z-20 pt-24'>
          <div className='relative z-20 grid lg:grid-cols-12 grid-cols-1 items-center lg:justify-items-normal justify-items-center gap-20 pb-10'>
            <div className='lg:col-span-7 col-span-1'>
              <div className='flex flex-col lg:items-start items-center gap-12'>
                {/* RENDER DYNAMIC/STATIC HEADLINE */}
                {renderHeadline()}
                <h4 className='lg:text-start text-center text-primary dark:text-primary max-w-lg -mt-10'>
                  {dict.hero.subHeadline}
                </h4>
                {/* USE TRANSLATED CTAs WITH CORRECT DYNAMIC LINKING */}
                <div className='flex item-center gap-5'>
                  {/* Primary CTA: The Low-Commitment Lead Magnet, linking to #contact */}
                  <Link href={`/${lang}/#contact`}> 
                    <button className='px-6 py-3 md:px-12 md:py-3 text-sm md:text-base font-medium text-white border rounded-lg border-primary bg-primary hover:bg-transparent hover:text-primary hover:cursor-pointer duration-300'>
                      {dict.hero.primaryCta}
                    </button>
                  </Link>
                  {/* Secondary CTA: See The Offer, linking to #pricing */}
                  <Link href={`/${lang}/#pricing`}> 
                    <button className='px-6 py-3 md:px-12 md:py-3 text-sm md:text-base font-medium text-primary border rounded-lg border-primary bg-transparent hover:bg-primary hover:text-white hover:cursor-pointer duration-300'>
                      {dict.hero.secondaryCta}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            {/* slider */}
            <div className='lg:col-span-5 col-span-1 lg:w-full sm:w-[80%] w-full'>
              <div>
                <Slider {...settings}>
                  {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <HeroSkeleton key={i} />
                      ))
                    : heroimg.map((item, i) => (
                        <div key={i}>
                          <Image
                            src={getFixedPath(item.imgSrc)}
                            alt={item.imgSrc}
                            width={600}
                            height={420}
                            className='rounded-lg w-full'
                          />
                        </div>
                      ))}
                </Slider>
              </div>
            </div>
          </div>
          {/* floting images */}
          <div className='absolute top-16 -left-10  dark:opacity-10'>
            <Image
              src={getFixedPath('/images/banner/pattern1.svg')}
              alt='ptrn1'
              width={141}
              height={141}
            />
          </div>
          <div className='absolute bottom-0 left-[53%] dark:opacity-10 z-10'>
            <Image
              src={getFixedPath('/images/banner/pattern2.svg')}
              alt='ptrn1'
              width={141}
              height={141}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero