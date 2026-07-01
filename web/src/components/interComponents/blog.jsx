import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'

export default function Blog() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
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
        <article className='my-40 relative'>
            <main className='mx-auto container'>
                <h1 className='text-3xl font-bold mb-4'>{singlePost.titulo}</h1>
                <div dangerouslySetInnerHTML={{__html: singlePost.contenido}} className='mt-5 prose max-w-none' />
                <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                    <p><strong>Autor:</strong> {singlePost.autor}</p>
                    <p><strong>Fecha:</strong> {new Date(singlePost.fecha).toLocaleDateString()}</p>
                    {singlePost.subject && (
                        <p><strong>Categoría:</strong> {singlePost.subject.titulo}</p>
                    )}
                </div>
            </main>
        </article>
    </>
  );
}