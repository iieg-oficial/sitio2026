import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';

export default function Convocatorias() {
    const [convocatorias, setConvocatorias] = useState([])
    
    const fetchConvocatorias = async () => {
        const response = await api.get('/cursos-public', { params: { destacado: false, tipo_curso: 'convocatoria' } })
        setConvocatorias(response.data.cursos)
    }

    useEffect(() => {
        fetchConvocatorias()
    }, []);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const pageCount = Math.ceil(convocatorias.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % convocatorias.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, []);

    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4'>
                {convocatorias.map(convocatoria => (
                    <div className='border-2 border-yellow-500 rounded-lg p-4' key={convocatoria.id}>                        
                        <h3>{convocatoria.titulo}</h3>
                        <p>{convocatoria.descripcion}</p>
                        <Link to={`/convocatorias/${convocatoria.slug}`} className='text-blue-500 hover:underline'>Leer más</Link>
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