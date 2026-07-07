import { useEffect, useMemo, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TrackedLink from '@components/blocks/boton'
import ConditionalLink from '../pageComponents/ConditionalLink'

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const [lastFlash, setLastFlash] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemaId, setSelectedTemaId] = useState("");
    const [selectedSubtemaId, setSelectedSubtemaId] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [itemOffset, setItemOffset] = useState(0);
    const keys = ['titulo', 'desc_jal', 'desc_nac', 'periocidad', 'fuente', 'temas.titulo'];
    const itemsPerPage = 3;

    const fetchFlashes = async () => {
        const response = await api.get('/flashes')
        setFlashes(response.data.flashes)
    }

    const fetchLastFlash = async () => {
        const response = await api.get('/flashes/last')
        setLastFlash(response.data[0] || null)
    }

    const hasActiveFilters = Boolean(searchTerm.trim() || selectedTemaId || selectedSubtemaId || selectedYear || selectedMonth);

    const flashesWithoutLast = useMemo(() => {
        if (!lastFlash) return flashes;
        if (hasActiveFilters) return flashes; // con filtros activos, no se excluye: puede aparecer si coincide
        return flashes.filter(flash => flash.id !== lastFlash.id);
    }, [flashes, lastFlash, hasActiveFilters]);

    const flashesForOptions = useMemo(() => {
        if (!lastFlash) return flashes;
        return flashes.filter(flash => flash.id !== lastFlash.id);
    }, [flashes, lastFlash]);

    useEffect(() => {
        fetchFlashes()
        fetchLastFlash()
    }, []);

    const themes = useMemo(() => {
        const map = new Map();
        flashesForOptions.forEach(flash => {
            flash.temas?.filter(tema => !tema.parent_id).forEach(tema => {
                if (!map.has(tema.id)) {
                    map.set(tema.id, tema)
                }
            })
        })

        return Array.from(map.values()).sort((a, b) => a.titulo.localeCompare(b.titulo));
    }, [flashesForOptions]);

    const subthemes = useMemo(() => {
        if (!selectedTemaId) return [];

        const map = new Map();
        flashesForOptions.forEach(flash => {
            flash.temas?.filter(tema => tema.parent_id === Number(selectedTemaId)).forEach(subtema => {
                if (!map.has(subtema.id)) {
                    map.set(subtema.id, subtema)
                }
            })
        })

        return Array.from(map.values()).sort((a, b) => a.titulo.localeCompare(b.titulo));
    }, [flashesForOptions, selectedTemaId]);

    const years = useMemo(() => {
        return [...new Set(
            flashesForOptions
                .map(flash => flash.fecha_publicacion ? new Date(flash.fecha_publicacion).getFullYear() : null)
                .filter(Boolean)
        )].sort((a, b) => b - a);
    }, [flashesForOptions]);

    const months = useMemo(() => {
        const monthNames = Array.from({ length: 12 }, (_, index) => ({
            value: String(index + 1).padStart(2, '0'),
            label: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2024, index, 1))
        }));

        return monthNames;
    }, []);

    useEffect(() => {
        if (selectedTemaId && selectedSubtemaId && !subthemes.some(subtema => subtema.id === Number(selectedSubtemaId))) {
            setSelectedSubtemaId('');
        }
    }, [selectedTemaId, selectedSubtemaId, subthemes]);

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, selectedTemaId, selectedSubtemaId, selectedYear, selectedMonth]);

    const filteredFlashes = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase().trim();

        return flashesWithoutLast.filter(post => {
            const matchesSearch = !normalizedSearch || keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(normalizedSearch);
            });

            const matchesTema = !selectedTemaId || post.temas?.some(tema => {
                if (!tema.parent_id) {
                    return tema.id === Number(selectedTemaId);
                }
                return tema.parent_id === Number(selectedTemaId);
            });
            const matchesSubtema = !selectedSubtemaId || post.temas?.some(tema => tema.id === Number(selectedSubtemaId));
            const publicationDate = post.fecha_publicacion ? new Date(post.fecha_publicacion) : null;
            const matchesYear = !selectedYear || publicationDate?.getFullYear().toString() === selectedYear;
            const matchesMonth = !selectedMonth || publicationDate?.getMonth() + 1 === Number(selectedMonth);

            return matchesSearch && matchesTema && matchesSubtema && matchesYear && matchesMonth;
        });
    }, [flashesWithoutLast, searchTerm, selectedTemaId, selectedSubtemaId, selectedYear, selectedMonth]);

    const pageCount = Math.max(1, Math.ceil(filteredFlashes.length / itemsPerPage));
    const currentFlashes = filteredFlashes.slice(itemOffset, itemOffset + itemsPerPage);
    

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % Math.max(filteredFlashes.length, 1);
        setItemOffset(newOffset);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedTemaId('');
        setSelectedSubtemaId('');
        setSelectedYear('');
        setSelectedMonth('');
        setItemOffset(0);
    };

    return (
        <div className='px-2'>
            {lastFlash && !hasActiveFilters && (
                <div className='rounded-2xl p-5 lg:p-14 mb-4 mx-auto container bg-[#F5F5F5] mt-5 mb-15'>
                    <h3 className='text-28 text-tertiary'>{lastFlash.titulo}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                        <div className='bg-white rounded-2xl p-8'>
                            <h4>Jalisco</h4>
                            <div dangerouslySetInnerHTML={{__html: lastFlash.desc_jal}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='bg-white rounded-2xl p-6'>
                            <h4>Nacional</h4>
                            <div dangerouslySetInnerHTML={{__html: lastFlash.desc_nac}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='flex gap-4 flex-wrap mt-5 md:mt-0'>
                            {lastFlash.periocidad && (
                                <p className='bg-etiqueta-ter border-[#162A554D] text-titulo rounded-2xl px-4 py-2 text-14'>{lastFlash.periocidad}</p>
                            )}
                            {lastFlash.fecha_publicacion && (
                                <p className='bg-etiqueta-sec border-[#FF83004D] text-tertiary rounded-2xl px-4 py-2 text-14'>{format(new Date(lastFlash.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                            )}
                            {lastFlash.fuente && (
                                <p className='bg-etiqueta border-[#5C24724D] text-primary rounded-2xl px-4 py-2 text-14'>{lastFlash.fuente}</p>                            
                            )}                            
                        </div>
                        {lastFlash.link && (
                            <div className="grid grid-flow-col justify-items-end mt-5 md:mt-0">
                                <TrackedLink key={lastFlash.id} to={lastFlash.link} target="_blank" download>
                                    <p className='hover:bg-secondary text-secondary border-2 rounded-2xl px-4 py-2 text-14 hover:text-white'>
                                        Quiero ver el reporte de este flash
                                    </p>
                                </TrackedLink>                                
                            </div>
                            )}
                    </div>
                </div>
            )}

            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder='¿qué quieres buscas?' />

            <div className='mx-auto container flex flex-col lg:flex-wrap lg:flex-row gap-5 mt-15'>
                <div>
                    <label className='block text-14 text-primary mb-2'>Tema</label>
                    <select
                        value={selectedTemaId}
                        onChange={(event) => {
                            setSelectedTemaId(event.target.value)
                            setSelectedSubtemaId('')
                        }}
                        className='w-full rounded-lg border border-primary bg-white px-4 py-2 text-titulo'
                    >
                        <option value=''>Todos los temas</option>
                        {themes.map(tema => (
                            <option key={tema.id} value={tema.id}>{tema.titulo}</option>
                        ))}
                    </select>
                </div>

                {selectedTemaId && subthemes.length > 0 && (
                    <div>
                        <label className='block text-14 text-primary mb-2'>Subtema</label>
                        <select
                            value={selectedSubtemaId}
                            onChange={(event) => setSelectedSubtemaId(event.target.value)}
                            className='w-full rounded-lg border border-primary bg-white px-4 py-2 text-titulo'
                        >
                            <option value=''>Todos los subtemas</option>
                            {subthemes.map(subtema => (
                                <option key={subtema.id} value={subtema.id}>{subtema.titulo}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className='block text-14 text-primary mb-2'>Año</label>
                    <select
                        value={selectedYear}
                        onChange={(event) => setSelectedYear(event.target.value)}
                        className='w-full rounded-lg border border-primary bg-white px-4 py-2 text-titulo'
                    >
                        <option value=''>Todos los años</option>
                        {years.map(year => (
                            <option key={year} value={String(year)}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className='block text-14 text-primary mb-2'>Mes</label>
                    <select
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className='w-full rounded-lg border border-primary bg-white px-4 py-2 text-titulo'
                    >
                        <option value=''>Todos los meses</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>

                {hasActiveFilters && (
                <div className='flex items-end'>
                    <button
                        type='button'
                        onClick={clearFilters}
                        className='w-full rounded-lg border border-titulo bg-card px-4 py-2 text-sm text-titulo cursor-pointer hover:text-tertiary'
                    >
                        Limpiar filtros
                    </button>
                </div>
                )}
            </div>

            

            <div className='grid lg:grid-cols-3 container mx-auto gap-4'>
                {currentFlashes.length > 0 ? currentFlashes.map(flash => (
                    <ConditionalLink
                        key={flash.id}
                        link={flash.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div key={flash.id} className='rounded-2xl p-5 lg:p-8 mb-4 mx-auto container bg-white mt-8 hover:border hover:border-tertiary'>
                            <h3 className='text-18 text-titulos'>{flash.titulo}</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                                <div className='md:col-span-2 flex gap-4 flex-wrap mt-5'>
                                    {flash.periocidad && (
                                        <p className='bg-etiqueta-ter border-[#162A554D] text-titulo rounded-2xl px-4 py-2 text-14'>{flash.periocidad}</p>
                                    )}
                                    {flash.fecha_publicacion && (
                                        <p className='bg-etiqueta-sec border-[#FF83004D] text-tertiary rounded-2xl px-4 py-2 text-14'>{format(new Date(flash.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ConditionalLink>
                )) : (
                    <div className='lg:col-span-3 rounded-2xl bg-[#F5F5F5] p-8 text-center text-tertiary mb-15'>
                        No se encontraron flashes con los filtros seleccionados.
                    </div>
                )}
            </div>

            {pageCount > 1 && (
                <ReactPaginate
                    previousLabel={'Ant'}
                    nextLabel={'Sig'}
                    breakLabel={'...'}
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={2}
                    onPageChange={handlePageClick}
                    containerClassName='flex justify-center gap-2 mt-8 mb-10'
                    pageClassName='rounded-full border border-primary px-3 py-2 text-sm'
                    activeClassName='bg-primary text-white'
                    previousClassName='rounded-full border border-primary px-3 py-2 text-sm'
                    nextClassName='rounded-full border border-primary px-3 py-2 text-sm'
                    breakClassName='px-3 py-2 text-sm'
                    forcePage={Math.floor(itemOffset / itemsPerPage)}
                />
            )}
        </div>
    )
}