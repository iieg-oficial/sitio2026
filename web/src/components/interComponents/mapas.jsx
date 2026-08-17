import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import Backlink from '../pageComponents/Backlink'
import { Download, X } from "lucide-react";
import TrackedLink from '@components/blocks/boton'

export default function Mapas() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleMapa, setSingleMapa] = useState(null);
    const [open, setOpen] = useState(false);

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


      const handleDownload = () => {
            setOpen(false);
        };


    //check if singleMapa exists before render
    if (!singleMapa) {
        return <div>Cargando ...</div>;
    }

    const original = singleMapa.imagen
    const thumb = original.substring(original.lastIndexOf('/') + 1);
                        
  return (
    <>    
        <Helmet>
            <title>{singleMapa.titulo}</title>
             <meta property="og:title" content={singleMapa.titulo} />
                <meta name="description" content={singleMapa.informacion} />
                <meta property="og:image" content={singleMapa.imagen ? singleMapa.imagen : "/demo.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={singleMapa.titulo} />
                <meta name="twitter:description" content={singleMapa.informacion} />
                <meta name="twitter:image" content={singleMapa.imagen ? singleMapa.imagen : "/demo.jpg"} />
        </Helmet>
        <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
            <div className='md:col-span-1'><Backlink /></div>
            <main className='md:col-span-11 grid grid-cols-1 md:px-2 lg:grid-cols-12 gap-6'>
                <div className='col-span-1 lg:col-span-5'>
                    {/*<img src={singleMapa.imagen ? singleMapa.imagen : "/demo.jpg"} alt={singleMapa.titulo} className='rounded-4xl w-full' />*/}                    
                    <img src={singleMapa.imagen ? `https://iieg.jalisco.gob.mx/acervo/thumb/portal/mapas/${thumb}?w=1280` : "/demo.jpg"} alt={singleMapa.titulo} className='rounded-3xl'/>                                                                     
                </div>
                <div className='col-span-1 lg:col-span-7'>
                    <h1 className='text-center lg:text-left text-primary text-28'>{singleMapa.titulo}</h1>
                    <div className='flex gap-4 my-10 flex-wrap '>
                        <p className='bg-[#F5F5F5] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.anyo}</p>
                        <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.tipo}</p> 
                        <p className='bg-[#E5E0E0] text-body rounded-2xl px-4 py-2 text-14'>{singleMapa.tipo}</p>
                    </div>
                    {singleMapa.imagen && (
                    <div className='my-8'>
                        <button
                            onClick={() => setOpen(true)}
                            className="text-white bg-[#454545] rounded-3xl px-4 py-2 text-baseinline-block"
                        >
                            Descargar imagen original
                        </button>
                            {open && (
                                <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                onClick={() => setOpen(false)}
                                >
                                <div
                                    className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                                    aria-label="Cerrar"
                                    >
                                    <X size={20} />
                                    </button>
                        
                                    <h2 className="text-lg font-semibold text-tertiary mb-2">
                                    Importante
                                    </h2>
                                    <p className="text-base text-body mb-6">
                                    Información no oficial, sin efectos legales, este material se difunde exclusivamente por su valor historico-cultural y para fines de investigación
                                    </p>
                        
                                    <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    {console.log('objeto completo:', singleMapa)}
                                    <TrackedLink 
                                        key={singleMapa.id} 
                                        to={singleMapa.imagen} 
                                        target="_blank" 
                                        download={singleMapa.imagen}
                                        onClick={() => setOpen(false)}
                                        className="bg-primary text-white rounded-3xl px-4 py-2">
                                        <Download size={18} className='float-right ml-3 mt-1'/>
                                        Descargar
                                    </TrackedLink>
                                    </div>
                                </div>
                                </div>
                            )}
                    </div>
                    )}
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

                        <>
                        <div className='col-span-6 text-14'>
                            <i>***Información no oficial, sin efectos legales, este material se difunde exclusivamente por su valor historico-cultural y para fines de investigación</i>
                        </div>
                        </>

                    </div>                                
                </div>
            </main>
        </article>
    </>
  );
}