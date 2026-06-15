import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import Backlink from '../pageComponents/Backlink'

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
        <div className='mx-auto w-full px-2 2xl:w-10/12 md:pt-5 mt-5'>
            <Backlink />
        </div>
        <article className='w-full px-2 mx-auto md:container md:px-0 mb-15'>
            <main className='grid grid-cols-1 md:px-2 lg:grid-cols-12 gap-6'>
                <div className='col-span-1 lg:col-span-5'>
                    <img src={singleMapa.imagen ? singleMapa.imagen : "/demo.jpg"} alt={singleMapa.titulo} className='rounded-4xl w-full' />
                </div>
                <div className='col-span-1 lg:col-span-7'>
                    <h1 className='text-center lg:text-left text-primary text-28'>{singleMapa.titulo}</h1>
                    <div className='flex gap-4 my-10 flex-wrap '>
                        <p className='bg-[#F5F5F5] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.anyo}</p>
                        <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.tipo}</p> 
                        <p className='bg-[#E5E0E0] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.tipo}</p>
                    </div>
                    <div className='my-8'>
                        <a href={singleMapa.archivo} target="_blank" rel="noopener noreferrer" className='text-white bg-[#454545] rounded-3xl px-4 py-2 text-baseinline-block'>
                            Descargar imagen original
                        </a>
                    </div>
                    <div className='mb-4 gap-4 grid grid-cols-6'>
                        
                        { singleMapa.autor && singleMapa.autor.trim() !== '' && (
                            <>
                                <div className='col-span-2 mb-4'>
                                    <b>Autor:</b>
                                </div>
                                <div className='col-span-4 mb-4'>
                                    <p>{singleMapa.autor}</p>
                                </div>                            
                            </>
                            
                        )}
                        
                        { singleMapa.medidas && singleMapa.medidas.trim() !== '' && (
                            <>
                                <div className='col-span-2 mb-4'>
                                    <b>Medidas:</b>
                                </div>
                                <div className='col-span-4 mb-4'>
                                    <p>{singleMapa.medidas}</p>
                                </div>
                            </>
                            
                        )}

                         { singleMapa.escala && singleMapa.escala.trim() !== '' && (
                            <>
                        <div className='col-span-2 mb-4'>
                            <b>Escala:</b>
                        </div>
                        <div className='col-span-4 mb-4'>
                            <p>{singleMapa.escala}</p>
                        </div>
                         </>
                            
                        )}

                        { singleMapa.edicion && singleMapa.edicion.trim() !== '' && (
                            <>
                        <div className='col-span-2 mb-4'>
                            <b>Edición:</b>
                        </div>
                        <div className='col-span-4 mb-4'>
                            <p>{singleMapa.edicion}</p>
                        </div>
                        </>
                            
                        )}

                         { singleMapa.editor && singleMapa.editor.trim() !== '' && (
                            <>
                        <div className='col-span-2 mb-4'>
                            <b>Editor:</b>
                        </div>
                        <div className='col-span-4 mb-4'>
                            <p>{singleMapa.editor}</p>
                        </div>
                         </>
                            
                        )}
 
                        { singleMapa.sitio_web && singleMapa.sitio_web.trim() !== '' && (
                            <>
                                <div className='col-span-2 mb-4'>
                                    <b>Sitio web:</b>
                                </div>
                                <div className='col-span-4 mb-4'>
                                    <p>{singleMapa.sitio_web}</p>
                                </div>
                            </>
                            
                        )}

                        { singleMapa.ubicacion && singleMapa.ubicacion.trim() !== '' && (
                            <>
                        <div className='col-span-2 mb-4'>
                            <b>Ubicación:</b>
                        </div>
                        <div className='col-span-4 mb-4'>
                            <p>{singleMapa.ubicacion}</p>
                        </div>
                        </>
                            
                        )}

                        { singleMapa.informacion && singleMapa.informacion.trim() !== '' && (
                            <>
                        <div className='col-span-6'>
                            <b>Información de la publicación:</b>
                        </div>
                        <div className='col-span-6 mb-4'>
                            <div dangerouslySetInnerHTML={{__html: singleMapa.informacion}} className='mt-5 prose max-w-none' />
                        </div>
                        </>
                            
                        )}

                    </div>                                
                </div>
            </main>
        </article>
    </>
  );
}