import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import ConvocatoriasList from './convocatorias_list';
import Backlink from '../pageComponents/Backlink';
import TrackedLink from '@components/blocks/boton'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import ConvocatoriasInst from './convocatorias_inst';

dayjs.locale('es')

export default function Convocatorias() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleConvocatoria, setSingleConvocatoria] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await api.get(`/cursos-public/slug/${slug}`);
                setSingleConvocatoria(response.data);
                setError(null);
            } catch (error) {
                console.error("Error al obtener la convocatoria:", error);
                setError(error?.response?.data?.detail || error.message || 'Error al obtener la convocatoria');
                setSingleConvocatoria(null);
            }
        }
        fetchConvocatoria();
    }, [slug]);

    if (!singleConvocatoria) {
        if (error) {
            return <div>Error al cargar la convocatoria: {error}</div>;
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
                <title>{singleConvocatoria.nombre}</title>
                <meta name="description" content={singleConvocatoria.resumen} />
                <meta property="og:title" content={singleConvocatoria.nombre} />
                <meta property="og:description" content={singleConvocatoria.resumen} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            <article className='mt-8 relative px-5 xl:px-5 2xl:px-0 extra:max-w-[1980px] extra:mx-auto'>
                <Backlink />
                <main className='grid lg:grid-cols-6 mx-auto'>
                    <div className='col-span-2'></div>
                    <div className='col-span-4'>
                        <h1 className='text-44 font-bold mb-4'>{singleConvocatoria.titulo}</h1>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.descripcion}} className='mt-5 prose max-w-none diez' />
                        <div className='mt-5 flex flex-wrap gap-5'>
                            {singleConvocatoria.archivo && (
                                <TrackedLink key={singleConvocatoria.id} to={singleConvocatoria.archivo} target="_blank" download>
                                    <span className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Descarga el archivo informativo</span>
                                </TrackedLink>
                            )}
                            {singleConvocatoria.formulario && !esFechaPasada(singleConvocatoria.fin) ? (
                                <TrackedLink key={singleConvocatoria.id} to={singleConvocatoria.formulario} target="_blank">
                                    <span className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Inscribete aquí</span>
                                </TrackedLink>
                            ): 
                                <span className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Finalizado</span>
                            }
                        </div>
                    </div>
                </main>
                <section className='lg:w-11/12 mx-auto flex flex-wrap gap-5 lg:justify-around mt-8'>
                    <div className='lg:mt-8 lg:pt-4'>
                        <p className='rounded-2xl bg-etiqueta-sec text-tertiary font-bold text-26 px-5 py-2'>
                            Inicio: {dayjs(singleConvocatoria.inicio).format('D [de] MMMM [de] YYYY')}                             
                        </p>
                    </div>
                    <div className='lg:mt-8 lg:pt-4'>
                        <p className='rounded-2xl bg-etiqueta-ter text-titulo text-26 font-bold px-5 py-2'>
                            Formato: {singleConvocatoria.tipo_curso.formato}
                        </p>
                    </div>
                    <div className='lg:mt-8 lg:pt-4'>
                        <p className='rounded-2xl bg-etiqueta text-primary text-26 font-bold px-5 py-2'>
                            Horario: {singleConvocatoria.Horario}
                        </p>
                    </div>
                </section>
                <section className='lg:w-10/12 mx-auto my-15'>
                    <div className='grid grid-cols-6 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-5'>
                            <h2 className='text-primary text-36 font-extrabold'>Objetivo</h2>
                            <div dangerouslySetInnerHTML={{__html: singleConvocatoria.Objetivo}} className='mt-5 prose max-w-none cursos' />
                        </div>
                    </div>
                    <div className='my-20 grid grid-cols-6 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-5'>
                            <h2 className='text-primary text-36 font-extrabold'>Perfil de Ingreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.p_ingreso}} className='mt-5 prose max-w-none cursos' />
                        </div>
                    </div>
                     <div className='grid grid-cols-6 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-5'>
                            <h2 className='text-primary text-36 font-extrabold'>Perfil de Egreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.p_egreso}} className='mt-5 prose max-w-none cursos' />                        
                        </div>
                    </div>
                </section>
                <ConvocatoriasList />
                <section className='grid grid-cols-6 gap-4 lg:w-10/12 mx-auto mb-15'>
                    <div className='col-span-1'></div>
                    <div className='col-span-5 grid lg:grid-cols-2 gap-5'>
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36 mb-10'>Vigencia</strong> 
                            <p className='text-20 text-titulo pt-6'>{singleConvocatoria.vigencia}</p>
                        </div>
                        <div className='my-5'>
                            <strong className='text-primary font-extrabold text-36'>Contacto</strong> 
                        <p className='text-20 text-titulo pt-6'>{singleConvocatoria.contacto}</p>
                        </div>
                    </div>                
                </section>
                <ConvocatoriasInst />
            </article>
        </>
    );
}
