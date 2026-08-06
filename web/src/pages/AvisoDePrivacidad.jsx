import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import TrackedLink from '@components/blocks/boton'

export default function AvisoDePrivacidad() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true)

    const fetchPageHome = async () => {
        setLoading(true)
        try {            
            const res = await api.get('/paginas/slug/aviso-de-privacidad')
            setPage(res.data)
            console.log('Page data:', res.data)  
        } catch (err) {
            console.error("Error fetching page:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPageHome()
    }, [])

    return (
        <>
            <Helmet>
                <title>{page?.title || 'Aviso de Privacidad - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
                <meta property="og:image" content={page?.postlink ? page.postlink : "/demo.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page?.title || 'Aviso de Privacidad - IIEG'} />
                <meta name="twitter:description" content={page?.description_meta || 'Aviso de Privacidad - IIEG'} />
                <meta name="twitter:image" content={page?.postlink ? page.postlink : "/demo.jpg"} />
            </Helmet>
            <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
            <div className='md:col-span-1'><Backlink /></div>
            <main className='md:col-span-11'>
                <h1 className='text-44 font-extrabold mb-4 text-primary'>{page?.title || 'Aviso de Privacidad'}</h1>
                <div className='text-body text-16 leading-8' dangerouslySetInnerHTML={{ __html: page?.description }}></div>
            </main>            
        </article>
        </>
    )
}

