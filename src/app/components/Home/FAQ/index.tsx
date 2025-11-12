'use client'

import { Icon } from '@iconify/react'
import React, { useState } from 'react'

interface FAQProps {
  dict: any
}

const FAQ: React.FC<FAQProps> = ({ dict }) => {
  const faqList = dict?.faq?.list || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (faqList.length === 0) return null

  return (
    <section id='faq' className='scroll-mt-12 py-16'>
      <div className='container max-w-4xl'>
        <div className='text-center mb-10'>
          <h2>{dict.faq.title}</h2>
          <p className='text-lg font-normal max-w-xl mx-auto my-4 text-darkblue dark:text-white'>
            The top questions local trade professionals ask about owning their client pipeline.
          </p>
        </div>

        <div className='space-y-4'>
          {faqList.map((item: any, index: number) => (
            <div
              key={index}
              className='border border-gray-200 dark:border-white/10 rounded-lg shadow-md overflow-hidden'>
              {/* Question (Header) */}
              <button
                className='flex justify-between items-center w-full p-5 text-left text-lg font-semibold text-darkblue dark:text-white bg-white dark:bg-lightdarkblue hover:bg-gray-50 dark:hover:bg-darkmode transition-colors duration-300'
                onClick={() => handleToggle(index)}
                aria-expanded={openIndex === index}>
                {item.question}
                <Icon
                  icon='ic:round-keyboard-arrow-down'
                  width={24}
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Answer (Body) */}
              <div
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{ maxHeight: openIndex === index ? '500px' : '0' }}>
                <p className='p-5 pt-0 text-base font-normal text-lightgrey'>
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ