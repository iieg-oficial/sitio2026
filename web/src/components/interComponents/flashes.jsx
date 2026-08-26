import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import BackLink from './../pageComponents/Backlink'
import TrackedLink from '@components/blocks/boton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SafeHtml } from '@components/safeHtml';


export default function Flashes() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [flash, setFlashes] = useState(null);    
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchFlash = async () => {
                try {
                    const response = await api.get(`/flashes/slug/${slug}`);
                    setFlashes(response.data);
                    setError(null);
                } catch (error) {
                    console.error("Error al obtener el flash:", error);
                    setError(error?.response?.data?.detail || error.message || 'Error al obtener flash');
                    setFlashes(null);
                }
            }
            fetchFlash();
        }, [slug]);
    
        if (!flash) {
            if (error) {
                return <div>Error al cargar flash: {error}</div>;
            }
            return <div>Cargando ...</div>;
        }

        return (
        <>
            <Helmet>
                <title>{flash.titulo}</title>                
                <meta property="og:title" content={flash.titulo} />
                <meta name="description" content={flash.desc_jal} />
                <meta property="og:image" content={flash.postlink ? flash.postlink : "/demo.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                <meta name="keywords" content={flash.claves} />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={flash.titulo} />
                <meta name="twitter:description" content={flash.desc_jal} />
                <meta name="twitter:image" content={flash.postlink ? flash.postlink : "/demo.jpg"} />
            </Helmet>
            <article className='mt-8 relative px-5 xl:px-5 2xl:px-0 extra:max-w-[1980px] extra:mx-auto'>
                <section className="page-header text-center py-12">
                    <div className="container mx-auto grid md:grid-cols-12 gap-1">  
                        <div className='md:col-span-1'><BackLink /></div>
                        <div className='md:col-span-11 w-full px-2 md:px-0 md:w-3/6 mx-auto'>
                            <h1 className='text-titulos text-center'>Flashes</h1>
                            <div className='prose diez mt-5'>
                                <p>descripcion</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='rounded-2xl p-5 lg:p-14 mb-4 mx-auto container bg-[#F5F5F5] mt-5 mb-15'>
                    <h3 className='text-28 text-tertiary'>{flash.titulo}</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                            <div className='bg-white rounded-2xl p-8'>
                                <h4>Jalisco</h4>                                
                                <SafeHtml htmlContent={flash.desc_jal} className='mt-5 prose max-w-none'/>
                            </div>
                            <div className='bg-white rounded-2xl p-6'>
                                <h4>Nacional</h4>                                
                                <SafeHtml htmlContent={flash.desc_nac} className='mt-5 prose max-w-none'/>
                            </div>
                            <div className='flex gap-4 flex-wrap mt-5 md:mt-0'>
                                {flash.periocidad && (
                                    <p className='bg-etiqueta-ter border-[#162A554D] text-titulo rounded-2xl px-4 py-2 text-14'>{flash.periocidad}</p>
                                )}
                                {flash.fecha_publicacion && (
                                    <p className='bg-etiqueta-sec border-[#FF83004D] text-tertiary rounded-2xl px-4 py-2 text-14'>{format(new Date(flash.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                                )}
                                {flash.fuente && (
                                    <p className='bg-etiqueta border-[#5C24724D] text-primary rounded-2xl px-4 py-2 text-14'>{flash.fuente}</p>                            
                                )}                            
                            </div>
                            {flash.link && (
                                <div className="grid grid-flow-col justify-items-end mt-5 md:mt-0">
                                    <TrackedLink key={flash.id} to={flash.link} target="_blank" download>
                                        <p className='hover:bg-secondary text-secondary border-2 rounded-2xl px-4 py-2 text-14 hover:text-white'>
                                            Quiero ver el reporte de este flash
                                        </p>
                                    </TrackedLink>                                
                                </div>
                            )}
                        </div>
                    </div>
            </article>
        </>
    );
}