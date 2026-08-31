import { useEffect, useState } from 'react';
import api from '@services/apiService';

export default function Normatividad() {
    const [normatividad, setNormatividad] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchNormatividad = async () => {
            try {
                const response = await api.get('/docs_iieg/tipo/normatividad');
                const docs = response.data?.docs_iieg;
                if (isMounted) {
                    setNormatividad(Array.isArray(docs) ? docs : []);
                }
            } catch (error) {
                console.error("Error al obtener la normatividad:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchNormatividad();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return <p className="text-center py-6">Cargando Normatividad...</p>;
    }

    return (
        <div className="container-fuid py-15 px-2 bg-card">
            <h2 className="text-titulo text-center">Normatividad</h2>
            
            <div className="container mx-auto mt-8">
                {normatividad.length > 0 ? (
                    normatividad.map((item, idx) => (
                        <div key={item?.id || idx} className="flex items-center gap-2 mb-4 p-4 border border-[#E6EEFF] rounded-3xl group bg-white hover:border-tertiary group">
                            <a 
                                href={item?.documento || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                download 
                                className='flex gap-4'
                            >
                                <div className="group-hover:bg-tertiary group-hover:rounded-full w-[32px] h-[32px] p-2">
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