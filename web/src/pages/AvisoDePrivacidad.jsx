import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import NotFound from '@components/blocks/NotFound'

const SLUG_INTEGRAL = 'aviso-de-privacidad'
const PDF_INTEGRAL = '/aviso-de-privacidad.pdf'

export default function AvisoDePrivacidad({ slug = SLUG_INTEGRAL }) {
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const fetchPage = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/paginas/slug/${slug}`)
                if (isMounted) setPage(res.data)
            } catch (err) {
                if (isMounted) setPage(null)
                console.error('Error fetching page:', err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchPage()

        return () => {
            isMounted = false
        }
    }, [slug])

    if (loading) {
        return <p className='text-center py-12'>Cargando...</p>
    }

    if (!page) {
        return (
            <article className='mt-10'>
                <NotFound />
            </article>
        )
    }

    const titulo = page.title || 'Aviso de Privacidad'

    return (
        <>
            <Helmet>
                <title>{titulo}</title>
                {page.description_meta && <meta name="description" content={page.description_meta} />}
                {page.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
                <meta property="og:image" content={page.postlink ? page.postlink : '/demo.jpg'} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={titulo} />
                <meta name="twitter:description" content={page.description_meta || titulo} />
                <meta name="twitter:image" content={page.postlink ? page.postlink : '/demo.jpg'} />
            </Helmet>
            <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
                <div className='md:col-span-1'><Backlink /></div>
                <main className='md:col-span-11'>
                    <h1 className='text-44 font-extrabold mb-4 text-primary text-center'>{titulo}</h1>
                    <div className='text-body text-16 leading-8 prose diez w-full mx-auto max-w-full' dangerouslySetInnerHTML={{ __html: page.description }}></div>
                    {slug === SLUG_INTEGRAL && (
                        <a
                            href={PDF_INTEGRAL}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-block mt-8 text-16 text-primary underline'
                        >
                        Descargar el aviso integral en PDF
                        </a>
                    )}
                </main>
            </article>
        </>
    )
}
