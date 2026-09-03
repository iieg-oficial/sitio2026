import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import Backlink from '../pageComponents/Backlink'
import { Download, X } from "lucide-react";
import TrackedLink from '@components/blocks/boton'
import { SafeHtml } from '@components/SafeHtml';

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
                <meta property="og:image" content={singleMapa.imagen ? singleMapa.imagen : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={singleMapa.titulo} />
                <meta name="twitter:description" content={singleMapa.informacion} />
                <meta name="twitter:image" content={singleMapa.imagen ? singleMapa.imagen : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
        </Helmet>
        <article className='w-full px-5 xl:px-5 2xl:px-0 mx-auto md:container md:px-0 mb-15 md:grid md:grid-cols-12 gap-1 mt-10'>
            <div className='md:col-span-1'><Backlink /></div>
            <main className='md:col-span-11 grid grid-cols-1 md:px-2 lg:grid-cols-12 gap-6'>
                <div className='col-span-1 lg:col-span-5'>
                    {/*<img src={singleMapa.imagen ? singleMapa.imagen : "/demo.jpg"} alt={singleMapa.titulo} className='rounded-4xl w-full' />*/}                    
                    <img src={singleMapa.imagen ? `https://iieg.jalisco.gob.mx/acervo/thumb/portal/mapas/${thumb}?w=1280` : "/demo.jpg"} alt={singleMapa.titulo} className='rounded-3xl' onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = `https://iieg.jalisco.gob.mx/acervo/portal/mapas/${thumb}`;
                                }}/>                                                                     
                </div>
                <div className='col-span-1 lg:col-span-7'>
                    <h1 className='text-center lg:text-left text-primary text-36 font-garet-extra'>{singleMapa.titulo}</h1>
                    <div className='flex gap-4 my-10 flex-wrap '>
                        <p className='font-garet bg-[#FFF2E5] border border-[#FF83004D] text-tertiary rounded-xl px-4 py-2 text-14'>{singleMapa.anyo}</p>
                        <p className='font-garet bg-[#DDE7FF] border border-[#162A554D] text-titulo rounded-xl px-4 py-2 text-14'>{singleMapa.tipo}</p> 
                        <p className='font-garet bg-[#F3EAFF] border border-[#5C24724D] text-primary rounded-xl px-4 py-2 text-14'>{singleMapa.tipo}</p>
                    </div>
                    {singleMapa.imagen && (
                    <div className='my-8'>
                        <button
                            onClick={() => setOpen(true)}
                                        className="button2 text-center text-baseinline-block bg-white text-[#8835AB] border border[#8835AB] hover:bg-[#8835AB] hover:text-white"
                        >
                            Descargar imagen original
                        </button>

                            {open && (
                                <div
                                className="fixed inset-0 bg-[#34363981] flex items-center justify-center z-50 p-4"
                                onClick={() => setOpen(false)}
                                >
                                <div
                                    className="bg-white rounded-2xl shadow-xl w-full md:w-[500px] md:h-[300px] p-10 relative text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/*<button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                                    aria-label="Cerrar"
                                    >
                                    <X size={20} />
                                    </button>*/}
                        
                                    <div className="flex items-center justify-center mb-5">
                                        <span class="griddy-icons--chat-circle-info bg-tertiary mr-5"></span>
                                        <h2 className="text-lg font-semibold text-tertiary">
                                            Importante
                                        </h2>
                                    </div>
                                    <p className="text-base text-body mb-6">
                                        <b>Información no oficial y sin efectos legales.</b>                                        
                                        <br />Este material se difunde exclusivamente por su valor histórico-cultural y con fines de investigación.
                                    </p>
                                    
                        
                                    <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="button2 px-16! text-base font-garet-extra bg-white border boder-[#697176] text-[#697176] hover:bg-[#697176] hover:text-white"
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
                                        className="button2 px-16! text-base font-garet-extra hover:bg-white border border-[#8936AB] text-white bg-[#8936AB] hover:text-[#8936AB]">                                        
                                        Descargar
                                    </TrackedLink>
                                    </div>
                                </div>
                                </div>
                            )}
                    </div>
                    )}

                    <>
                        <div className='col-span-6 text-14 bg-[#FFF2E5] border border-[#FF83004D] text-tertiary rounded-2xl p-5 mt-4 mb-7 flex gap-2 font-garet text-14'>
                            <span class="griddy-icons--chat-circle-info bg-tertiary"></span> <span>Información no oficial y sin efectos legales. Este material se difunde exclusivamente por su valor histórico-cultural y con fines de investigación.</span>
                        </div>
                    </>

                    <div className='mb-4 gap-4 grid grid-cols-6'>
                        
                        { singleMapa.autor && singleMapa.autor.trim() !== '' && (
                            <>
                                <div className='col-span-2 md:col-span-1 mb-4'>
                                    <b>Autor:</b>
                                </div>
                                <div className='col-span-4 md:col-span-5 mb-4'>
                                    <p>{singleMapa.autor}</p>
                                </div>                            
                            </>
                            
                        )}
                        
                        { singleMapa.medidas && singleMapa.medidas.trim() !== '' && (
                            <>
                                <div className='col-span-2 md:col-span-1 mb-4'>
                                    <b>Medidas:</b>
                                </div>
                                <div className='col-span-4 md:col-span-5 mb-4'>
                                    <p>{singleMapa.medidas}</p>
                                </div>
                            </>
                            
                        )}

                         { singleMapa.escala && singleMapa.escala.trim() !== '' && (
                            <>
                        <div className='col-span-2 md:col-span-1 mb-4'>
                            <b>Escala:</b>
                        </div>
                        <div className='col-span-4 md:col-span-5 mb-4'>
                            <p>{singleMapa.escala}</p>
                        </div>
                         </>
                            
                        )}

                        { singleMapa.edicion && singleMapa.edicion.trim() !== '' && (
                            <>
                        <div className='col-span-2 md:col-span-1 mb-4'>
                            <b>Edición:</b>
                        </div>
                        <div className='col-span-4 md:col-span-5 mb-4'>
                            <p>{singleMapa.edicion}</p>
                        </div>
                        </>
                            
                        )}

                         { singleMapa.editor && singleMapa.editor.trim() !== '' && (
                            <>
                        <div className='col-span-2 md:col-span-1 mb-4'>
                            <b>Editor:</b>
                        </div>
                        <div className='col-span-4 md:col-span-5 mb-4'>
                            <p>{singleMapa.editor}</p>
                        </div>
                         </>
                            
                        )}
 
                        { singleMapa.sitio_web && singleMapa.sitio_web.trim() !== '' && (
                            <>
                                <div className='col-span-2 md:col-span-1 mb-4'>
                                    <b>Sitio web:</b>
                                </div>
                                <div className='col-span-4 md:col-span-5 mb-4'>
                                    <p>{singleMapa.sitio_web}</p>
                                </div>
                            </>
                            
                        )}

                        { singleMapa.ubicacion && singleMapa.ubicacion.trim() !== '' && (
                            <>
                        <div className='col-span-2 md:col-span-1 mb-4'>
                            <b>Ubicación:</b>
                        </div>
                        <div className='col-span-4 md:col-span-5 mb-4'>
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
                            <SafeHtml htmlContent={singleMapa.informacion} className='mt-5 prose max-w-none'/>
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