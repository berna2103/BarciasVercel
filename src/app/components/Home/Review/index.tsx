'use client'

import { useState } from 'react'
import { ReviewType } from '@/app/types/review'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ReviewSkeleton from '../../Skeleton/Review'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

interface ReviewProps {
    dict: any;
}

const Review: React.FC<ReviewProps> = ({ dict }) => {
  // CORRECTED: Use optional chaining (dict?.reviews) to safely access data
  const review: ReviewType[] = dict?.reviews || []
  const [loading, setLoading] = useState(false) 

  // Removed useEffect/fetch logic since data comes from dict

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 500,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const halfStars = rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStars

    return (
      <div className='flex items-center gap-0.5'>
        {[...Array(fullStars)].map((_, i) => (
          <Icon
            key={`full-${i}`}
            icon='tabler:star-filled'
            className='text-yellow-500 text-base'
          />
        ))}
        {halfStars > 0 && (
          <Icon
            key='half'
            icon='tabler:star-half-filled'
            className='text-yellow-500 text-base'
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Icon
            key={`empty-${i}`}
            icon='tabler:star-filled'
            className='text-gray-400 text-base'
          />
        ))}
      </div>
    )
  }

  return (
    <section className='bg-secondary dark:bg-darklight'>
      <div className='container'>
        <div className='mb-10 text-center'>
          {/* CORRECTED: Safely access dict property */}
          <h2>{dict?.review?.title}</h2>
        </div>
        {/* slider */}
        <Slider {...settings}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <ReviewSkeleton key={i} />
              ))
            : review.map((item, i) => (
                <div key={i}>
                  <div className='m-3 p-6 bg-white dark:bg-lightdarkblue rounded-lg'>
                    <div className='flex items-center gap-4 mb-5'>
                      <div className='relative'>
                        <Image
                          src={getFixedPath(item.imgSrc)}
                          alt={item.name}
                          width={48}
                          height={48}
                          className='rounded-full'
                        />
                        <div className='absolute bottom-0 right-0'>
                          <Image
                            src={getFixedPath('/images/banner/greentick.svg')}
                            alt='tick'
                            width={15}
                            height={15}
                          />
                        </div>
                      </div>
                      <div>
                        <h6>{item.name}</h6>
                        <div>
                          {renderStars(item.rating)} {/* Dynamic stars */}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className='text-base font-normal'>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
        </Slider>
      </div>
    </section>
  )
}

export default Review