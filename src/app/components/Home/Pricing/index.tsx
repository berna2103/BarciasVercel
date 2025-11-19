'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useState } from 'react'
import PricingSkeleton from '../../Skeleton/Pricing'
import Link from 'next/link'

// Adjusted getFixedPath to ensure image paths are correct
const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

// Define a minimal fallback structure for the new investment_asset block
const fallbackInvestmentAsset = {
    title: 'Loading Investment Analysis...',
    subtitle: 'Loading content...',
    banner: 'Loading banner...',
    cta: 'Loading CTA',
    cost_comparison: [],
    guarantees_and_features_title: 'Loading Value Proposition...',
    guarantees_and_features_list: []
};

interface PricingProps {
    dict: any;
}

const InvestmentAsset: React.FC<PricingProps> = ({ dict }) => {
  // Access the new investment_asset block (or active_inversion for Spanish)
  const investmentData = dict?.investment_asset || dict?.activo_inversion || fallbackInvestmentAsset;

  const [loading, setLoading] = useState(false) 
  
  // NOTE: Loading state logic is simplified as data should come pre-loaded via dict

  if (loading || !dict || (!dict.investment_asset && !dict.activo_inversion)) {
    // Show loading state if loading is true OR if the new data structure is missing
    return (
        <section id='investment' className='scroll-mt-12'>
            <div className='container'>
                <div className='text-center'>
                    <h2>{investmentData.title}</h2>
                    <p className='text-lg font-normal max-w-lg mx-auto my-6'>
                        {investmentData.subtitle}
                    </p>
                </div>
                {/* Use the skeleton layout for loading */}
                <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
                    <div className='bg-primary rounded-lg lg:col-span-1 md:col-span-2'>
                        {/* ... (Existing image block) ... */}
                    </div>
                    {Array.from({ length: 1 }).map((_, i) => (
                        <PricingSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
  }

  return (
    // Change ID from 'pricing' to 'investment' for semantic clarity
    <section id='investment' className='scroll-mt-12'>
      <div className='container'>
        <div className='text-center'>
          <h2>{investmentData.title}</h2>
          <p className='text-lg font-normal max-w-lg mx-auto my-6'>
            {investmentData.subtitle}
          </p>
        </div>

        {/* New Grid Layout for Cost/Asset Comparison */}
        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
          
          {/* Card 1: Value Proposition Block (Left Column) */}
          <div className='bg-primary rounded-lg lg:col-span-1 md:col-span-2'>
            <div className='flex lg:flex-col sm:flex-row flex-col justify-between w-full h-full'>
              <div className='pl-8 pr-2.5 pt-14'>
                {/* Reusing the banner content as a strong headline */}
                <h3 className='lg:max-w-xs leading-10'>
                   {investmentData.title}
                </h3>
              </div>
              <div>
                <Image
                  src={getFixedPath('/images/pricing/actor.webp')}
                  alt='actor'
                  width={360}
                  height={380}                
                />
              </div>
            </div>
          </div>
          
          {/* Card 2: ROI Analysis and Features (Right Column) */}
          <div className='lg:col-span-2'> 
            <div className='bg-white dark:bg-darkmode rounded-lg shadow-lg dark:shadow-neutral-50/10 border border-black/10 dark:border-white/10 px-7 py-10 h-full'>
              
              {/* === COST COMPARISON / ROI ANALYSIS === */}
              <div className='border-b border-black/10 dark:border-white/10 pb-6 mb-6'>
                <h3 className='text-3xl font-bold mb-4'>
                    {dict.pricing?.banner || investmentData.title}
                </h3>
                
                {investmentData.cost_comparison?.map((item: any, i: number) => (
                    <div key={i} className={`flex justify-between items-center py-4 ${i === 0 ? 'border-b border-black/10 dark:border-white/10' : ''}`}>
                        <div>
                            <p className='text-lg font-bold'>{item.headline}</p>
                            <p className='text-sm font-normal text-gray-500 dark:text-gray-400'>{item.description}</p>
                        </div>
                        <p className='text-xl font-extrabold text-lightdarkblue dark:text-primary flex-shrink-0 ml-4'>
                            {item.value}
                        </p>
                    </div>
                ))}
              </div>
              
              {/* === GUARANTEES & ASSET COMPONENTS (Features) === */}
              <h3 className='text-xl font-bold mt-6 mb-4'>{investmentData.guarantees_and_features_title}</h3>
              <div>
                <ul className='flex flex-col gap-4 my-4'>
                  {investmentData.guarantees_and_features_list?.map((feat: string, i: number) => (
                    <li key={i}>
                      <div className='flex items-start gap-3'> 
                        <div className='p-1 rounded-full bg-primary/10 text-primary flex-shrink-0'>
                          <Icon
                            icon={'material-symbols:check-rounded'}
                            width={19}
                            height={19}
                          />
                        </div>
                        <p className={`text-base font-normal ${i < 2 ? 'font-bold' : ''}`}>{feat}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* CTA linking to contact form */}
              <Link href={'/#contact'}> 
                  <button className='bg-primary border border-primary py-3 w-full rounded-lg text-white hover:bg-transparent hover:text-primary hover:cursor-pointer duration-300 mt-6'>
                      {investmentData.cta}
                  </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// NOTE: Rename the export to reflect the new functionality
export default InvestmentAsset