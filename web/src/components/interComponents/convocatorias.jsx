import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import ConvocatoriasList from './convocatorias_list';

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

    return (
        <>
            <Helmet>
                <title>{singleConvocatoria.nombre}</title>
                <meta name="description" content={singleConvocatoria.resumen} />
                <meta property="og:title" content={singleConvocatoria.nombre} />
                <meta property="og:description" content={singleConvocatoria.resumen} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            <article className='my-40 relative flex flex-col items-center'>
                <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
                    <h1 className='text-3xl font-bold mb-4'>{singleConvocatoria.titulo}</h1>
                    <div dangerouslySetInnerHTML={{__html: singleConvocatoria.descripcion}} className='mt-5 prose max-w-none' />
                </main>
                <section className='grid grid-cols-1 md:grid-cols-3'>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Fecha:</strong> {new Date(singleConvocatoria.inicio).toLocaleDateString()}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Formato:</strong> {singleConvocatoria.tipo_curso.formato}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Horario:</strong> {singleConvocatoria.Horario}</p>
                    </div>
                </section>
                <section className='w-11/12 md:w-10/12 mx-auto'>
                    <div>
                        <h2>Objetivo</h2>
                        <p>{singleConvocatoria.Objetivo}</p>
                    </div>
                    <div>
                        <h2>Perfil de Ingreso</h2>
                        <p>{singleConvocatoria.p_ingreso}</p>
                    </div>
                     <div>
                        <h2>Perfil de Egreso</h2>
                        <p>{singleConvocatoria.p_egreso}</p>                        
                    </div>
                </section>
                <ConvocatoriasList />
                <section>
                    <p><strong>Vigencia:</strong> {singleConvocatoria.vigencia}</p><br></br>
                    <p><strong>Contacto:</strong> {singleConvocatoria.contacto}</p><br></br>
                </section>
            </article>
        </>
    );
}
