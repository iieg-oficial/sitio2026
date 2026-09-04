import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import NotFound from '@components/blocks/NotFound'
import { SafeHtml } from '@components/SafeHtml';
import TrackedLink from '@components/blocks/boton'


export default function AvisoDePrivacidad() {
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchPage = async () => {
        setLoading(true)
            try {
                const res = await api.get(`/paginas/slug/aviso-de-privacidad`)
                setPage(res.data)
            } catch (err) {
                console.error('Error fetching page:', err)
            } finally {
                setLoading(false)
        }
    }

    useEffect(() => {
        fetchPage()
    }, [])

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
                <meta property="og:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={titulo} />
                <meta name="twitter:description" content={page.description_meta || titulo} />
                <meta name="twitter:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
            </Helmet>
            <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
                <div className='md:col-span-1'><Backlink /></div>
                <main className='md:col-span-11'>
                    <h1 className='text-44 font-extrabold mb-4 text-primary text-center'>{titulo}</h1>                    
                    <SafeHtml htmlContent={page.description} className='text-body text-16 leading-8 prose diez w-full mx-auto max-w-full'/>
                    <TrackedLink to={`https://iieg.jalisco.gob.mx/acervo/portal/aviso_de_privacidad_integral_iieg_06_2025.pdf`} 
                        className="mt-2 inline-block text-base rounded-4xl border px-6 py-3 text-center font-garet-extra bg-[#8838AB] text-white hover:bg-white hover:text-[#8837AA]  hover:border-[#8837AA] transition-all duration-200">
                            Descargar el aviso integral en PDF
                    </TrackedLink>
                </main>
            </article>
        </>
    )
}
