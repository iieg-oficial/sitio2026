import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import CapacitacionesList from './capacitaciones_list';

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
            <article className='mx-auto container my-40 relative flex flex-col items-center'>
                <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
                    <h1 className='text-3xl font-bold mb-4'>{singleCapacitacion.titulo}</h1>
                    <div dangerouslySetInnerHTML={{__html: singleCapacitacion.descripcion}} className='mt-5 prose max-w-none' />
                </main>
                <section className='grid grid-cols-1 md:grid-cols-3'>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Fecha:</strong> {new Date(singleCapacitacion.inicio).toLocaleDateString()}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Formato:</strong> {singleCapacitacion.tipo_curso.formato}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Horario:</strong> {singleCapacitacion.Horario}</p>
                    </div>
                </section>
                <section className='w-11/12 md:w-10/12 mx-auto'>
                    <div>
                        <h2>Objetivo</h2>
                        <p>{singleCapacitacion.Objetivo}</p>
                    </div>
                    <div>
                        <h2>Perfil de Ingreso</h2>
                        <p>{singleCapacitacion.p_ingreso}</p>
                    </div>
                     <div>
                        <h2>Perfil de Egreso</h2>
                        <p>{singleCapacitacion.p_egreso}</p>                        
                    </div>
                </section>
                    
                <CapacitacionesList />

                <section>
                    <p><strong>Inscripción:</strong> {singleCapacitacion.inscripcion}</p><br></br>
                    <p><strong>Acreditación:</strong> {singleCapacitacion.acreditacion}</p><br></br>
                    <p><strong>Vigencia:</strong> {singleCapacitacion.vigencia}</p><br></br>
                    <p><strong>Contacto:</strong> {singleCapacitacion.contacto}</p><br></br>
                </section>
                    
            </article>
        </>
    );
}