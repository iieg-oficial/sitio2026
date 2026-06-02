import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlanInstitucional() {
    const [planInstitucional, setPlanInstitucional] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlanInstitucional = async () => {
            const response = await api.get('/docs_iieg/tipo/plan_institucional')
            setPlanInstitucional(response.data.docs_iieg)
        }
        fetchPlanInstitucional()
    }, [location])

    return (
        <div className="container-fuid py-15 px-2">
            <h1 className="font-bold text-3xl text-center">Plan Institucional</h1>
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
            {planInstitucional.map(planInstitucional => (
                <div key={planInstitucional.id} className="bg-gray-100  p-4 my-4 text-center">
                    <img src={planInstitucional.imagen ? planInstitucional.imagen : "/default.png"} alt={planInstitucional.nombre} className='w-[50px] h-auto mx-auto mb-5'/>
                    <h3 className="col-span-12">{planInstitucional.nombre}</h3>                    
                </div>
            ))}
            </div>
        </div>
    )
}
    