import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlanTrabajo() {
    const [planTrabajo, setPlanTrabajo] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlanTrabajo = async () => {
            const response = await api.get('/plan-trabajo')
            setPlanTrabajo(response.data.plan_trabajo)
        }
        fetchPlanTrabajo()
    }, [location])

    return (
        <div className="border-2 border-red-500">
            <h1>Plan de Trabajo</h1>
            {planTrabajo.map(planTrabajo => (
                <div key={planTrabajo.id}>
                    <h3>{planTrabajo.nombre}</h3>
                    <p>{planTrabajo.descripcion}</p>
                </div>
            ))}
        </div>
    )
}
    