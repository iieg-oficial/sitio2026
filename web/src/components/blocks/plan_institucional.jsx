import { useEffect, useState } from 'react';
import api from '@services/apiService';
import TrackedLink from '@components/blocks/boton';

export default function PlanInstitucional() {
    const [planInstitucional, setPlanInstitucional] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchPlanInstitucional = async () => {
            try {
                const response = await api.get('/docs_iieg/tipo/plan_institucional');
                const docs = response.data?.docs_iieg;
                if (isMounted) {
                    setPlanInstitucional(Array.isArray(docs) ? docs : []);
                }
            } catch (error) {
                console.error("Error al obtener el plan institucional:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPlanInstitucional();

        return () => {
            isMounted = false;
        };
    }, []);

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
                                src={item?.imagen ? item.imagen : "/default.png"} 
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
                    to="/plan-institucional" 
                    className="button2 block mx-auto w-[350px] text-center text-primary hover:text-white border-primary hover:bg-primary py-3 rounded-lg"
                >
                    Quiero descargar el plan institucional
                </TrackedLink>
            </div>
        </div>
    );
}