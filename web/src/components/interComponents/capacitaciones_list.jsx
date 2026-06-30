import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import api from '@services/apiService'

export default function CapacitacionesList() {
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
        <section className='container mx-auto'>
                    <h2>Módulos</h2>
                    <div className='flex justify-center mt-8'>
                        {singleCapacitacion.modulos.map((modulo) => (
                            <button 
                            key={modulo.id}
                            onClick={() => setActiveTab(modulo.nombre)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === modulo.nombre
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`
                            }
                            >
                                {modulo.nombre}
                            </button>
                        ))}
                    </div>
                    <div className='border-2 border-gray-200 p-5 my-5'>
                        {singleCapacitacion.modulos.map((modulo) => {
                            if (activeTab === modulo.nombre) {
                                return (
                                    <div key={modulo.id}>
                                        <h2>{modulo.nombre}</h2>
                                        <p>{modulo.descripcion}</p>
                                    </div>
                                )}
                            } 
                        )}
                    </div>
                </section>

                <section className='container mx-auto'>
                    <h2>Profesores</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto w-11/12 md:w-8/12'>
                        {singleCapacitacion.profesores.map((profesor) => (
                           <div key={profesor.id} className='border-2 border-gray-200 p-5 my-5'>
                            <p>{profesor.nombre}</p>
                            <p>{profesor.descripcion}</p>
                           </div>
                        ))}
                    </div>                    
                </section>
        </>
    )
}