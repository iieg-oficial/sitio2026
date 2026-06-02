import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import { format } from 'date-fns';

export default function PlanTrabajo() {
    const [planTrabajo, setPlanTrabajo] = useState([]);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(null);

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
        <div className="container-fuid py-15 px-2">
            <h1 className="font-bold text-3xl text-center">Plan de Trabajo</h1>
            <div className="container mx-auto">
                <div className="flex gap-2 mb-4">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => { setActiveTab(year); setItemOffset(0); } }
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === year
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
                <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {postsByYear.map(planTrabajo => (
                        <div key={planTrabajo.id} className="flex items-center gap-2 mb-4 p-4 border rounded-lg">
                            <img src={planTrabajo.imagen ? planTrabajo.imagen : "/default.png"} alt={planTrabajo.nombre} className='w-[50px] h-auto float-right'/>
                            <h3>{planTrabajo.nombre}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
    