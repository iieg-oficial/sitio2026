import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Mapas() {
    const [mapas, setMapas] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchMapas = async () => {
            const response = await api.get('/mapas/random')
            setMapas(response.data.mapas)
        }
        fetchMapas()
    }, [location])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapas.map(mapa => (
                <div key={mapa.id} className="border rounded-lg p-4">
                    <h3>{mapa.titulo}</h3>
                    <div dangerouslySetInnerHTML={{ __html: mapa.descripcion }} />
                    <p>{mapa.ubicacion}</p>
                    {mapa.anyo && <p><strong>Año:</strong> {mapa.anyo}</p>}
                    <p>imagen: {mapa.imagen}</p>
                    <p>archivo: {mapa.archivo}</p>
                    <p>autor: {mapa.autor}</p>
                    <p>medida: {mapa.medida}</p>
                    <p>escala: {mapa.escala}</p>
                    <p>edicion: {mapa.edicion}</p>
                    <p>editor: {mapa.editor}</p>
                    <p>sitio web: {mapa.sitio_web}</p>
                </div>
            ))}
        </div>
    )
}