import { useState, useCallback } from 'react';
import api from '@services/apiService';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Normatividad() {
    const [normatividad, setNormatividad] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNormatividad = useCallback(async () => {
        try {
            const response = await api.get('/docs_iieg/tipo/normatividad');
            const docs = response.data?.docs_iieg;
            const sorted = Array.isArray(docs) ? [...docs].sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
            setNormatividad(sorted);
        } catch (error) {
            console.error("Error al obtener la normatividad:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ejecuta la carga inicial y la sincronización al volver a la ventana/pestaña
    useFetchOnFocus(fetchNormatividad);

    if (loading && normatividad.length === 0) {
        return <p className="text-center py-6">Cargando Normatividad...</p>;
    }

    return (
        <div className="container-fluid py-15 px-2 bg-card">
            <h2 className="text-titulo text-center">Normatividad</h2>
            
            <div className="container mx-auto mt-8">
                {normatividad.length > 0 ? (
                    normatividad.map((item, idx) => (
                        <div key={item?.id || idx} className="flex items-center gap-2 mb-4 p-4 border border-[#E6EEFF] rounded-3xl group bg-white hover:border-tertiary">
                            <a 
                                href={item?.documento || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                download 
                                className='flex gap-4'
                            >
                                <div className="group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center">
                                    <span className="material-symbols--download group-hover:bg-white!"></span>
                                </div>
                                <p className='text-22 text-titulo group-hover:text-tertiary'>
                                    {item?.nombre || 'Documento sin título'}
                                </p>
                            </a>
                        </div> 
                    ))
                ) : (
                    <p className="text-center text-gray-500 my-8">
                        No hay documentos de normatividad disponibles por el momento.
                    </p>
                )}
            </div>
        </div>
    );
}