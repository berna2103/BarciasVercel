'use client'

import { PlanType } from '@/app/types/plan'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useState } from 'react'
import PricingSkeleton from '../../Skeleton/Pricing'
import Link from 'next/link'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

// Define a minimal fallback item structure to prevent deep property access errors
const fallbackPlan = {
    type: 'Loading...',
    desc: 'Loading package details...',
    option: [],
    price_label: ' One-Time Fee',
    value_label: 'Estimated Value: $',
    save_label: ' (Save $',
    cta: 'Loading CTA'
};

interface PricingProps {
    dict: any;
}

const Pricing: React.FC<PricingProps> = ({ dict }) => {
  // CORRECTED: Safely access dict property.
  const dictPlan = dict?.plans?.[0] || fallbackPlan;

  // Since actual prices are constant and not translatable strings, hardcode them here 
  // and combine with the localized dictionary data.
  const item: PlanType & typeof fallbackPlan = {
      ...dictPlan,
      price: { monthly: 2000, yearly: 4500 }
  }
  const [loading, setLoading] = useState(false) 
  
  // Removed useEffect/fetch logic since data comes from dict

  const actualPrice = item.price.monthly; 
  const totalValue = item.price.yearly; 
  const savings = totalValue - actualPrice;

  if (loading || !dict) {
    // Show loading state if loading is true OR if dict is still undefined
    return (
        <section id='pricing' className='scroll-mt-12'>
            <div className='container'>
                <div className='text-center'>
                    <h2>{dict?.pricing?.title || 'Loading...'}</h2>
                    <p className='text-lg font-normal max-w-lg mx-auto my-6'>
                        {dict?.pricing?.subtitle || 'Loading content...'}
                    </p>
                </div>
                <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
                    <div className='bg-primary rounded-lg lg:col-span-1 md:col-span-2'>
                        <div className='flex lg:flex-col sm:flex-row flex-col justify-between w-full h-full'>
                            <div className='pl-8 pr-2.5 pt-14'>
                                <h3 className='lg:max-w-xs leading-10'>
                                    {dict?.pricing?.banner || 'Loading content...'}
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
                    {Array.from({ length: 1 }).map((_, i) => (
                        <PricingSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
  }

  return (
    <section id='pricing' className='scroll-mt-12'>
      <div className='container'>
        <div className='text-center'>
          <h2>{dict.pricing.title}</h2>
          <p className='text-lg font-normal max-w-lg mx-auto my-6'>
            {dict.pricing.subtitle}
          </p>
        </div>

        {/* Removed Toggle Button Section */}
        
        {/* grid layout - Simplified to focus on the single package */}
        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6'>
          {/* Card 1: Value Proposition Block */}
          <div className='bg-primary rounded-lg lg:col-span-1 md:col-span-2'>
            <div className='flex lg:flex-col sm:flex-row flex-col justify-between w-full h-full'>
              <div className='pl-8 pr-2.5 pt-14'>
                <h3 className='lg:max-w-xs leading-10'>
                   {dict.pricing.banner}
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
          
          {/* Card 2: The Single Pricing Card, spanning two columns on large screens */}
          <div className='lg:col-span-2'> 
            <div className='bg-white dark:bg-darkmode rounded-lg shadow-lg dark:shadow-neutral-50/10 border border-black/10 dark:border-white/10 px-7 py-10 h-full'>
              <div className='flex flex-col gap-6 border-b border-black/10 dark:border-white/10 pb-6'>
                <p className='text-2xl font-bold'>{item.type}</p>
                <p className='text-5xl font-bold text-lightdarkblue dark:text-white'>
                  ${actualPrice}
                  <span className='text-base font-normal text-lightgrey lowercase'>
                    {item.price_label}
                  </span>{' '}
                </p>
                {/* VALUE ANCHORING */}
                <p className='text-lg font-medium text-primary dark:text-primary'>
                  {item.value_label}{totalValue}{item.save_label}{savings}!)
                </p>
                <p className='text-base font-normal'>{item.desc}</p>
              </div>
              {/* options */}
              <div>
                <ul className='flex flex-col gap-6 my-6'>
                  {item.option.map((feat, i) => (
                    <li key={i}>
                      <div className='flex items-start gap-3'> 
                        <div className='p-1 rounded-full bg-primary/10 text-primary flex-shrink-0'>
                          <Icon
                            icon={'material-symbols:check-rounded'}
                            width={19}
                            height={19}
                          />
                        </div>
                        <p className='text-base font-normal'>{feat}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* CTA linking to contact form */}
              <Link href={'/#contact'}> 
                  <button className='bg-primary border border-primary py-3 w-full rounded-lg text-white hover:bg-transparent hover:text-primary hover:cursor-pointer duration-300'>
                      {item.cta}
                  </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
