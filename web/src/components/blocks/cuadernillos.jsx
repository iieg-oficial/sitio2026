import { useEffect, useState, useMemo } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'

export default function Cuadernillos() {
    const [cuadernillos, setCuadernillos] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [loadError, setLoadError] = useState(false);
    const keys = ['titulo', 'anyo', 'municipio'];
    const [municipioFilter, setMunicipioFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");

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

    // Ya no hace falta transformar nada: anyo y municipio ya vienen del backend.
    // Si necesitas un fallback de año a partir de una fecha, dime el nombre real
    // del campo de fecha y lo agregamos aquí correctamente.
    const cuadernillosFilter = useMemo(() => {
        return cuadernillos.map(cuaderno => ({
            ...cuaderno,
            anyo: cuaderno.anyo ?? null,
            municipio: cuaderno.municipio ?? null,
        }));
    }, [cuadernillos]);

    const years = useMemo(
        () => [...new Set(cuadernillosFilter.map(r => r.anyo).filter(Boolean))]
            .sort((a, b) => Number(b) - Number(a)),
        [cuadernillosFilter]
    );

    const munic = useMemo(
        () => [...new Set(cuadernillosFilter.map(r => r.municipio).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b)),
        [cuadernillosFilter]
    );

    const filteredCuadernillos = useMemo(() => {
        const filtered = cuadernillosFilter.filter(cuaderno => {
            const matchesSearch = !searchTerm || keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], cuaderno);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
            const matchesYear = !yearFilter || String(cuaderno.anyo) === String(yearFilter);
            const matchesMunicipio = !municipioFilter || cuaderno.municipio === municipioFilter;

            return matchesSearch && matchesYear && matchesMunicipio;
        });

        return filtered.sort((a, b) => (a.municipio || '').localeCompare(b.municipio || ''));
    }, [cuadernillosFilter, searchTerm, yearFilter, municipioFilter]);

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
    }, [searchTerm, yearFilter, municipioFilter]);

    const clearFilters = () => {
        setYearFilter("");
        setMunicipioFilter("");
        setItemOffset(0);
    };

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?"/>

            <div className='mx-auto px-2 container my-15'>
                <div className='flex flex-col lg:flex-wrap lg:flex-row gap-5 mb-5'>
                    <div>
                        <label className='block text-14 text-primary'>Selecciona un Año</label>
                        <select
                            value={yearFilter}
                            onChange={(event) => setYearFilter(event.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value='' className='text-titulo! bg-card!'>Todos</option>
                            {years.map(year => (
                                <option key={year} value={year} className='text-titulo! bg-card!'>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-14 text-primary'>Selecciona un Municipio</label>
                        <select
                            value={municipioFilter}
                            onChange={(event) => setMunicipioFilter(event.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value='' className='text-titulo! bg-card!'>Todos</option>
                            {munic.map(name => (
                                <option key={name} value={name} className='text-titulo! bg-card!'>{name}</option>
                            ))}
                        </select>
                    </div>
                    {(yearFilter || municipioFilter) && (
                        <div className='flex items-end'>
                            <button
                                onClick={clearFilters}
                                className='w-full rounded-lg border border-titulo bg-card px-4 py-2 text-sm text-titulo cursor-pointer hover:text-tertiary'
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 container mx-auto my-15 px-5 xl:px-5 2xl:px-0">
                {currentCuadernillos.map((cuadernillo) => (
                    <TrackedLink key={cuadernillo.id} to={cuadernillo.archivo} target="_blank" download>
                        <div className="bg-card hover:border hover:border-tertiary rounded-3xl p-4">
                            <div className='flex justify-between'>
                                <h3 className='text-primary text-20'>{cuadernillo.titulo}</h3>
                                <span className="material-symbols--download text-tertiary"></span>
                            </div>
                            <div className='flex flex-wrap gap-4 mt-10'>
                                <p className='rounded-2xl bg-etiqueta-ter text-primary text-[12px] p-2'>Año: {cuadernillo.anyo}</p>
                                <p className='rounded-2xl bg-etiqueta-sec text-tertiary text-[12px] p-2'>Municipio: {cuadernillo.municipio || 'N/A'}</p>
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