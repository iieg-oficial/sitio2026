import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import Backlink from '../pageComponents/Backlink'
import Galeria from '../interComponents/galeria'
import ShareButtons from '../pageComponents/ShareButtons'

export default function Blog() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const postUrl = `http://localhost:13010/comunidad/${slug}`;
    const [singlePost, setSinglePost] = useState(null);

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
  return (
    <>    
        <Helmet>
            <title>{singlePost.titulo}</title>
            <meta name="description" content={singlePost.resumen} />
            <meta property="og:title" content={singlePost.titulo} />
            <meta property="og:description" content={singlePost.resumen} />
            <meta property="og:url" content={window.location.href} />
        </Helmet>
        <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
            <div className='md:col-span-1'><Backlink /></div>
            <main className='md:col-span-11'>
                <h1 className='text-44 font-extrabold mb-4 text-primary'>{singlePost.titulo}</h1>
                <div className="flex gap-4 my-5 flex-wrap">
                    <p className='bg-[#ccc] text-body rounded-2xl px-4 py-2 text-14'>{format(new Date(singlePost.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    {singlePost.subject ?
                        <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{singlePost.subject?.titulo}</p>
                    : null}
                </div>
                <div dangerouslySetInnerHTML={{__html: singlePost.contenido}} className='mt-5 prose max-w-none' />
                {singlePost.gallery_images && singlePost.gallery_images.length > 0 ? (
                    <section className='my-25'>
                        <h2 className='text-28 font-extrabold text-primary text-center mb-4'>Galería de Imágenes</h2>
                        <Galeria images={singlePost.gallery_images} />
                    </section> 
                ) : null}
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