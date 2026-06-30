import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';

export default function Capacitaciones() {
    const [capacitaciones, setCapacitaciones] = useState([])
    const [capacitacionesDestacadas, setCapacitacionesDestacadas] = useState([])

    const isCapacitacion = (curso) => {
        if (!curso) return false
        if (typeof curso.tipo_curso === 'string') {
            return curso.tipo_curso === 'capacitacion'
        }
        if (curso.tipo_curso?.value) {
            return curso.tipo_curso.value === 'capacitacion'
        }
        if (curso.tipo_curso?.name) {
            return curso.tipo_curso.name === 'capacitacion'
        }
        return false
    }

    const fetchCapacitaciones = async () => {
        try {
            const response = await api.get('/cursos-public', {
                params: { tipo_curso: 'capacitacion' },
            })

            const cursos = response.data?.cursos ?? []
            const capacitacionesSolo = cursos.filter(isCapacitacion)
            const destacadas = capacitacionesSolo.filter(curso => curso.destacado === true).slice(0, 1)
            const noDestacadas = capacitacionesSolo.filter(curso => curso.destacado !== true)

            setCapacitacionesDestacadas(destacadas)
            setCapacitaciones(noDestacadas)
        } catch (error) {
            console.error('Error al cargar capacitaciones:', error)
            setCapacitaciones([])
            setCapacitacionesDestacadas([])
        }
    }

    useEffect(() => {
        fetchCapacitaciones()
    }, []);

    const [itemOffset, setItemOffset] = useState(0)
    const itemsPerPage = 12
    const endOffset = itemOffset + itemsPerPage
    const currentItems = capacitaciones.slice(itemOffset, endOffset)

    const pageCount = Math.ceil(capacitaciones.length / itemsPerPage)

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % capacitaciones.length
        setItemOffset(newOffset)
    }

    return (
        <div>
            <div className='bg-red-400 grid grid-cols-1 gap-4 border-2 border-blue-500 rounded-lg p-4'>
                {capacitacionesDestacadas.map(capacitacion => (
                    <div className='border-2 border-green-500 rounded-lg p-4' key={capacitacion.id}>                        
                        <h3>{capacitacion.titulo}</h3>
                        <p>{capacitacion.descripcion}</p>
                        <Link to={`/capacitaciones/${capacitacion.slug}`} className='text-blue-500 hover:underline'>Leer más</Link>
                    </div>
                ))}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4'>
                {currentItems.map(capacitacion => (
                    <div className='border-2 border-yellow-500 rounded-lg p-4' key={capacitacion.id}>                        
                        <h3>{capacitacion.titulo}</h3>
                        <p>{capacitacion.descripcion}</p>
                        <Link to={`/capacitaciones/${capacitacion.slug}`} className='text-blue-500 hover:underline'>Leer más</Link>
                    </div>
                ))}
            </div>


            <ReactPaginate
                previousLabel={"Ant"}
                nextLabel={"Sig"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                forcePage={Math.floor(itemOffset / itemsPerPage)}
            />
        </div>
    )
}