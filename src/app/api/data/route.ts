// src/app/api/data/route.ts

import { NextResponse } from 'next/server'

import { NavLinkType } from '@/app/types/navlink'
import { ProjectType } from '@/app/types/project'
import { RecordType } from '@/app/types/record'
import { ReviewType } from '@/app/types/review'
import { SpecializeType } from '@/app/types/specialize'
import { PlanType } from '@/app/types/plan'
import { CategoryType } from '@/app/types/category'
import { FooterLinkType } from '@/app/types/footerlinks'
import { HeroType } from '@/app/types/hero'

const HeroData: HeroType[] = [
  {
    imgSrc: '/images/banner/blogforgeCover.jpg',
  },
  {
    imgSrc: '/images/banner/gleamerCover.jpg',
  },
  {
    imgSrc: '/images/banner/learnaxisCover.jpg',
  },
  {
    imgSrc: '/images/banner/studiovaCover.jpg',
  },
]

const NavLinkData: NavLinkType[] = [
  {
    label: 'Our Work',
    href: '/#project',
  },
  {
    label: 'Expertise',
    href: '/#expertise',
  },
  {
    label: 'The $2K Offer',
    href: '/#pricing',
  },
  {
    label: 'Our Promise',
    href: '/#review',
  },
]

const ProjectData: ProjectType[] = [
  {
    coverImg: '/images/project/4.jpeg',
    name: 'Hair Salon Demo',
  },
  {
    coverImg: '/images/project/2.jpeg',
    name: 'Taekwondo Demo',
  },
  {
    coverImg: '/images/project/1.jpeg',
    name: 'Landscaper Demo',
  },
  {
    coverImg: '/images/project/3.jpeg',
    name: 'General Contractor Demo',
  },
  {
    coverImg: '/images/project/5.jpeg',
    name: 'SaaS Demo',
  },
  {
    coverImg: '/images/project/3.jpeg',
    name: 'Roofer Demo',
  }
]

const RecordData: RecordType[] = [
  {
    imgSrc: '/images/records/star.svg',
    digit: '40+ Qualified Jobs/Mo', 
    desc: 'Average high-value service calls generated for our local Plumbing, HVAC, and Landscaping clients.', 
  },
  {
    imgSrc: '/images/records/user.svg',
    digit: '12+ Trade Pros Launched', 
    desc: 'Websites launched for real Plumbers, Electricians, and General Subcontractors ready to scale.',
  },
  {
    imgSrc: '/images/records/cart.svg',
    digit: '90% Mobile Traffic', 
    desc: 'Mobile-First Design—targeting customers searching for urgent help on their phones.', 
  },
  {
    imgSrc: '/images/records/star.svg',
    digit: '5.0 Google Avg.',
    desc: 'Strategies focused on showcasing and generating verified 5-star Google reviews from job sites.',
  },
];


// REMOVED: ReviewData array from API since it's now dictionary-driven mock content.
// const ReviewData: ReviewType[] = [...]


const SpecializeData: SpecializeType[] = [
  {
    imgSrc: '/images/specialization/webdesign.svg',
    title: 'The "Get-Called-Now" Mobile Site', 
    desc: 'A site built for job urgency. Your phone number is a big, clickable button that loads perfectly even with bad 4G service on a job site.',
  },
  {
    imgSrc: '/images/specialization/logodesign.svg',
    title: 'Instant Fleet & Uniform Identity', 
    desc: 'Includes a clean logo and brand kit, making your vans and uniforms look more established than the competition.',
  },
  {
    imgSrc: '/images/specialization/seooptimize.svg',
    title: 'Dominate the Google Map Pack', 
    desc: 'We optimize your Google Business Profile and website to dominate the 3-Pack for local searches ("Electricians near me").',
  },
  {
    imgSrc: '/images/specialization/contentwrite.svg',
    title: 'High-Value Service Copywriting', 
    desc: 'Content focused on high-profit work (e.g., re-piping, foundation repair) using the exact keywords customers search for.',
  },
  {
    imgSrc: '/images/specialization/digitalmarketing.svg',
    title: 'Automated 5-Star Review Funnel', 
    desc: 'Simple text-message or email links after every job to automatically collect positive 5-star Google reviews, building unshakeable local trust.',
  },
  {
    imgSrc: '/images/specialization/mobileapp.svg',
    title: 'No Tech Headaches, Ever', 
    desc: 'We handle hosting, security, and updates. Your site is running 24/7, so you never have to worry about a "broken website."',
  },
]

const PlanData: PlanType[] = [
  {
    type: 'The Local Pro Lead Engine',
    price: {
      monthly: 2000,
      yearly: 4500, // Used as the "Estimated Value" for anchoring
    },
    desc: 'Your one-time investment for a professional, 3-in-1 website that starts generating high-quality local leads immediately. Stop paying for expensive lead generation platforms.',
    option: [
      'High-Converting, Mobile-First 3-Page Website (Home, Services, Contact)',
      '100% Ownership of Domain and Code',
      'Free Domain & SSL Certificate for 1 Year',
      'Google Business Profile Setup & Local SEO Optimization',
      'Integration of Customer Review Widgets (Google/Yelp)',
      'FREE Physical Branding Kit: 15 Custom Branded T-Shirts (M/L) & 100 Business Cards',
      'Direct Contact Form Integrated with Your Email/CRM',
      'Guaranteed Launch within 14 Business Days',
    ],
  },
]

const CategoryData: CategoryType[] = [
  {
    imgSrc: '/images/category/webdev.webp',
    title: 'Web Design',
  },
  {
    imgSrc: '/images/category/logods.webp',
    title: 'Logo Design',
  },
  {
    imgSrc: '/images/category/mobileapp.webp',
    title: 'Mobile App Development',
  },
  {
    imgSrc: '/images/category/contentwrite.webp',
    title: 'Content Writing',
  },
  {
    imgSrc: '/images/category/digitalmarket.webp',
    title: 'Digital Marketing',
  },
]

const FooterLinkData: FooterLinkType[] = [
  {
    section: 'Company',
    links: [
      {
        label: 'Projects',
        href: '/#project',
      },
      {
        label: 'Expertise',
        href: '/#expertise',
      },
      {
        label: 'Pricing',
        href: '/#pricing',
      },
      {
        label: 'Our Promise',
        href: '/#review',
      },
    ],
  },
  {
    section: 'Support',
    links: [
      { label: 'Help center', href: '/' },
      { label: 'Terms of service', href: '/' },
      { label: 'Legal', href: '/' },
      { label: 'Privacy Policy', href: '/' },
    ],
  },
]

export const GET = () => {
  return NextResponse.json({
    HeroData,
    NavLinkData,
    ProjectData,
    RecordData,
    // ReviewData, // Removed
    SpecializeData,
    PlanData,
    CategoryData,
    FooterLinkData,
  })
}