import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import Searcher from '../pageComponents/searcher';


export default function Mapas() {
    const [mapas, setMapas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'anyo', 'autor', 'escala', 'ubicacion', 'informacion', "editor", "edicion"];
    const itemsPerPage = 12;
    const [itemOffset, setItemOffset] = useState(0);
    
    useEffect(() => {
        const fetchMapas = async () => {
            const response = await api.get('/mapas')
            setMapas(response.data.mapas)
        }
        fetchMapas()
    }, [])

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = mapas.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(mapas.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % mapas.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    
    return (
        <div className="border-2 border-red-500">
            <h1>Mapas</h1>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {currentItems.map(mapa => (
                <div key={mapa.id}>
                    <h3>{mapa.titulo}</h3>
                    <p>{mapa.anyo}</p>
                    <p>{mapa.autor}</p>
                    <p>{mapa.escala}</p>
                    <p>{mapa.ubicacion}</p>
                    <p>{mapa.informacion}</p>
                    <p>{mapa.editor}</p>
                    <p>{mapa.edicion}</p>
                </div>
            ))}
            <ReactPaginate
                breakLabel="..."
                nextLabel="Siguiente"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="Anterior"
                renderOnZeroPageCount={null}
            />
        </div>
    )
}