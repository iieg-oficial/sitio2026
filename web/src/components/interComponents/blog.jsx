import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import Backlink from '../pageComponents/Backlink'
import Galeria from '../interComponents/galeria'
import ShareButtons from '../pageComponents/ShareButtons'
import { SafeHtml } from '@components/SafeHtml';



export default function Blog() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const postUrl = `http://localhost:13010/comunicacion-institucional/${slug}`;
    const [singlePost, setSinglePost] = useState(null);

    // Función Helper para obtener el ID de YouTube de casi cualquier URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/slug/${slug}`);
                setSinglePost(response.data);
                
            } catch (error) {
                console.error("Error al obtener el post:", error);
            }
        }
        fetchPost();
    }, [slug]); 

    

    //check if singlePost exists before render
    if (!singlePost) {
        return <div>Cargando ...</div>;
    }

    const videoId = getYouTubeId(singlePost.video);

    if (!videoId) {
        console.log('no existe video');
    }

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    
  return (
    <>    
        <Helmet>
            <title>{singlePost.titulo}</title>            
            <meta property="og:title" content={singlePost.titulo} />
            <meta property="og:description" content={singlePost.resumen} />
            <meta property="og:image" content={singlePost.gallery_images && singlePost.gallery_images.length > 0 ? singlePost.gallery_images[0].url : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="article" />
            <meta name="keywords" content={singlePost.claves} />
            {/* Twitter Cards (Específico para X / Twitter) */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={singlePost.resumen} />
            <meta name="twitter:description" content={singlePost.resumen} />
            <meta name="twitter:image" content={singlePost.gallery_images && singlePost.gallery_images.length > 0 ? singlePost.gallery_images[0].url : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
        </Helmet>
        <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
            <div className='md:col-span-1'><Backlink /></div>
            <main className='md:col-span-11'>
                <h1 className='text-44 font-garet-extra mb-4 text-primary'>{singlePost.titulo}</h1>
                {singlePost.gallery_images ?? singlePost.gallery_images.length > 0 && (
                    <img src={singlePost.gallery_images[0].url} alt={singlePost.titulo} className="object-cover w-full h-auto">
                )}
                <div className="flex gap-4 my-5 flex-wrap">
                    <p className='bg-[#DDE7FF] text-titulo rounded-3xl px-4 py-2 text-14 border border-[#162A554D]'>{format(new Date(singlePost.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    {singlePost.subject ?
                        <p className='font-garet-bold bg-[#F3EAFF] text-primary rounded-3xl px-4 py-2 text-14 border boder-[#5C24724D]'>{singlePost.subject?.titulo}</p>
                    : null}
                </div>                
                <SafeHtml htmlContent={singlePost.contenido} className='mt-5 prose max-w-none mb-15 text-18 font-garet'/>
                {singlePost.video && (
                    <iframe className="aspect-video w-full" 
                    src={embedUrl} 
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen />
                )}
                {singlePost.gallery_images && singlePost.gallery_images.length > 1 ? (
                    <section className='my-5'>
                        <h2 className='text-28 font-garet-extra text-primary text-center mb-4'>Galería de Imágenes</h2>
                        <Galeria images={singlePost.gallery_images} />
                    </section> 
                ) : 
                    <section className='my-5'>
                        <h2 className='text-28 font-garet-extra text-primary text-center mb-4'>Galería de Imágenes</h2>
                        <img className='w-full h-auto mx-auto' src={singlePost.gallery_images && singlePost.gallery_images.length > 0 ? singlePost.gallery_images[0].url : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} alt="" 
                            onError={(e) => {
                                    if (!e.target.dataset.triedFallback) {
                                        e.target.dataset.triedFallback = 'true';
                                        e.target.src = singlePost.gallery_images[0].url 
                                            ? singlePost.gallery_images[0].url 
                                            : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png";
                                    } else {                                        
                                        e.target.onerror = null;
                                        e.target.src = "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png";
                                    }
                                }}
                            /> 
                    </section> 
                }
                <div>
                <ShareButtons
                    url={postUrl}
                    title={singlePost.titulo}
                />
                </div>
            </main>            
        </article>
    </>
  );
}