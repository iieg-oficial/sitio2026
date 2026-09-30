import { useState, useCallback } from 'react';
import api from '@services/apiService';
import { SafeHtml } from '@components/SafeHtml';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Valores() {
    const [valores, setValores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchValores = useCallback(async () => {
        try {
            const response = await api.get('/docs_iieg/tipo/valor');
            const docs = response.data?.docs_iieg;
            const sorted = Array.isArray(docs) ? [...docs].sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
            setValores(sorted);
        } catch (error) {
            console.error("Error al obtener los valores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización automática al enfocar la pestaña/ventana
    useFetchOnFocus(fetchValores);

    if (loading && valores.length === 0) {
        return <p className="text-center py-6">Cargando Valores...</p>;
    }

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
            
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {valores.map(valor => (
                    <div key={valor?.id} className="bg-card rounded-3xl px-4 py-6 my-4 grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                            <img 
                                src={valor?.imagen ? valor.imagen : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} 
                                alt={valor?.nombre || "Valor"} 
                                className="w-[50px] h-auto float-right"
                            />
                        </div>
                        <div className="col-span-10">
                            <h5 className="col-span-12 text-primary">{valor?.nombre}</h5>
                            <SafeHtml htmlContent={String(valor?.descripcion || '')} className='col-span-12 mt-5 diez'/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}