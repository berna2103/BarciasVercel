'use client'

import { RecordType } from '@/app/types/record'
import Image from 'next/image'
import RecordSkeleton from '../../Skeleton/Record'
import { useState } from 'react'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

interface RecordsProps {
    dict: any;
}

const Records: React.FC<RecordsProps> = ({ dict }) => {
  // CORRECTED: Use optional chaining (dict?.records) to safely access data
  const record: RecordType[] = dict?.records || []
  const [Loading, setLoading] = useState(false) 

  // Removed useEffect/fetch logic since data comes from dict

  return (
    <section>
      <div className='container'>
        <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 items-center gap-6'>
          {Loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <RecordSkeleton key={i} />
              ))
            : record.map((item, i) => (
                <div key={i}>
                  <div className='border border-darkblue/10 dark:border-white/10 rounded-lg flex flex-col gap-4 items-center justify-center px-4 py-8 shadow dark:shadow-white/10'>
                    <div className='p-2 bg-primary rounded-full w-fit'>
                      <Image
                        src={getFixedPath(item.imgSrc)}
                        alt={item.imgSrc}
                        width={32}
                        height={32}
                      />
                    </div>
                    <h4 className='text-center'>
                      {item.digit}
                    </h4>
                    <p className='text-center text-base font-normal'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

export default Records