import { useEffect, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';

export default function Cuadernillos() {
    const [cuadernillos, setCuadernillos] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [loadError, setLoadError] = useState(false);
    const keys = ['titulo', 'anyo', 'municipio'];

    const fetchCuadernillos = async () => {
        try {
            setLoadError(false);
            const response = await api.get('/cuadernillos')
            setCuadernillos(Array.isArray(response.data?.cuadernillos) ? response.data.cuadernillos : [])
        } catch (error) {
            setLoadError(true);
            setCuadernillos([]);
        }
    }

    useEffect(() => {
        fetchCuadernillos()
    }, []);

    const filteredCuadernillos = !searchTerm
        ? cuadernillos
        : cuadernillos.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const endOffset = itemOffset + itemsPerPage;
    const currentCuadernillos = filteredCuadernillos.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredCuadernillos.length / itemsPerPage);

    const handlePageClick = (event) => {
        if (!filteredCuadernillos.length) {
            setItemOffset(0);
            return;
        }
        const newOffset = (event.selected * itemsPerPage) % filteredCuadernillos.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            {loadError ? <p>No se pudieron cargar los cuadernillos.</p> : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentCuadernillos.map((cuadernillo) => (
                    <div key={cuadernillo.id} className="border rounded p-4 shadow">
                        <h3 className="text-lg font-bold">{cuadernillo.titulo}</h3>
                        <p>Año: {cuadernillo.anyo}</p>
                        <p>Municipio: {cuadernillo.municipio || 'N/A'}</p>
                        {cuadernillo.archivo && (
                            <a href={cuadernillo.archivo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Ver Cuadernillo
                            </a>
                        )}
                    </div>
                ))}
            </div>
            <ReactPaginate
                breakLabel="..."
                nextLabel="Siguiente >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="< Anterior"
                containerClassName="pagination flex justify-center mt-4 gap-2"
                pageClassName="page-item"
                pageLinkClassName="page-link px-3 py-1 border rounded"
                previousClassName="page-item"
                previousLinkClassName="page-link px-3 py-1 border rounded"
                nextClassName="page-item"
                nextLinkClassName="page-link px-3 py-1 border rounded"
                activeClassName="active bg-blue-500 text-white border-blue-500"
            />
        </div>
    );
}