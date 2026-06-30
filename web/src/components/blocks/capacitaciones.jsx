import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

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
            <div className='grid grid-cols-1 gap-4 rounded-3xl p-4 container mx-auto bg-card hover:border hover border-tertiary'>
                {capacitacionesDestacadas.map(capacitacion => (
                    <TrackedLink to={`/capacitaciones/${capacitacion.slug}`} className="" target="_blank" rel="noopener noreferrer">
                    <div className='grid md:grid-cols-6' key={capacitacion.id}>                        
                        <div className='md:col-span-2'></div>
                        <div className='md:col-span-4'>
                            <h3 className='text-44 text-primary'>{capacitacion.titulo}</h3>
                            <div dangerouslySetInnerHTML={{__html: capacitacion.descripcion}} className='diez mt-5' />
                            <div className='bg-white rounded-full float-right w-[27px] h-[27px] text-center mt-10'>
                                <span className="material-symbols--chevron-right"></span>
                            </div>
                        </div>                        
                    </div>
                    </TrackedLink>
                ))}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-15 container mx-auto'>
                {currentItems.map(capacitacion => (
                    <TrackedLink to={`/capacitaciones/${capacitacion.slug}`} className="" target="_blank" rel="noopener noreferrer">
                    <div className='grid md:grid-cols-6 hover:border hover:border-tertiary rounded-3xl' key={capacitacion.id}>                        
                        <div className='md:col-span-2'></div>
                        <div className='md:col-span-4 p-6'>
                            <h3 className='text-28 text-primary'>{capacitacion.titulo}</h3>                            
                            <div className='bg-white rounded-full float-right w-[27px] h-[27px] text-center mt-10'>
                                <span className="material-symbols--chevron-right"></span>
                            </div>
                        </div>                        
                    </div>
                    </TrackedLink>
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