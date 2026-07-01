import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import CapacitacionesList from './capacitaciones_list';
import BackLink from './../pageComponents/Backlink'

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

    return (
        <>
            <Helmet>
                <title>{singleCapacitacion.titulo}</title>
                <meta name="description" content={singleCapacitacion.resumen} />
                <meta property="og:title" content={singleCapacitacion.titulo} />
                <meta property="og:description" content={singleCapacitacion.resumen} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            <article className='my-40 relative'>
                <BackLink />
                <main className='grid md:grid-cols-6 mx-auto'>
                    <div className='md:col-span-2'></div>
                    <div className='md:col-span-4'>
                        <h1 className='text-3xl font-bold mb-4'>{singleCapacitacion.titulo}</h1>
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.descripcion}} className='mt-5 prose max-w-none' />
                    </div>
                </main>
                <section className='w-11/12 mx-auto flex flex-wrap gap-5 text-14 justify-between'>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Inicio de clases:</strong> {new Date(singleCapacitacion.inicio).toLocaleDateString()}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Formato:</strong> {singleCapacitacion.tipo_curso.formato}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Horario:</strong> {singleCapacitacion.Horario}</p>
                    </div>
                </section>
                <section className='w-11/12 md:w-10/12 mx-auto my-15'>
                    <div>
                        <h2 className='text-center'>Objetivo</h2>
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.Objetivo}} className='mt-5 prose max-w-none w-8/12 mx-auto bg-card rounded-3xl p-6' />
                    </div>
                    <div className='my-20'>
                        <h2 className='text-center'>Perfil de Ingreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.p_ingreso}} className='mt-5 prose max-w-none w-8/12 mx-auto bg-card rounded-3xl p-6' />
                    </div>
                     <div>
                        <h2 className='text-center'>Perfil de Egreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.p_egreso}} className='mt-5 prose max-w-none w-8/12 mx-auto bg-card rounded-3xl p-6' />                        
                    </div>
                </section>
                    
                <CapacitacionesList curso={singleCapacitacion} />

                <section className='grid md:grid-cols-2 gap-4 lg:w-8/12 mx-auto'>
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Inscripción:</strong> 
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.inscripcion}} className='mt-5 prose max-w-none' />                        
                    </div>
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Acreditación:</strong> 
                        <div dangerouslySetInnerHTML={{__html: singleCapacitacion.acreditacion}} className='mt-5 prose max-w-none' />                        
                    </div>
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Vigencia:</strong> 
                        <p>{singleCapacitacion.vigencia}</p>
                    </div>
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Contacto:</strong> 
                        <p>{singleCapacitacion.contacto}</p>
                    </div>
                </section>
                    
            </article>
        </>
    );
}