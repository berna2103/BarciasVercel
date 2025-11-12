// src/app/components/Layout/Header/Navigation/HeaderLink.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavLinkType } from '@/app/types/navlink'

interface HeaderLinkProps { 
    item: NavLinkType;
    lang: string;
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ item, lang }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)

  const handleMouseEnter = () => {
    if (item.submenu) {
      setSubmenuOpen(true)
    }
  }

  const handleMouseLeave = () => {
    setSubmenuOpen(false)
  }

  const path = usePathname()

  // Helper function to prepend the locale to anchor links
  const getHref = (href: string) => {
    // Only prefix internal links starting with /#...
    return href.startsWith('/#') ? `/${lang}${href}` : href;
  };

  // FIX: Safely check if path is a string before calling startsWith
  const isActiveByPathPrefix = path 
    ? path.startsWith(`/${item.label.toLowerCase()}`)
    : false;

  return (
    <li
      className='relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <Link
        href={getHref(item.href)} 
        className={`text-base flex font-normal  text-darkblue dark:text-white hover:text-primary  dark:hover:text-primary  ${
          item.href === path ? '!text-primary dark:!text-primary' : null
        } ${
          // Use the safely calculated boolean variable
          isActiveByPathPrefix
            ? 'text-primary dark:!text-primary'
            : null
        } text-black hover:text-primary dark:text-white dark:hover:text-primary`}>
        {item.label}
        {item.submenu && (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1.5em'
            height='1.5em'
            viewBox='0 0 24 24'>
            <path
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
              d='m7 10l5 5l5-5'
            />
          </svg>
        )}
      </Link>
      {submenuOpen && (
        <ul className='absolute py-2 left-0 mt-0.5 w-60 bg-white  dark:bg-white/10 shadow-lg rounded-lg'>
          {item.submenu?.map((subItem, index) => (
            <li key={index}>
              <Link
                href={getHref(subItem.href)} 
                className='block px-4 py-2 text-darkblue dark:text-white hover:bg-neutral-50 dark:hover:bg-darkmode/10 hover:text-primary dark:hover:text-primary'>
                {subItem.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default HeaderLink