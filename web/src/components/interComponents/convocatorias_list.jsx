import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import api from '@services/apiService'

export default function ConvocatoriasList() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleConvocatoria, setSingleConvocatoria] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

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
        <section className='container mx-auto'>
            <h2>Perfiles</h2>
            <div className='flex justify-center mt-8'>
                {singleConvocatoria.perfiles.map((perfil) => (
                    <button 
                    key={perfil.id}
                    onClick={() => setActiveTab(perfil.area)}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === perfil.area
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`
                    }
                    >
                        {perfil.area}
                    </button>
                ))}
            </div>
            <div className='border-2 border-gray-200 p-5 my-5'>
                {singleConvocatoria.perfiles.map((perfil) => {
                    if (activeTab === perfil.area) {
                        return (
                            <div key={perfil.id}>
                                <h2>{perfil.nombre}</h2>
                                <p>{perfil.descripcion}</p>
                            </div>
                        )
                    }
                })}
            </div>
        </section>
        <section>
            <h2>Instituciones</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {singleConvocatoria.instituciones.map((institucion) => (
                    <div key={institucion.id}>
                        <h2>{institucion.nombre}</h2>
                        <p>{institucion.descripcion}</p>
                    </div>
                ))}
            </div>
        </section>
        </>
    );
}   