import { useEffect, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'descripcion', 'claves', 'subject.titulo'];

    const fetchDocumentaciones = async () => {
        const response = await api.get('/documentacion')
        setDocumentaciones(response.data.documentaciones)
    }

    useEffect(() => {
        fetchDocumentaciones()
    }, []);

    const filteredDocumentaciones = !searchTerm 
        ? documentaciones
        : documentaciones.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const pageCount = Math.ceil(filteredDocumentaciones.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredDocumentaciones.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4'>
                {filteredDocumentaciones.map(documentacion => (
                    <div className='border-2 border-yellow-500 rounded-lg p-4' key={documentacion.id}>
                        <span className='text-blue-600 font-semibold'>{format(new Date(documentacion.fecha), 'yyyy')}</span>
                        <h3>{documentacion.titulo}</h3>
                        <p>{documentacion.descripcion}</p>
                        <p>periocidad: {documentacion.periocidad}</p>
                        <p>subtema: {documentacion.subtema}</p>
                        <p>fecha: {documentacion.fecha}</p>
                        <p>archivo: {documentacion.archivo}</p>
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