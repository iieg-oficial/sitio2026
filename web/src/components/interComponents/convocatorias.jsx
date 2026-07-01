import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'
import ConvocatoriasList from './convocatorias_list';
import Backlink from '../pageComponents/Backlink';

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
            <article className='my-40 relative'>
                <Backlink />
                <main className='mx-auto container grid md:grid-cols-6 rounded-3xl bg-card p-4'>
                    <div className='col-span-2'></div>
                    <div className='col-span-4'>
                        <h1 className='text-44 font-bold mb-4'>{singleConvocatoria.titulo}</h1>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.descripcion}} className='mt-5 prose max-w-none' />
                    </div>
                </main>
                <section className='w-11/12 mx-auto flex flex-wrap gap-5 text-14 justify-between'>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Fecha:</strong> {new Date(singleConvocatoria.inicio).toLocaleDateString()}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Formato:</strong> {singleConvocatoria.tipo_curso.formato}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 pt-4'>
                        <p><strong>Horario:</strong> {singleConvocatoria.Horario}</p>
                    </div>
                </section>
                <section className='w-11/12 md:w-10/12 mx-auto my-15'>
                    <div>
                        <h2 className='text-center'>Objetivo</h2>
                        <p className='bg-card rounded-4xl p-5 mx-auto w-8/12'>{singleConvocatoria.Objetivo}</p>
                    </div>
                    <div>
                        <h2 className='text-center'>Perfil de Ingreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.p_ingreso}} className='mt-5 prose max-w-none roundend-4xl bg-card p-5 mx-auto w-8/12' />
                        
                    </div>
                     <div>
                        <h2 className='text-center'>Perfil de Egreso</h2>
                        <div dangerouslySetInnerHTML={{__html: singleConvocatoria.p_egreso}} className='mt-5 prose max-w-none roundend-4xl bg-card p-5 mx-auto w-8/12' />
                                            
                    </div>
                </section>
                <ConvocatoriasList />
                <section className="grid md:grid-cols-2 gap-4 lg:w-8/12 mx-auto">
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Vigencia:</strong> 
                        <p>{singleConvocatoria.vigencia}</p>
                    </div>
                    <div className='bg-card p-5 my-5 rounded-3xl'>
                        <strong>Contacto:</strong> 
                        <p>{singleConvocatoria.contacto}</p>
                    </div>
                </section>
            </article>
        </>
    );
}
