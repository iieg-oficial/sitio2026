import { useEffect, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import { format } from 'date-fns';
import TrackedLink from '@components/blocks/boton'

export default function Reportes() {
    const [reportes, setReportes] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'descripcion', 'periocidad', 'subtema', 'subject.titulo'];
    const [activeTab, setActiveTab] = useState("Todos");

    const fetchReportes = async () => {
        const response = await api.get('/reportes')
        setReportes(response.data.reportes)
    }

    useEffect(() => {
        fetchReportes()
    }, []);

    const filteredReportes = !searchTerm 
        ? reportes
        : reportes.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const types = [...new Set(
        filteredReportes.map(post => post.subject.titulo)
    )].sort();

    const filteredReportesByType = activeTab === "Todos"
        ? filteredReportes
        : filteredReportes.filter(post => post.subject.titulo === activeTab);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const endOffset = itemOffset + itemsPerPage;
    const currentReportes = filteredReportesByType.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredReportesByType.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredReportesByType.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setItemOffset(0);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué reportes quieres buscar?" />
            
            <div className='mx-auto px-2 container my-15'>
                <div className="flex gap-2 mb-5">
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
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4 mx-auto container'>
                {currentReportes.map(reporte => (
                    <div className='border-2 border-yellow-500 rounded-lg p-4' key={reporte.id}>
                        <span className='text-blue-600 font-semibold'>{format(new Date(reporte.fecha), 'yyyy')}</span>
                        <h3>{reporte.titulo}</h3>
                        <p>{reporte.descripcion}</p>
                        <p>periocidad: {reporte.periocidad}</p>
                        <p>subtema: {reporte.subtema}</p>
                        <p>fecha: {reporte.fecha}</p>
                        <p>archivo: {reporte.archivo}</p>
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
    