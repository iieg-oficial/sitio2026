import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

export default function Servicios() {
    const [servicios, setServicios] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [loadError, setLoadError] = useState(false);
    const keys = ['titulo', 'tipo', 'descripcion'];
    
    const fetchServicios = useCallback(async (isMounted = true) => {
        try {
            setLoadError(false);
            const response = await api.get('/servicios', {
                params: { _t: new Date().getTime() }
            });
            if (isMounted){
                const data = Array.isArray(response.data) 
                    ? response.data.servicios 
                    : (response.data.servicios || []);
                setServicios(data);
            }
        } catch (error) {
            setLoadError(true);
            setServicios([]);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        fetchServicios(isMounted);

        const handleFocus = () => fetchServicios(isMounted);
        window.addEventListener('focus', handleFocus);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleFocus);
        };

    }, [fetchServicios]);

    const serviciosFilter = useMemo(() => {
        return servicios.map(servicio => ({
            ...servicio,
            titulo: servicio.titulo ?? null,
            tipo: servicio.tipo ?? null,
            descripcion: servicio.descripcion ?? null,
        }));
    }, [servicios]);

    const filteredServicios = useMemo(() => {
        const matchedServicios = serviciosFilter.filter(servicio => {
            const matchesSearchTerm = !searchTerm || keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], servicio);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
            return matchesSearchTerm;
        });
        
    }, [serviciosFilter, searchTerm]);

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const endOffset = itemOffset + itemsPerPage;
    const currentServicios = filteredServicios.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredServicios.length / itemsPerPage);

   

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?"/>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 container mx-auto my-15 px-5 xl:px-5 2xl:px-0">
                            {currentServicios.map((servicio) => (
                                <TrackedLink key={servicio.id} to={servicio.archivo} target="_blank" download>
                                    <div className="bg-card hover:border hover:border-tertiary rounded-3xl p-4 group sm:min-h-[170px] 2xl:min-h-[150px]">
                                        <div className='flex justify-between'>
                                            <h3 className='text-primary text-20'>{servicio.titulo}</h3>
                                            <div className="group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1">
                                                <span className="material-symbols--download group-hover:bg-white!"></span>
                                            </div> 
                                        </div>
                                    </div>
                                </TrackedLink>
                            ))}
                        </div>

            {pageCount > 1 && (
                        <ReactPaginate
                            previousLabel={'<'}
                            nextLabel={'>'}
                            breakLabel={'...'}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={Math.floor(itemOffset / itemsPerPage)}
                        />
                    )}
        </div>
    );
}