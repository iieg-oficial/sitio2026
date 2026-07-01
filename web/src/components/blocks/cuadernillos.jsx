import { useEffect, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

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


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 container mx-auto my-15">
                {currentCuadernillos.map((cuadernillo) => (
                    <TrackedLink to={cuadernillo.archivo} className="" target="_blank" download>
                        <div key={cuadernillo.id} className="bg-card hover:border hover:border-tertiary rounded-3xl p-4">
                            <div className='flex justify-between'>
                                <h3 className='text-primary text-20'>{cuadernillo.titulo}</h3>               
                                <span className="material-symbols--download text-tertiary"></span> 
                            </div> 
                            <div className='flex flex-wrap gap-4 mt-10'>
                                <p className='rounded-2xl bg-etiqueta-ter text-primary text-14 px-5 py-2'>Año: {cuadernillo.anyo}</p>
                                <p className='rounded-2xl bg-etiqueta-sec text-tertiary text-14 px-5 py-2'>Municipio: {cuadernillo.municipio || 'N/A'}</p>
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
    );
}