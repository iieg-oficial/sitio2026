import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

export default function Convocatorias() {
    const [convocatorias, setConvocatorias] = useState([])
    

     const isConvocatoria = (curso) => {
        if (!curso) return false
        if (typeof curso.tipo_curso === 'string') {
            return curso.tipo_curso === 'convocatoria'
        }
        if (curso.tipo_curso?.value) {
            return curso.tipo_curso.value === 'convocatoria'
        }
        if (curso.tipo_curso?.name) {
            return curso.tipo_curso.name === 'convocatoria'
        }
        return false
    }

    const fetchConvocatorias = async () => {
        try {
            const response = await api.get('/cursos-public', {
                params: { tipo_curso: 'convocatoria' },
            })
            const cursos = response.data?.cursos ?? response.data ?? []
            const convocatoriaSolo = cursos.filter(isConvocatoria)
            setConvocatorias(convocatoriaSolo)
        } catch (error) {
            console.error('Error al cargar convocatorias:', error)
            setConvocatorias([])
        }
    }

    useEffect(() => {
        fetchConvocatorias()
    }, [])

    const [itemOffset, setItemOffset] = useState(0)
    const itemsPerPage = 12
    const endOffset = itemOffset + itemsPerPage
    const currentItems = convocatorias.slice(itemOffset, endOffset)

    const pageCount = Math.ceil(convocatorias.length / itemsPerPage)

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % convocatorias.length
        setItemOffset(newOffset)
    }

    const esFechaPasada = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const ahora = new Date();
        return ahora > fecha;
    };

    return (
        <div className='mb-10'>
            <div className='grid grid-cols-1 gap-4 p-4 container mx-auto bg-card hover:border hover:border-tertiary group rounded-3xl'>
                {currentItems.map(convocatoria => (
                    <TrackedLink to={`/convocatorias/${convocatoria.slug}`} className="" rel="noopener noreferrer">
                        <div className='grid md:grid-cols-6' key={convocatoria.id}>                        
                            <div className='md:col-span-2'>
                                <img src={convocatoria.img_portada} alt={convocatoria.titulo} className='rounded-3xl w-full h-full object-cover' />
                            </div>
                                <div className='md:col-span-4 p-6'>
                                    <h3 className='text-28 text-primary'>{convocatoria.titulo}</h3>                                                                
                                    <div dangerouslySetInnerHTML={{__html: convocatoria.descripcion}} className='diez my-5' /> 
                                    {esFechaPasada(convocatoria.fin) ? (
                                    <span className='rounded-2xl bg-etiqueta-ter border-titulo text-titulo text-14 px-5 py-2'>
                                        Convocatoria cerrada
                                    </span>
                                    ) : (
                                    <span className='rounded-2xl bg-etiqueta-sec border-tertiary text-tertiary text-14 px-5 py-2'>
                                        Convocatoria abierta
                                    </span>
                                    )}                        
                                    <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary'>
                                        <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                    </div>
                            </div>                        
                        </div>
                    </TrackedLink>
                ))}
            </div>


            {/*
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
            */}

            <div className='grid grid-cols-1 gap-4 p-4 container mx-auto bg-card rounded-3xl mt-16'>
                <div className='grid md:grid-cols-6'>                        
                    <div className='md:col-span-2'>
                        <img src='https://iieg.jalisco.gob.mx/acervo/portal/cursos/sesiones-informativas.png' alt='Sesiones informativas' className='rounded-3xl w-full h-full object-cover' />
                    </div>
                        <div className='md:col-span-4 p-6'>
                            <h3 className='text-28 text-primary'>Sesiones informativas</h3>                            
                                <div className='diez mt-5'>                        
                                    <p>Presentaciones orientadas a dar a conocer el trabajo, productos y servicios del IIEG, en función de las necesidades del público participante.</p>
                                </div>
                                <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 '>
                                    <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                </div>
                            </div>                        
                        </div>
            </div>
        </div>
    )
}