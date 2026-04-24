import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'

export default function Convocatorias() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleConvocatoria, setSingleConvocatoria] = useState(null);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await api.get(`/cursos-public/${slug}`);
                setSingleConvocatoria(response.data);
            } catch (error) {
                console.error("Error al obtener la convocatoria:", error);
            }
        }
        fetchConvocatoria();
    }, [slug]);

    if (!singleConvocatoria) {
        return <div>Cargando ...</div>;
    }

    return (
        <>
            <Helmet>
                <title>{singleConvocatoria.titulo}</title>
                <meta name="description" content={singleConvocatoria.resumen} />
                <meta property="og:title" content={singleConvocatoria.titulo} />
                <meta property="og:description" content={singleConvocatoria.resumen} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            <article className='my-40 relative flex flex-col items-center'>
                <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
                    <h1 className='text-3xl font-bold mb-4'>{singleConvocatoria.titulo}</h1>
                    <div dangerouslySetInnerHTML={{__html: singleConvocatoria.descripcion}} className='mt-5 prose max-w-none' />
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Fecha:</strong> {new Date(singleConvocatoria.inicio).toLocaleDateString()}</p>
                        <p><strong>Tipo:</strong> {singleConvocatoria.tipo_curso.titulo}</p>
                    </div>
                </main>
            </article>
        </>
    );
}
