// src/utils/staticContent.ts

interface ContentSection {
  title: string;
  type: 'paragraph' | 'list' | 'heading';
  content?: string | ContentSection[];
}

interface StaticContent {
  title: string;
  sections: ContentSection[];
}

const STATIC_CONTENT_DATA: Record<string, Record<'en' | 'es', StaticContent>> = {
  'terms-of-service': {
    en: {
      title: 'Terms of Service',
      sections: [
        {
          title: '1. Services Provided (The Local Pro Lead Engine)',
          type: 'heading',
          content: [
            {
              title: 'Project Scope:',
              type: 'paragraph',
              content: 'The service is defined as the "Local Pro Lead Engine," delivered for a One-Time Fee of $2,000. This includes the creation and deployment of a High-Converting, Mobile-First 3-Page Website (Home, Services, Contact), optimization of the Google Business Profile (GBP), and delivery of the physical branding kit.'
            },
            {
              title: 'Timeline:',
              type: 'paragraph',
              content: 'The project goal is to Go Live in 14 Business Days or less from the date all necessary client materials (content, images, access) are provided.'
            },
            {
              title: 'Client Materials:',
              type: 'paragraph',
              content: 'The client is responsible for providing all necessary text, logos, high-resolution images, and access credentials (e.g., domain registrar, GBP access) required to complete the work. Delays in providing materials will extend the project timeline.'
            }
          ]
        },
        {
          title: '2. The 30-Day Performance Guarantee',
          type: 'heading',
          content: [
            {
              title: 'Guarantee Terms:',
              type: 'paragraph',
              content: 'We guarantee the new digital asset will generate at least one qualified inbound call or form submission (a "Qualified Lead") within the first 30 days following the live launch.'
            },
            {
              title: 'Remedy for Failure:',
              type: 'paragraph',
              content: 'If the Guarantee is not met, the Company will waive our hypothetical maintenance fees (if any) or continue to work on optimizing the asset at no additional cost until a Qualified Lead is delivered.'
            },
            {
              title: 'Scope Limitation:',
              type: 'paragraph',
              content: 'The Guarantee applies solely to the delivery of the initial Qualified Lead and is not a guarantee of sales, revenue, or the achievement of the 40+ Qualified Jobs/Mo target.'
            },
          ]
        },
        {
          title: '3. Ownership and Intellectual Property',
          type: 'heading',
          content: [
            {
              title: 'Client Ownership:',
              type: 'paragraph',
              content: 'Upon final payment of the $2,000 fee, the client retains 100% Ownership of the Domain and Code related to the final website.'
            },
            {
              title: 'Company Rights:',
              type: 'paragraph',
              content: 'The Company retains the right to use the completed project in its portfolio and marketing materials for case studies and promotional purposes.'
            },
          ]
        },
        {
          title: '4. Post-Project Services and Termination',
          type: 'heading',
          content: [
            {
              title: 'Hosting:',
              type: 'paragraph',
              content: 'A Free Domain & SSL Certificate is provided for 1 Year. After the first year, the client will be responsible for standard ongoing costs for hosting, maintenance, and domain renewal, or may contract an ongoing support agreement with the Company.'
            },
            {
              title: 'Refunds:',
              type: 'paragraph',
              content: 'Due to the custom digital asset creation and upfront work involved, the $2,000 service fee is non-refundable, except as explicitly provided by the 30-Day Performance Guarantee.'
            }
          ]
        },
        {
          title: '5. Contact Information',
          type: 'paragraph',
          content: 'For any questions regarding these Terms, please contact us at sales@barciastech.com.'
        }
      ]
    },
    es: {
      title: 'Términos de Servicio',
      sections: [
        {
          title: '1. Servicios Proporcionados (El Motor de Leads Pro Local)',
          type: 'heading',
          content: [
            {
              title: 'Alcance del Proyecto:',
              type: 'paragraph',
              content: 'El servicio se define como el "Motor de Leads Pro Local", entregado por una Tarifa Única de $2,000. Esto incluye la creación y despliegue de un Sitio Web de 3 Páginas de Alta Conversión y Mobile-First (Inicio, Servicios, Contacto), optimización del Perfil de Negocio de Google (GBP), y la entrega del kit de marca física.'
            },
            {
              title: 'Plazo:',
              type: 'paragraph',
              content: 'El objetivo del proyecto es estar en línea en 14 Días Hábiles o menos a partir de la fecha en que se proporcionen todos los materiales necesarios del cliente (contenido, imágenes, accesos).'
            },
            {
              title: 'Materiales del Cliente:',
              type: 'paragraph',
              content: 'El cliente es responsable de proporcionar todo el texto, logotipos, imágenes de alta resolución y credenciales de acceso necesarios (ej. registrador de dominio, acceso a GBP) para completar el trabajo. Los retrasos en la entrega de materiales extenderán el plazo del proyecto.'
            }
          ]
        },
        {
          title: '2. La Garantía de Rendimiento de 30 Días',
          type: 'heading',
          content: [
            {
              title: 'Términos de la Garantía:',
              type: 'paragraph',
              content: 'Garantizamos que el nuevo activo digital generará al menos una llamada o formulario de contacto calificado (un "Lead Calificado") dentro de los primeros 30 días posteriores al lanzamiento en vivo.'
            },
            {
              title: 'Compensación por Fallo:',
              type: 'paragraph',
              content: 'Si no se cumple la Garantía, la Compañía renunciará a nuestras tarifas de mantenimiento hipotéticas (si las hubiera) o continuará trabajando en la optimización del activo sin costo adicional hasta que se entregue un Lead Calificado.'
            },
            {
              title: 'Limitación del Alcance:',
              type: 'paragraph',
              content: 'La Garantía se aplica únicamente a la entrega del Lead Calificado inicial y no es una garantía de ventas, ingresos o el logro del objetivo de 40+ Trabajos Calificados/Mes.'
            },
          ]
        },
        {
          title: '3. Propiedad y Propiedad Intelectual',
          type: 'heading',
          content: [
            {
              title: 'Propiedad del Cliente:',
              type: 'paragraph',
              content: 'Al pagar la tarifa final de $2,000, el cliente conserva el 100% de la Propiedad del Dominio y el Código relacionados con el sitio web final.'
            },
            {
              title: 'Derechos de la Compañía:',
              type: 'paragraph',
              content: 'La Compañía conserva el derecho de utilizar el proyecto completado en su cartera y materiales de marketing para estudios de caso y fines promocionales.'
            },
          ]
        },
        {
          title: '4. Servicios Posteriores al Proyecto y Terminación',
          type: 'heading',
          content: [
            {
              title: 'Alojamiento:',
              type: 'paragraph',
              content: 'Se proporciona un Dominio y Certificado SSL Gratuitos durante 1 Año. Después del primer año, el cliente será responsable de los costos continuos estándar de alojamiento, mantenimiento y renovación de dominio, o puede contratar un acuerdo de soporte continuo con la Compañía.'
            },
            {
              title: 'Reembolsos:',
              type: 'paragraph',
              content: 'Debido a la creación personalizada de activos digitales y al trabajo inicial involucrado, la tarifa de servicio de $2,000 no es reembolsable, excepto según lo dispuesto explícitamente por la Garantía de Rendimiento de 30 Días.'
            }
          ]
        },
        {
          title: '5. Información de Contacto',
          type: 'paragraph',
          content: 'Para cualquier pregunta sobre estos Términos, contáctenos en sales@barciastech.com.'
        }
      ]
    }
  },
  'privacy-policy': {
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Last Updated: November 14, 2025',
          type: 'paragraph',
          content: 'Barcias Tech is committed to protecting the privacy of visitors and clients. This policy explains how we collect, use, and protect your personal information on our website.'
        },
        {
          title: '1. Information We Collect',
          type: 'heading',
          content: 'We collect information through two primary methods:',
        },
        {
            title: 'List:',
            type: 'list',
            content: [
                {
                    title: 'Contact Forms & Booking (Lead Data)',
                    type: 'paragraph',
                    content: 'When you fill out our contact form, we collect your Name, Business Name, Email Address, Phone Number, Service Type, and a Description of your needs.'
                },
                {
                    title: 'Live Chatbot Interactions',
                    type: 'paragraph',
                    content: 'When you use the Chatbot, we collect the conversation transcript, your provided name, and your email/phone number if submitted via the qualification form. We use local storage to assign a user ID (e.g., guest-ID) and store your name locally for chat continuity.'
                }
            ]
        },
        {
          title: '2. How We Use Your Information',
          type: 'heading',
          content: 'Your data is used strictly for the following purposes:',
        },
        {
            title: 'List:',
            type: 'list',
            content: [
                {
                    title: 'Lead Generation',
                    type: 'paragraph',
                    content: 'To follow up on your request for a FREE AI Growth Blueprint Session.'
                },
                {
                    title: 'Service Delivery',
                    type: 'paragraph',
                    content: 'To understand your service needs and customize the marketing strategy for your business (Plumbing, Electrician, Landscaping, etc.).'
                },
                {
                    title: 'Chatbot Functionality',
                    type: 'paragraph',
                    content: 'To generate AI responses and store chat history via Firestore.'
                }
            ]
        },
        {
          title: '3. Data Storage and Third-Party Disclosure',
          type: 'heading',
          content: [
            {
                title: 'Storage',
                type: 'paragraph',
                content: 'Contact Form and Chatbot lead data is saved in our secure Firestore database (a service of Google Firebase).'
            },
            {
                title: 'Processing',
                type: 'paragraph',
                content: 'Email Communication: We use Resend to send emails regarding your inquiries to our team. AI Service: Chat messages are processed by Google\'s Gemini AI to generate responses based on the system instructions.'
            },
          ]
        },
        {
            title: '4. Changes to This Policy',
            type: 'paragraph',
            content: 'We may update this privacy policy from time to time. We encourage you to review this page periodically for any changes.'
        },
      ]
    },
    es: {
      title: 'Política de Privacidad',
      sections: [
        {
          title: 'Última Actualización: 14 de noviembre de 2025',
          type: 'paragraph',
          content: 'Barcias Tech se compromete a proteger la privacidad de los visitantes y clientes. Esta política explica cómo recopilamos, usamos y protegemos su información personal en nuestro sitio web.'
        },
        {
          title: '1. Información que Recopilamos',
          type: 'heading',
          content: 'Recopilamos información a través de dos métodos principales:',
        },
        {
            title: 'Lista:',
            type: 'list',
            content: [
                {
                    title: 'Formularios de Contacto y Reserva (Datos de Leads)',
                    type: 'paragraph',
                    content: 'Cuando rellena nuestro formulario de contacto, recopilamos su Nombre, Nombre de la Empresa, Dirección de Correo Electrónico, Número de Teléfono, Tipo de Servicio y una Descripción de sus necesidades.'
                },
                {
                    title: 'Interacciones del Chatbot en Vivo',
                    type: 'paragraph',
                    content: 'Cuando utiliza el Chatbot, recopilamos la transcripción de la conversación, el nombre proporcionado y su correo electrónico/número de teléfono si se envía a través del formulario de calificación. Utilizamos el almacenamiento local para asignar una identificación de usuario (ej. guest-ID) y almacenar su nombre localmente para la continuidad del chat.'
                }
            ]
        },
        {
          title: '2. Cómo Utilizamos su Información',
          type: 'heading',
          content: 'Sus datos se utilizan estrictamente para los siguientes fines:',
        },
        {
            title: 'Lista:',
            type: 'list',
            content: [
                {
                    title: 'Generación de Leads',
                    type: 'paragraph',
                    content: 'Para hacer seguimiento a su solicitud de una Sesión GRATUITA de Plan de Crecimiento con IA.'
                },
                {
                    title: 'Entrega de Servicios',
                    type: 'paragraph',
                    content: 'Para comprender sus necesidades de servicio y personalizar la estrategia de marketing para su negocio (Fontanería, Electricista, Jardinería, etc.).'
                },
                {
                    title: 'Funcionalidad del Chatbot',
                    type: 'paragraph',
                    content: 'Para generar respuestas de IA y almacenar el historial del chat a través de Firestore.'
                }
            ]
        },
        {
          title: '3. Almacenamiento de Datos y Divulgación a Terceros',
          type: 'heading',
          content: [
            {
                title: 'Almacenamiento',
                type: 'paragraph',
                content: 'Los datos de leads del Formulario de Contacto y del Chatbot se guardan en nuestra base de datos segura de Firestore (un servicio de Google Firebase).'
            },
            {
                title: 'Procesamiento',
                type: 'paragraph',
                content: 'Comunicación por Correo Electrónico: Utilizamos Resend para enviar correos electrónicos relacionados con sus consultas a nuestro equipo. Servicio de IA: Los mensajes de chat son procesados por la IA Gemini de Google para generar respuestas basadas en las instrucciones del sistema.'
            },
          ]
        },
        {
            title: '4. Cambios a Esta Política',
            type: 'paragraph',
            content: 'Podemos actualizar esta política de privacidad de vez en cuando. Le recomendamos que revise esta página periódicamente para cualquier cambio.'
        },
      ]
    }
  },
  'legal': {
    en: {
      title: 'Legal Notice',
      sections: [
        {
          title: 'Business Information',
          type: 'heading',
          content: 'Barcias Tech is a digital marketing firm specializing in hyper-local lead generation for trade professionals in the Midwest.'
        },
        {
            title: 'List:',
            type: 'list',
            content: [
                {
                    title: 'Business Name',
                    type: 'paragraph',
                    content: 'Barcias Tech'
                },
                {
                    title: 'Contact Email (General/Inquiries)',
                    type: 'paragraph',
                    content: 'sales@barciastech.com'
                },
                {
                    title: 'Service Area Focus',
                    type: 'paragraph',
                    content: 'Chicago, IL, Chicagoland suburbs, and Northwest Indiana'
                },
                {
                    title: 'Phone',
                    type: 'paragraph',
                    content: '(708) 314-0477'
                },
                {
                    title: 'Copyright',
                    type: 'paragraph',
                    content: '©2020 - All Rights Reserved by Barcias Tech'
                }
            ]
        },
        {
          title: 'Disclaimer',
          type: 'paragraph',
          content: 'Past performance, including client testimonials and projected lead averages (Avg. 40+ Qualified Jobs/Mo), does not guarantee future results. While we offer a 30-Day Performance Guarantee, results are dependent upon market conditions and client cooperation. This content must be reviewed and customized by a legal professional.'
        }
      ]
    },
    es: {
      title: 'Aviso Legal',
      sections: [
        {
          title: 'Información de la Empresa',
          type: 'heading',
          content: 'Barcias Tech es una firma de marketing digital especializada en la generación de leads hiperlocal para profesionales de oficios en el Medio Oeste.'
        },
        {
            title: 'List:',
            type: 'list',
            content: [
                {
                    title: 'Nombre de la Empresa',
                    type: 'paragraph',
                    content: 'Barcias Tech'
                },
                {
                    title: 'Correo Electrónico de Contacto (General/Consultas)',
                    type: 'paragraph',
                    content: 'sales@barciastech.com'
                },
                {
                    title: 'Área de Servicio Enfocada',
                    type: 'paragraph',
                    content: 'Chicago, IL, suburbios de Chicagoland y Noroeste de Indiana'
                },
                {
                    title: 'Teléfono',
                    type: 'paragraph',
                    content: '(708) 314-0477'
                },
                {
                    title: 'Derechos de Autor',
                    type: 'paragraph',
                    content: '©2020 - Todos los Derechos Reservados por Barcias Tech'
                }
            ]
        },
        {
          title: 'Descargo de Responsabilidad',
          type: 'paragraph',
          content: 'El rendimiento pasado, incluidos los testimonios de clientes y los promedios de leads proyectados (Meta: 40+ Trabajos/Mes), no garantiza resultados futuros. Aunque ofrecemos una Garantía de Rendimiento de 30 Días, los resultados dependen de las condiciones del mercado y la cooperación del cliente. Este contenido debe ser revisado y personalizado por un profesional legal.'
        }
      ]
    }
  },
  'help-center': {
    en: {
      title: 'Help Center',
      sections: [
        {
          title: 'Getting Started',
          type: 'heading',
          content: [
            {
                title: 'What does the $2,000 fee cover?',
                type: 'paragraph',
                content: 'The $2,000 price is for the core high-speed digital asset. The full estimated value of $4,500 includes the professional SEO setup, Google Business Profile optimization, the custom copywriting, and the FREE physical branding kit (t-shirts, cards).'
            },
            {
                title: 'How long does the project take?',
                type: 'paragraph',
                content: 'We guarantee the site will Go Live in 14 Business Days or less from the date you provide us with all necessary content and access.'
            },
            {
                title: 'Do I own the website?',
                type: 'paragraph',
                content: 'Yes. You retain 100% Ownership of the Domain and Code after the one-time investment is complete.'
            }
          ]
        },
        {
          title: 'The Performance Guarantee',
          type: 'heading',
          content: [
            {
                title: 'What exactly is the 30-Day Performance Guarantee?',
                type: 'paragraph',
                content: 'This guarantee covers Phase 1: Lead Activation. We promise your new digital asset will generate at least one qualified lead within the first 30 days, or we waive our fees until it does. This proves the system works immediately.'
            },
            {
                title: 'When will I hit the 40+ Qualified Jobs/Mo Goal?',
                type: 'paragraph',
                content: 'The full scale of Phase 2: Lead Engine Scale (the goal of 40+ leads) is achieved through consistent SEO efforts over the next 3–6 months. The 30-day guarantee is just the first step in proving the system\'s effectiveness.'
            },
            {
                title: 'What if the guarantee is not met?',
                type: 'paragraph',
                content: 'If the guarantee is not met, we waive our fees or work for free until that first qualified lead comes in. Our confidence is in our process.'
            }
          ]
        },
        {
          title: 'Support and Technical Questions',
          type: 'heading',
          content: [
            {
                title: 'What happens after the first year?',
                type: 'paragraph',
                content: 'Your package includes a Free Domain & SSL Certificate for 1 Year. After this, you will be responsible for standard hosting and maintenance costs to keep the site live and running 24/7.'
            },
            {
                title: 'Do you only work in Chicago?',
                type: 'paragraph',
                content: 'Yes. Our model is highly specialized for hyper-local dominance in Chicago, Chicagoland suburbs, and Northwest Indiana. We ensure zero competition for your market area.'
            },
            {
                title: 'What if the website breaks?',
                type: 'paragraph',
                content: 'We handle hosting, security, and updates to provide No Tech Headaches, Ever. Your site is designed to run 24/7 without constant manual maintenance.'
            }
          ]
        }
      ]
    },
    es: {
      title: 'Centro de Ayuda',
      sections: [
        {
          title: 'Para Empezar',
          type: 'heading',
          content: [
            {
                title: '¿Qué cubre la tarifa de $2,000?',
                type: 'paragraph',
                content: 'El precio de $2,000 es por el activo digital de alta velocidad principal. El valor estimado completo de $4,500 incluye la configuración profesional de SEO local, la optimización del Perfil de Negocio de Google, la redacción de contenido personalizada y el kit de marca física GRATUITO (camisetas, tarjetas).'
            },
            {
                title: '¿Cuánto tiempo tarda el proyecto?',
                type: 'paragraph',
                content: 'Garantizamos que el sitio estará en línea en 14 Días Hábiles o menos a partir de la fecha en que nos proporcione todo el contenido y acceso necesarios.'
            },
            {
                title: '¿Soy dueño del sitio web?',
                type: 'paragraph',
                content: 'Sí. Usted conserva el 100% de la Propiedad del Dominio y el Código después de que se complete la inversión única.'
            }
          ]
        },
        {
          title: 'La Garantía de Rendimiento',
          type: 'heading',
          content: [
            {
                title: '¿Qué es exactamente la Garantía de Rendimiento de 30 Días?',
                type: 'paragraph',
                content: 'Esta garantía cubre la Fase 1: Activación de Leads. Prometemos que su nuevo activo digital generará al menos una llamada o contacto calificado dentro de los primeros 30 días, o trabajamos gratis hasta que lo haga. Esto prueba que el sistema funciona inmediatamente.'
            },
            {
                title: '¿Cuándo alcanzaré el Objetivo de 40+ Trabajos Calificados/Mes?',
                type: 'paragraph',
                content: 'La escala completa de la Fase 2: Escala del Motor de Leads (el objetivo de 40+ leads) se logra mediante esfuerzos continuos de SEO durante los próximos 3 a 6 meses. La garantía de 30 días es solo el primer paso para demostrar la efectividad del sistema.'
            },
            {
                title: '¿Qué pasa si no se cumple la garantía?',
                type: 'paragraph',
                content: 'Si la garantía no se cumple, renunciamos a nuestras tarifas o trabajamos gratis hasta que llegue ese primer lead calificado. Nuestra confianza está en nuestro proceso.'
            }
          ]
        },
        {
          title: 'Soporte y Preguntas Técnicas',
          type: 'heading',
          content: [
            {
                title: '¿Qué sucede después del primer año?',
                type: 'paragraph',
                content: 'Su paquete incluye un Dominio y Certificado SSL Gratuitos durante 1 Año. Después de esto, usted será responsable de los costos estándar de alojamiento y mantenimiento para mantener el sitio en vivo y funcionando 24/7.'
            },
            {
                title: '¿Trabajan solo en Chicago?',
                type: 'paragraph',
                content: 'Sí. Nuestro modelo está altamente especializado para el dominio hiperlocal en Chicago, los suburbios de Chicagoland y el Noroeste de Indiana. Aseguramos cero competencia para su área de mercado.'
            },
            {
                title: '¿Qué pasa si el sitio web se rompe?',
                type: 'paragraph',
                content: 'Nos encargamos del alojamiento, la seguridad y las actualizaciones para proporcionar Cero Dolores de Cabeza Técnicos, Siempre. Su sitio está diseñado para funcionar 24/7 sin mantenimiento manual constante.'
            }
          ]
        }
      ]
    }
  }
};

export function getStaticContent(slug: string, lang: 'en' | 'es'): StaticContent | null {
  const content = STATIC_CONTENT_DATA[slug];
  if (content && content[lang]) {
    return content[lang];
  }
  return null;
}

export type { StaticContent, ContentSection };