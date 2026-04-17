import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import Searcher from '../pageComponents/searcher';

export default function Sistemas() {
    const [sistemas, setSistemas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'descripcion', 'link', 'tipo'];
    const [activeTab, setActiveTab] = useState("Todos");
    
    const showData = async () => {
        const response = await api.get('/sistemas')
        setSistemas(response.data.sistemas)
    }

    useEffect(() => {
        showData()
    }, []);

    const sistemasFiltrados = !searchTerm 
        ? sistemas
        : sistemas.filter(sistema => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], sistema);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const types = [...new Set(
        sistemasFiltrados.map(s => s.tipo)
    )].sort();


    const sistemasByType = activeTab === "Todos"
        ? sistemasFiltrados
        : sistemasFiltrados.filter(s => s.tipo === activeTab);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const endOffset = itemOffset + itemsPerPage;
    const currentSistemas = sistemasByType.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(sistemasByType.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % sistemasByType.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    return (
        <div>
            <div>
                <h1>Sistemas</h1>
                <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <hr />
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => { setActiveTab("Todos"); setItemOffset(0); }}
                        className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === "Todos"
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                        }`}
                    >
                        Todos
                    </button>
                    {types.map(type => (
                        <button
                            key={type}
                            onClick={() => { setActiveTab(type); setItemOffset(0); } }
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === type
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className='border-2 border-gray-200 rounded-lg p-4'>
                    {currentSistemas.length === 0 && (
                        <p className="text-gray-400">No hay resultados.</p>
                    )}

                    {currentSistemas.map((sistema) => {
                       
                        return (
                            <div key={sistema.id} className='border-2 border-gray-200 rounded-lg mb-3'>
                                
                                    <span>{sistema.titulo}</span>
                                    <a href={sistema.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {sistema.link}
                                    </a>
                                    <p>{sistema.descripcion}</p>  
                                
                            </div>
                        );
                    })}
                </div>
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
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
            />
        </div>
    );
}