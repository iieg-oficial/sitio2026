import { useEffect, useState, useMemo, useCallback } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

export default function Servicios() {
    const [servicios, setServicios] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [loadError, setLoadError] = useState(false);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;
    const keys = ['titulo', 'tipo', 'descripcion'];
    
    const fetchServicios = useCallback(async (isMounted = true) => {
        try {
            setLoadError(false);
            const response = await api.get('/servicios', {
                params: { _t: new Date().getTime() }
            });
            if (isMounted) {
                // Corrección en la lectura del array
                const data = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data?.servicios || []);
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

    // Reiniciar paginación al cambiar el término de búsqueda
    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

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

        return matchedServicios; // Corrección: Se agrega el return
    }, [serviciosFilter, searchTerm]);

    const endOffset = itemOffset + itemsPerPage;
    const currentServicios = (filteredServicios || []).slice(itemOffset, endOffset);
    const pageCount = Math.ceil((filteredServicios?.length || 0) / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % (filteredServicios?.length || 1);
        setItemOffset(newOffset);
    };

    return (
        <div>
            <div className="mb-6 mx-auto w-11/12 md:w-full lg:w-10/12 xl:w-8/12 grid md:flex justify-center items-center">
                <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?" className="w-full md:w-full" />
                <TrackedLink to="/admin/servicios/nuevo" className="bg-[#8838AB] border-[#8837AA] text-white hover:bg-white hover:text-[#8838AB] border rounded-3xl px-6 py-2 md:mt-0 mx-auto mt-5 md:ml-4 w-[330px] text-center">
                    Descargar catálogo
                </TrackedLink>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 container mx-auto my-15 px-5 xl:px-5 2xl:px-0">
                {currentServicios.map((servicio) => (
                    <TrackedLink key={servicio.id || servicio.titulo} to={servicio.archivo} target="_blank" download>
                        <div className="p-4 group sm:min-h-[170px] 2xl:min-h-[150px]">
                            {servicio.costos && (
                                <p className='font-garet-extra text-tertiary text-[14px] capitalize border border-[#FF83004D] bg-[#FFF2E5] p-2 rounded-xl'>
                                    {servicio.costos}
                                </p>
                            )}
                            <h3 className='text-primary text-[25px] mt-4 mb-5'>{servicio.titulo}</h3>
                            <div className='mb-4'>                                
                                <p className='text-body text-[14px]'>{servicio.descripcion}</p>
                            </div>
                            <div className='flex flex-wrap gap-2 mt-4'>
                                {servicio.tipo && (
                                    <p className='font-garet-bold text-titulo text-[12px] capitalize border border-[#162A554D] bg-[#DDE7FF] p-2 rounded-xl'>
                                        {servicio.tipo}
                                    </p>
                                )}
                                {servicio.formato_entrega && (
                                    <p className='font-garet-bold text-primary text-[12px] capitalize border border-[#5C24724D] bg-[#F3EAFF] p-2 rounded-xl'>
                                        {servicio.formato_entrega}
                                    </p>
                                )}
                                {servicio.politicas && (
                                    <p className='font-garet-bold text-titulo text-[12px] capitalize border border-[#C0BFC0] bg-[#EAEAEA] p-2 rounded-xl'>
                                        {servicio.politicas}
                                    </p>
                                )}
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