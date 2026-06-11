import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'

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
        <div className="container-fuid py-15 px-2 bg-card" id="plan-institucional">
            <h2 className="text-center mb-15">Plan Institucional</h2>
            
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
            {planInstitucional.map(planInstitucional => (
                <div key={planInstitucional.id} className="p-4 my-4 text-center">
                    <img src={planInstitucional.imagen ? planInstitucional.imagen : "/default.png"} alt={planInstitucional.nombre} className='w-[50px] h-auto mx-auto mb-5'/>
                    <h5 className="col-span-12 text-titulo">{planInstitucional.nombre}</h5>                    
                </div>
            ))}
            </div>
            <div className="container mx-auto">
                <TrackedLink to="/plan-institucional" className="button2 block mx-auto w-[350px] text-center mt-3 text-primary hover:text-white border-primary hover:bg-primary">
                    Quiero descargar el plan institucional
                </TrackedLink>
            </div>
        </div>
    )
}
    