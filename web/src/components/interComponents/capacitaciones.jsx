import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import CapacitacionesList from './capacitaciones_list';
import BackLink from './../pageComponents/Backlink'
import TrackedLink from '@components/blocks/boton'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

export default function Capacitaciones() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleCapacitacion, setSingleCapacitacion] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCapacitacion = async () => {
            try {
                const response = await api.get(`/cursos-public/slug/${slug}`);
                setSingleCapacitacion(response.data);
                setError(null);
            } catch (error) {
                console.error("Error al obtener la capacitación:", error);
                setError(error?.response?.data?.detail || error.message || 'Error al obtener la capacitación');
                setSingleCapacitacion(null);
            }
        }
        fetchCapacitacion();
    }, [slug]);

    if (!singleCapacitacion) {
        if (error) {
            return <div>Error al cargar la capacitación: {error}</div>;
        }
        return <div>Cargando ...</div>;
    }

    const esFechaPasada = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        return ahora > fecha;
    };

    return (
        <>
            <Helmet>
                <title>{singleCapacitacion.titulo}</title>
                <meta property="og:title" content={singleCapacitacion.titulo} />
                <meta property="og:description" content={singleCapacitacion.descripcion} />
                <meta property="og:image" content={singleCapacitacion.postlink ? singleCapacitacion.postlink : "/demo.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                <meta name="keywords" content={singleCapacitacion.clave} />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={singleCapacitacion.titulo} />
                <meta name="twitter:description" content={singleCapacitacion.descripcion} />
                <meta name="twitter:image" content={singleCapacitacion.postlink ? singleCapacitacion.postlink : "/demo.jpg"} />
            </Helmet>
            <article className='mt-8 relative px-5 xl:px-5 2xl:px-0 extra:max-w-[1980px] extra:mx-auto'>
                <section className="page-header text-center pb-12">
                    <div className="container mx-auto grid md:grid-cols-12 gap-1">  
                        <div className='md:col-span-1 text-left'><BackLink /></div>
                        <div className='md:col-span-11 w-full px-2 md:px-0 md:ml-auto md:mr-0 grid lg:grid-cols-12 mx-auto'>
                            <div className='lg:col-span-3 px-5'>
                                <img src={singleCapacitacion.image} alt={singleCapacitacion.titulo} />
                            </div>
                            <div className='lg:col-span-9 text-left'>
                                <h1 className='text-44 font-extrabold mb-4'>{singleCapacitacion.titulo}</h1>
                                <div dangerouslySetInnerHTML={{__html: singleCapacitacion.descripcion}} className='mt-5 prose max-w-none diez' />
                                <div className='mt-5 flex flex-wrap gap-5'>
                                    {singleCapacitacion.archivo && (
                                        <TrackedLink key={singleCapacitacion.id} to={singleCapacitacion.archivo} target="_blank" download>
                                            <span className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Descarga el archivo informativo</span>
                                        </TrackedLink>
                                    )}                        
                                    {singleCapacitacion.formulario && !esFechaPasada(singleCapacitacion.fin) ? (
                                        <TrackedLink key={singleCapacitacion.id} to={singleCapacitacion.formulario} target="_blank">
                                            <span className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Inscribete aquí</span>
                                        </TrackedLink>
                                    ): 
                                        <span className='rounded-2xl bg-etiqueta-ter text-titulo text-14 px-5 py-2'>Convocatoria cerrada</span>
                                    }
                                </div>
                            </div>                            
                        </div>
                    </div>
                </section>


                <section className='lg:w-8/12 mx-auto mb-15'>
                    {singleCapacitacion.Objetivo && (
                    <div className='grid grid-cols-12 sm:gap-1'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                                <div className='flex flex-wrap mb-12.5 gap-1'>
                                {singleCapacitacion.inicio && (
                                <div className='mb-3 lg:pt-4'>
                                    <p className='rounded-2xl bg-etiqueta-sec text-tertiary font-bold text-26 px-5 py-2'>
                                        Inicio de clases: {dayjs(singleCapacitacion.inicio).format('D [de] MMMM [de] YYYY')}                             
                                    </p>
                                </div>
                                )}
                                {singleCapacitacion.formato && (
                                <div className='mb-3 lg:pt-4'>
                                    <p className='rounded-2xl bg-etiqueta-ter text-titulo text-26 font-bold px-5 py-2'>
                                        Formato: {singleCapacitacion.formato}
                                    </p>
                                </div>
                                )}
                                {singleCapacitacion.Horario && (
                                <div className='mb-3 lg:pt-4'>
                                    <p className='rounded-2xl bg-etiqueta text-primary text-26 font-bold px-5 py-2'>
                                        Horario: {singleCapacitacion.Horario}
                                    </p>
                                </div>
                                )}
                            </div>
                            <h2 className='text-primary text-36 font-extrabold'>Objetivo</h2>
                            <div dangerouslySetInnerHTML={{__html: singleCapacitacion.Objetivo}} className='mt-5 prose max-w-none cursos' />
                        </div>
                    </div>
                    )}
                    {singleCapacitacion.p_ingreso && (
                    <div className='my-20 grid grid-cols-12 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                            <h2 className='text-primary text-36 font-extrabold'>Perfil de Ingreso</h2>
                            <div dangerouslySetInnerHTML={{__html: singleCapacitacion.p_ingreso}} className='mt-5 prose max-w-none cursos' />
                        </div>
                    </div>
                    )}
                    {singleCapacitacion.p_egreso && (
                     <div className='grid grid-cols-12 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                            <h2 className='text-primary text-36 font-extrabold'>Perfil de Egreso</h2>
                            <div dangerouslySetInnerHTML={{__html: singleCapacitacion.p_egreso}} className='mt-5 prose max-w-none cursos' />                        
                        </div>
                    </div>
                    )}
                </section>
                    
                <CapacitacionesList curso={singleCapacitacion} />

                <section className='grid grid-cols-12 gap-4 lg:w-8/12 mx-auto mb-15'>
                    <div className='col-span-1'></div>
                    <div className='col-span-11 grid lg:grid-cols-2 gap-5'>
                        {singleCapacitacion.inscripcion && (
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36 mb-10'>Inscripción</strong> 
                            <div dangerouslySetInnerHTML={{__html: singleCapacitacion.inscripcion}} className='mt-5 prose max-w-none cursos' />                        
                        </div>
                        )}
                        {singleCapacitacion.acreditacion && (
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36 mb-10'>Acreditación</strong> 
                            <div dangerouslySetInnerHTML={{__html: singleCapacitacion.acreditacion}} className='mt-5 prose max-w-none cursos' />                        
                        </div>
                        )}
                        {singleCapacitacion.vigencia && (
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36'>Vigencia</strong> 
                            <p className='text-20 text-titulo pt-6'>{singleCapacitacion.vigencia}</p>
                        </div>
                        )}
                        {singleCapacitacion.contacto && (
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36'>Contacto</strong> 
                            <p className='text-20 text-titulo pt-6'>{singleCapacitacion.contacto}</p>
                        </div>
                        )}
                        {singleCapacitacion.clave && (
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36'>Clave</strong> 
                            <p className='text-20 text-titulo pt-6'>{singleCapacitacion.clave}</p>
                        </div>
                        )}
                    </div>                    
                </section>
                    
            </article>
        </>
    );
}