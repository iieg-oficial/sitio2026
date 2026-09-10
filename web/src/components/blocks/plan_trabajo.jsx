import { useEffect, useState, useMemo } from 'react';
import api from '@services/apiService';
import { format, isValid } from 'date-fns';

export default function PlanTrabajo() {
    const [planTrabajo, setPlanTrabajo] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchPlanTrabajo = async () => {
            try {
                const response = await api.get('/docs_iieg/tipo/plan_de_trabajo');
                const docs = response.data?.docs_iieg;
                if (isMounted) {
                    setPlanTrabajo(Array.isArray(docs) ? docs : []);
                }
            } catch (err) {
                console.error("Error al obtener planes de trabajo:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPlanTrabajo();

        return () => {
            isMounted = false;
        };
    }, []);

    // Cálculo seguro de años (usando useMemo)
    const years = useMemo(() => {
        if (!planTrabajo || !Array.isArray(planTrabajo) || planTrabajo.length === 0) return [];
        
        const extractedYears = planTrabajo
            .map(a => {
                if (!a?.fecha) return null;
                const d = new Date(a.fecha);
                return isValid(d) ? format(d, 'yyyy') : null;
            })
            .filter(Boolean); // Filtrar nulos o fechas inválidas

        return [...new Set(extractedYears)].sort((a, b) => Number(b) - Number(a));
    }, [planTrabajo]);

    // Establecer año activo cuando se calculen los años
    useEffect(() => {
        if (years.length > 0 && (!activeTab || !years.includes(activeTab))) {
            setActiveTab(years[0]);
        }
    }, [years, activeTab]);

    const postsByYear = useMemo(() => {
        if (!activeTab || !Array.isArray(planTrabajo)) return [];
        return planTrabajo.filter(a => {
            if (!a?.fecha) return false;
            const d = new Date(a.fecha);
            return isValid(d) && format(d, 'yyyy') === activeTab;
        });
    }, [planTrabajo, activeTab]);

    if (loading) {
        return <p className="text-center py-6">Cargando Plan de Trabajo...</p>;
    }

    return (
        <div className="container-fuid py-15">
            <h2 className="text-titulo text-center">Planes de trabajo e informes de actividades</h2>
            
            {years.length > 0 ? (
                <div className="container-fluid mx-auto mt-15">
                    <div className="relative container mx-auto px-2">
                        <span className="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                        <div
                            className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                        >                    
                            {years.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setActiveTab(year)}
                                    className={`px-10 py-3 cursor-pointer rounded-xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === year
                                            ? 'bg-etiqueta-sec text-tertiary border-tertiary'
                                            : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'}`}
                                >
                                    {year}
                                </button>
                            ))}                    
                        </div>
                        <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
                    </div>

                    <div className="mx-auto bg-card px-2 pt-2 container-fluid">
                        <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 container">
                            {postsByYear.map((item, idx) => (
                                <div key={item?.id || idx} className="flex items-center gap-2 mb-4 p-4 border border-[#E6EEFF] rounded-3xl group bg-white hover:border-tertiary group">
                                    <a 
                                        href={item?.documento || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        download 
                                        className='flex gap-4'
                                    >
                                        <div className="group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1">
                                            <span className="material-symbols--download group-hover:bg-white!"></span>
                                        </div>
                                        <p className='text-22 text-titulo group-hover:text-tertiary'>
                                            {item?.nombre || 'Documento sin título'}
                                        </p>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 my-8">
                    No hay planes de trabajo e informes disponibles por el momento.
                </p>
            )}
        </div>
    );
}