import Link from 'next/link'
import Image from 'next/image'

const getFixedPath = (path: string) => {
    return path.startsWith('/') ? path : `/${path}`;
};

interface LogoProps {
    lang: string; // Accept the lang prop
}

const Logo: React.FC<LogoProps> = ({ lang }) => {
  // Use the correct path to the logo.png inside the images/logo folder
  const logoPath = getFixedPath('/images/logo/logo.png'); 

  return (
    <Link href={`/${lang}`}> {/* Link back to the locale's root page */}
      {/* Light Mode Logo (using the uploaded PNG) */}
      <Image
        src={logoPath}
        alt='Barcias Tech Logo'
        width={180} // Set a reasonable intrinsic width
        height={32}  // Set a reasonable intrinsic height
        // Apply styling to constrain the size in the header
        className='w-auto max-h-14 block dark:hidden'        
      />
      
      {/* Dark Mode Logo (using the uploaded PNG, adjust styling if needed for dark mode contrast) */}
      <Image
        src={logoPath}
        alt='Barcias Tech Logo'
        width={180} // Maintain consistent intrinsic size
        height={32}
        // Apply styling to constrain the size in the header
        className='w-auto max-h-14 hidden dark:block'        
      />
    </Link>
  )
}

export default Logo