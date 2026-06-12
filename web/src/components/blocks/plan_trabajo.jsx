import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import { format } from 'date-fns';

export default function PlanTrabajo() {
    const [planTrabajo, setPlanTrabajo] = useState([]);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(null);
    const [itemOffset, setItemOffset] = useState(0);

    useEffect(() => {
        const fetchPlanTrabajo = async () => {
            const response = await api.get('/docs_iieg/tipo/plan_de_trabajo')
            setPlanTrabajo(response.data.docs_iieg)
        }
        fetchPlanTrabajo()
    }, [location])

    const years = [...new Set(
        planTrabajo.map(a => format(new Date(a.fecha), 'yyyy'))
    )].sort((a, b) => b - a);
    
    useEffect(() => {
        if (years.length > 0 && !years.includes(activeTab)) {
            setActiveTab(years[0]);
        }
    }, [years.join(',')]);

    const postsByYear = planTrabajo.filter(a =>
        format(new Date(a.fecha), 'yyyy') === activeTab
    );
    
    return (
        <div className="container-fuid py-15">
            <h2 className="text-titulo text-center">Planes de trabajo e informes de actividades</h2>
            <div className="container-fluid mx-auto mt-15">
                <div className="relative container mx-auto px-2">
                    <span class="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                    <div
                        className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                    >                    
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => { setActiveTab(year); setItemOffset(0); } }
                                className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === year
                                        ? 'bg-etiqueta-sec text-tertiary border-tertiary'
                                        : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'}`}
                            >
                                {year}
                            </button>
                        ))}                    
                    </div>
                    <span class="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
                </div>
                <div className="mx-auto bg-card px-2 pt-2 container-fluid">
                <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 container">
                    {postsByYear.map(planTrabajo => (
                        <div key={planTrabajo.id} className="flex items-center gap-2 mb-4 p-4 border border-[#E6EEFF] rounded-lg group bg-white">
                            <a href={planTrabajo.documento} target="_blank" rel="noopener noreferrer" download className='flex gap-4'>
                                <span className="material-symbols--download"></span> <p className='text-22 text-titulo group-hover:text-tertiary'>{planTrabajo.nombre}</p>
                            </a>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    )
}
    