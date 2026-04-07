import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlanInstitucional() {
    const [planInstitucional, setPlanInstitucional] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlanInstitucional = async () => {
            const response = await api.get('/plan-institucional')
            setPlanInstitucional(response.data.planInstitucional)
        }
        fetchPlanInstitucional()
    }, [location])

    return (
        <div className="border-2 border-red-500">
            <h1>Plan Institucional</h1>
            {planInstitucional.map(planInstitucional => (
                <div key={planInstitucional.id}>
                    <h3>{planInstitucional.nombre}</h3>
                    <p>{planInstitucional.descripcion}</p>
                </div>
            ))}
        </div>
    )
}
    