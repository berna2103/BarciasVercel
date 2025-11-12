// package/src/app/[lang]/page.tsx

import ContactForm from '../components/ContactForm'
import Hero from '../components/Home/Hero'
import Pricing from '../components/Home/Pricing'
import Project from '../components/Home/Project'
import Records from '../components/Home/Records'
import Review from '../components/Home/Review'
import Specialize from '../components/Home/Specialize'
import FAQ from '../components/Home/FAQ'
import { getDictionary } from '../i18n' // Imported utility

export default async function Home({ 
  params,
}: {
  // Explicitly define params as a Promise to resolve build constraint error
  params: Promise<{ lang: 'en' | 'es' }>;
}) {
  // Await the promise to get the actual language parameter, resolving the runtime error
  const { lang } = await params;

  // Fetch the correct dictionary based on the URL locale
  const dict = await getDictionary(lang); 
  
  return (
    <main>
      {/* Pass the dictionary down to components that need translated strings */}
      <Hero dict={dict} lang={lang} /> 
      <Project dict={dict}/>
      <Records dict={dict} />
      <Review dict={dict} />
      <Specialize dict={dict} />
      <Pricing dict={dict} />
      <FAQ dict={dict} />
      <ContactForm dict={dict}  /> 
    </main>
  )
}