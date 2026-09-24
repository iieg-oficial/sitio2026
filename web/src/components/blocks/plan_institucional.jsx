import { useEffect, useState, useCallback } from 'react';
import api from '@services/apiService';
import TrackedLink from '@components/blocks/boton';

export default function PlanInstitucional() {
    const [planInstitucional, setPlanInstitucional] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlanInstitucional = useCallback(async () => {
        try {
            const response = await api.get('/docs_iieg/tipo/plan_institucional', {
                params: { _t: new Date().getTime() }
            });
            const docs = response.data?.docs_iieg;
            const sorted = Array.isArray(docs) ? [...docs].sort((a, b) => (b.id || 0) - (a.id || 0)) : [];
            setPlanInstitucional(sorted);
        } catch (error) {
            console.error("Error al obtener el plan institucional:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlanInstitucional();

        const handleFocus = () => {
            fetchPlanInstitucional();
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchPlanInstitucional]);

    if (loading) {
        return <p className="text-center py-6">Cargando Plan Institucional...</p>;
    }

    return (
        <div className="container-fluid py-15 px-2 bg-card" id="plan-institucional">
            <h2 className="text-center mb-15">Plan Institucional 2025-2030</h2>
            
            {planInstitucional.length > 0 ? (
                <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
                    {planInstitucional.map((item, idx) => (
                        <div key={item?.id || idx} className="p-4 my-4 text-center">
                            <img 
                                src={item?.imagen ? item.imagen : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} 
                                alt={item?.nombre || "Plan Institucional"} 
                                className="object-contain mx-auto mb-5 w-[50%]"
                            />
                            <h5 className="col-span-12 text-titulo font-garet-bold text-22">{item?.nombre || 'Sin título'}</h5>                    
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 my-8">
                    No hay registros disponibles en el plan institucional por el momento.
                </p>
            )}

            <div className="container mx-auto mt-6">
                <TrackedLink 
                    to="https://iieg.jalisco.gob.mx/acervo/portal/documentosIieg/documentos/plan_institucional_iieg_2024_2030.pdf" 
                    className="button2 block mx-auto w-full sm:w-[405px] text-center text-primary hover:text-white border-primary hover:bg-primary py-3 rounded-lg"
                >
                    Quiero descargar el plan institucional
                </TrackedLink>
            </div>
        </div>
    );
}