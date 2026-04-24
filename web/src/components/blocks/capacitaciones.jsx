import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';

export default function Capacitaciones() {
    const [capacitaciones, setCapacitaciones] = useState([])
    const [capacitacionesDestacadas, setCapacitacionesDestacadas] = useState([])

    const fetchCapacitaciones = async () => {
        const response = await api.get('/cursos-public', { params: { destacado: false, tipo_curso: 'capacitacion' } })
        setCapacitaciones(response.data.cursos)
    }

    const fetchCapacitacionesDestacadas = async () => {
        const response = await api.get('/cursos-public', { params: { destacado: true, tipo_curso: 'capacitacion' } })
        setCapacitacionesDestacadas(response.data.cursos)
    }

    useEffect(() => {
        fetchCapacitaciones()
        fetchCapacitacionesDestacadas()
    }, []);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const pageCount = Math.ceil(capacitaciones.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % capacitaciones.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, []);

    return (
        <div>
            <div className='grid grid-cols-1 gap-4 border-2 border-blue-500 rounded-lg p-4'>
                {capacitacionesDestacadas.map(capacitacion => (
                    <div className='border-2 border-green-500 rounded-lg p-4' key={capacitacion.id}>                        
                        <h3>{capacitacion.titulo}</h3>
                        <p>{capacitacion.descripcion}</p>
                        <Link to={`/capacitaciones/${capacitacion.slug}`} className='text-blue-500 hover:underline'>Leer más</Link>
                    </div>
                ))}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4'>
                {capacitaciones.map(capacitacion => (
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