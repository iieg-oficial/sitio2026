import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'

export default function Mapas() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleMapa, setSingleMapa] = useState(null);

    useEffect(() => {
        const fetchMapa = async () => {
            try {
                const response = await api.get(`/mapas/${slug}`);
                setSingleMapa(response.data);
            } catch (error) {
                console.error("Error al obtener el mapa:", error);
            }
        }
        fetchMapa();
    }, [slug]); 


    //check if singleMapa exists before render
    if (!singleMapa) {
        return <div>Cargando ...</div>;
    }
  return (
    <>    
        <Helmet>
            <title>{singleMapa.titulo}</title>
            <meta name="description" content={singleMapa.resumen} />
            <meta property="og:title" content={singleMapa.titulo} />
            <meta property="og:description" content={singleMapa.resumen} />
            <meta property="og:url" content={window.location.href} />
        </Helmet>
        <article className='my-40 relative flex flex-col items-center'>
            <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
                <h1 className='text-3xl font-bold mb-4'>{singleMapa.titulo}</h1>
                <div dangerouslySetInnerHTML={{__html: singleMapa.informacion}} className='mt-5 prose max-w-none' />
                <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                    { singleMapa.autor !== '' && (
                        <p><strong>Autor:</strong> {singleMapa.autor}</p>
                    )}
                    
                    <p><strong>Año:</strong> {singleMapa.anyo}</p>

                </div>
            </main>
        </article>
    </>
  );
}