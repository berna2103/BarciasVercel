'use client'

import { SpecializeType } from '@/app/types/specialize'
import Image from 'next/image'
import { useState } from 'react'
import SpecializeSkeleton from '../../Skeleton/Specialize'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

interface SpecializeProps {
    dict: any;
}

const Specialize: React.FC<SpecializeProps> = ({ dict }) => {
  // CORRECTED: Use optional chaining (dict?.specialization_list) to safely access data
  const specialization: SpecializeType[] = dict?.specialization_list || []
  const [loading, setLoading] = useState(false) 

  // Removed useEffect/fetch logic since data comes from dict

  return (
    <section id='expertise' className='scroll-mt-12'>
      <div className='container'>
        <div className='text-center mb-8'>
          {/* CORRECTED: Safely access dict property */}
          <h2 className='mb-6'>{dict?.specialize?.title}</h2>
          <p className='text-lg font-normal max-w-2xl mx-auto'>
            {dict?.specialize?.subtitle}
          </p>
        </div>
        {/* */}
        <div className='grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6'>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SpecializeSkeleton key={i} />
              ))
            : specialization.map((item, i) => (
                <div key={i}>
                  <div className='bg-secondary dark:bg-darklight items-center rounded-lg p-8 h-72'>
                    <div className='p-3 rounded-lg bg-primary w-fit mb-8 shadow-lg shadow-primary/30'>
                      <Image
                        src={getFixedPath(item.imgSrc)}
                        alt={item.title}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <h5 className='font-bold mb-2'>{item.title}</h5>
                      <p className='font-normal'>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

export default Specialize