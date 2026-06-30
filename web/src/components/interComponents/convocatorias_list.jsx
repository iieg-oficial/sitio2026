import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import api from '@services/apiService'

export default function ConvocatoriasList() {
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
        <section className='container mx-auto'>
            <h2 className='text-center'>Perfiles</h2>
            <div className='flex justify-left mt-8 gap-4 mx-auto w-8/12'>
                {singleConvocatoria.perfiles.map((perfil) => (
                    <button 
                    key={perfil.id}
                    onClick={() => setActiveTab(perfil.area)}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === perfil.area
                        ? 'bg-tertiary text-white border-tertiary'
                                : 'bg-white text-tertiary border-tertiary hover:bg-etiqueta-sec'}`
                    }
                    >
                        {perfil.area}
                    </button>
                ))}
            </div>
            <div className='bg-card p-5 my-5 mx-auto w-8/12 rounded-3xl'>
                {singleConvocatoria.perfiles.map((perfil) => {
                    if (activeTab === perfil.area) {
                        return (
                            <div key={perfil.id}>
                                <h2>{perfil.nombre}</h2>
                                <div dangerouslySetInnerHTML={{__html: perfil.descripcion}} className='mt-5 prose max-w-none' />                        
                            </div>
                        )
                    }
                })}
            </div>
        </section>
        <section>
            <h2 className='text-center'>Instituciones</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto w-11/12 md:w-8/12'>
                {singleConvocatoria.instituciones.map((institucion) => (
                    <div key={institucion.id} className='bg-card p-5 my-5 grid md:grid-cols-2 rounded-3xl gap-4'>
                        <img src={institucion.logo} alt="" />
                        <h2>{institucion.nombre}</h2>
                    </div>
                ))}
            </div>
        </section>
        </>
    );
}   