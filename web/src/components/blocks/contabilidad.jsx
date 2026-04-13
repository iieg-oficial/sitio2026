import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import Searcher from '../pageComponents/searcher';

export default function Contabilidad() {
    const [contabilidad, setContabilidad] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'archivo', 'subject.titulo'];

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const showData = async () => {
        const response = await api.get('/archivos/contabilidad')
        setContabilidad(response.data)
    }

    useEffect(() => {
        showData()
    }, []);

    const filteredPosts = !searchTerm 
        ? contabilidad 
        : contabilidad.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = filteredPosts.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredPosts.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredPosts.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    return (
        <div>
            <h1>Contabilidad</h1>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            <h2 className='text-2xl font-bold'>cantidad de documentos: {currentItems.length}</h2>
            <div className='border-2 border-gray-200 rounded-lg p-4'>
                {currentItems.map((archivo) => (
                    <div key={archivo.id}>
                        <a href={archivo.archivo} target="_blank" rel="noopener noreferrer">
                            {archivo.titulo} : {archivo.subject?.titulo}
                        </a>
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