import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import Searcher from '../pageComponents/searcher';
import { format } from 'date-fns';

export default function Archivo() {
    const [archivos, setArchivos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'archivo', 'subject.titulo'];
    const [activeTab, setActiveTab] = useState(null);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const showData = async () => {
        const response = await api.get('/archivos/institucionales')
        setArchivos(response.data)
    }

    useEffect(() => {
        showData()
    }, []);

    const filteredPosts = !searchTerm 
        ? archivos 
        : archivos.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const years = [...new Set(
        filteredPosts.map(a => format(new Date(a.fecha), 'yyyy'))
    )].sort((a, b) => b - a);

    useEffect(() => {
        if (years.length > 0 && !years.includes(activeTab)) {
            setActiveTab(years[0]);
        }
    }, [years.join(',')]);

    const postsByYear = filteredPosts.filter(a =>
        format(new Date(a.fecha), 'yyyy') === activeTab
    );

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = postsByYear.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(postsByYear.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % postsByYear.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    return (
        <div>
            <h1>Institucional de archivos</h1>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            <div className="flex gap-2 mb-4">
                {years.map(year => (
                <button
                    key={year}
                    onClick={() => { setActiveTab(year); setItemOffset(0); }}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${
                    activeTab === year
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                >
                    {year}
                </button>
                ))}
            </div>
            <div className='border-2 border-gray-200 rounded-lg p-4'>
                {currentItems.length === 0 && (
                <p className="text-gray-400">No hay resultados.</p>
                )}
                {currentItems.map((archivo) => (
                <div key={archivo.id} className='border-2 border-gray-200 rounded-lg p-4 mb-2'>
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