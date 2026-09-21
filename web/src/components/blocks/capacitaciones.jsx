import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'
import { SafeHtml } from '@components/SafeHtml';

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

    const fetchCapacitaciones = useCallback( async () => {
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
    }, []);

    useEffect(() => {
        fetchCapacitaciones()
    }, [fetchCapacitaciones]);

    const [itemOffset, setItemOffset] = useState(0)
    const itemsPerPage = 12
    const endOffset = itemOffset + itemsPerPage
    const currentItems = capacitaciones.slice(itemOffset, endOffset)

    const pageCount = Math.ceil(capacitaciones.length / itemsPerPage)

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % capacitaciones.length
        setItemOffset(newOffset)
    }

    const esFechaPasada = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        return ahora > fecha;
    };
    

    return (
        <div>
            <div className='grid grid-cols-1 gap-4 rounded-3xl p-7 container 2xl:w-[70%] mx-auto bg-card hover:border hover:border-primary px-5 xl:px-5 2xl:px-0'>
                {capacitacionesDestacadas.map(capacitacion => (
                    <TrackedLink to={`/educacion-continua/${capacitacion.slug}`} key={capacitacion.id} className="" rel="noopener noreferrer">
                    <div className='grid lg:grid-cols-6 gap-6 px-2 sm:px-5 group'>                                               
                        <div className='lg:col-span-2'>
                            <img src={capacitacion.img_portada} alt={capacitacion.titulo} className='h-auto rounded-3xl w-full object-cover sm:w-1/2 lg:w-full text-center mx-auto' />
                        </div>
                        <div className='lg:col-span-4'>
                            <h3 className='text-44 text-primary font-garet-extra'>{capacitacion.titulo}</h3>
                            
                            <SafeHtml htmlContent={capacitacion.descripcion} className='diez mt-5 text-22 font-garet'/>
                            
                            <div className='grid grid-cols-2 gap-4 mt-10'>
                                <div>
                                    {esFechaPasada(capacitacion.fin) && (
                                        <span className='rounded-xl bg-[#FFF2E5] border border-[#FF83004D] font-garet-bold text-tertiary text-14 px-5 py-2'>Finalizado</span>
                                    )}   
                                </div>
                                <div>
                                    <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary text-center float-right'>
                                        <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                    </div>                                
                                </div>
                            </div>
                        </div>                        
                    </div>
                    </TrackedLink>
                ))}
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 p-7 gap-4 mt-15 container 2xl:w-[85%] mx-auto xl:px-5 2xl:px-0'>
                {currentItems.map(capacitacion => (
                    <TrackedLink to={`/educacion-continua/${capacitacion.slug}`} className="" rel="noopener noreferrer">
                    <div className='grid bg-card lg:grid-cols-6 hover:border hover:border-primary rounded-3xl px-2 sm:px-5 group' key={capacitacion.id}>                        
                        <div className='lg:col-span-2 pt-6'>
                            <img src={capacitacion.img_portada} alt={capacitacion.titulo} className='rounded-3xl w-full h-auto object-cover sm:w-1/2 lg:w-full text-center mx-auto' />
                        </div>                        
                        <div className='lg:col-span-4 p-6'>
                            <h3 className='text-28 text-primary font-garet-extra'>{capacitacion.titulo}</h3>                                
                            
                            <SafeHtml htmlContent={capacitacion.descripcion} className='diez mt-5 font-garet text-18'/>
                                                
                            <div className='grid grid-cols-2 gap-4 mt-10'>
                                <div>
                                    {esFechaPasada(capacitacion.fin) && (
                                        <span className='rounded-xl bg-[#FFF2E5] border border-[#FF83004D] font-garet-bold text-tertiary text-14 px-5 py-2'>Finalizado</span>
                                    )}   
                                </div>
                                <div>
                                    <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary text-center float-right'>
                                        <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                    </div>                                
                                </div>
                            </div>
                        </div>                        
                    </div>
                    </TrackedLink>
                ))}
            </div>


            {pageCount > 1 && (
                        <ReactPaginate
                            previousLabel={'<'}
                            nextLabel={'>'}
                            breakLabel={'...'}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={Math.floor(itemOffset / itemsPerPage)}
                        />
                    )}
        </div>
    )
}