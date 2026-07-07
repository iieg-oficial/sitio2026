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

    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl p-4 container mx-auto'>
                {currentItems.map(convocatoria => (
                    <TrackedLink to={`/convocatorias/${convocatoria.slug}`} className="" rel="noopener noreferrer">
                        <div className='grid md:grid-cols-6 hover:border hover:border-tertiary rounded-3xl' key={convocatoria.id}>                        
                            <div className='md:col-span-2'></div>
                                <div className='md:col-span-4 p-6'>
                                    <h3 className='text-28 text-primary'>{convocatoria.titulo}</h3>                            
                                    <div dangerouslySetInnerHTML={{__html: convocatoria.descripcion}} className='diez mt-5' />                        
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