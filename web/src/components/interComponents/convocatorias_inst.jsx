import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import api from '@services/apiService'

export default function ConvocatoriasInst() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleConvocatoria, setSingleConvocatoria] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await api.get(`/cursos-public/slug/${slug}`);
                const convocatoria = response.data;
                setSingleConvocatoria(convocatoria);
                setActiveTab(convocatoria?.perfiles?.[0]?.area || null);
                setError(null);
            } catch (error) {
                console.error("Error al obtener la convocatoria:", error);
                setError(error?.response?.data?.detail || error.message || 'Error al obtener la convocatoria');
                setSingleConvocatoria(null);
                setActiveTab(null);
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
        <section className='lg:w-8/12 mx-auto my-15'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto w-11/12 md:w-8/12'>
                {singleConvocatoria.instituciones.map((institucion) => (
                    <div key={institucion.id} className='bg-card p-5 my-5 grid md:grid-cols-2 rounded-3xl gap-4'>
                        <img src={institucion.logo} alt="{institucion.nombre}" />                        
                    </div>
                ))}
            </div>
        </section>
        </>
    );
}   