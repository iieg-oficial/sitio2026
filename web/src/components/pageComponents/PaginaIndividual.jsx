import { useParams } from 'react-router';
import { useEffect, useState, useRef } from "react";
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'

function PaginaIndividual() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singlePost, setSinglePost] = useState(null);
    const mov2Ref = useRef(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${slug}`);
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
        <article className='my-40 relative flex flex-col items-center'>
            <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
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
            <div className='mov1 z-0 bottom-10 absolute' ref={mov2Ref}></div>
        </article>
    </>
  );
}

export default PaginaIndividual