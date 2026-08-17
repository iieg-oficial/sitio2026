import { useEffect, useState } from 'react';
import api from '@services/apiService';

export default function Valores() {
    const [valores, setValores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchValores = async () => {
            try {
                const response = await api.get('/docs_iieg/tipo/valor');
                const docs = response.data?.docs_iieg;
                if (isMounted) {
                    setValores(Array.isArray(docs) ? docs : []);
                }
            } catch (error) {
                console.error("Error al obtener los valores:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchValores();

        return () => {
            isMounted = false;
        };
    }, []); // ⚠️ Se ejecuta únicamente al montar el componente

    if (loading) {
        return <p className="text-center py-6">Cargando Valores...</p>;
    }

    // Si la base de datos está vacía, mostramos un mensaje amigable en lugar de romper
    if (!valores || valores.length === 0) {
        return (
            <div className="container-fluid py-10 text-center">
                <h2>Valores</h2>
                <p className="text-gray-500 mt-4">No hay información de valores disponible actualmente.</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-15 px-2">
            <h2 className="text-center mb-15">Valores</h2>
            
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10 xl:gap-x-20">
                {valores.map(valor => (
                    <div key={valor?.id} className="bg-card rounded-3xl px-4 py-6 my-4 grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                            <img 
                                src={valor?.imagen ? valor.imagen : "/default.png"} 
                                alt={valor?.nombre || "Valor"} 
                                className="w-[50px] h-auto float-right"
                            />
                        </div>
                        <div className="col-span-10">
                            <h5 className="col-span-12 text-primary">{valor?.nombre}</h5>
                            <div 
                                className="col-span-12 mt-5 diez" 
                                dangerouslySetInnerHTML={{ __html: String(valor?.descripcion || '') }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}