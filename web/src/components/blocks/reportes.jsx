import { useEffect, useMemo, useState } from 'react';
import api from '@services/apiService';
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAME_TO_NUMBER = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
};

const getTemaTitles = (reporte) => {
    const temas = reporte.temas ?? [];
    return temas
        .filter(t => !t.parent_id)
        .map(t => t.titulo)
        .filter(Boolean);
};

const getSubtemaTitles = (reporte) => {
    const temas = reporte.temas ?? [];
    return temas
        .filter(t => t.parent_id)
        .map(t => t.titulo)
        .filter(Boolean);
};

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [temaFilter, setTemaFilter] = useState("");
    const [subtemaFilter, setSubtemaFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    useEffect(() => {
        let isMounted = true;

        const fetchReportes = async () => {
            try {
                const response = await api.get('/reportes');
                if (isMounted) {
                    setReportes(response.data.reportes);
                }
            } catch (error) {
                console.error("Error al cargar reportes:", error);
            }
        };

        fetchReportes();

        return () => {
            isMounted = false;
        };
    }, []);

    const reportesWithMeta = useMemo(() => {
        return reportes.map(reporte => {
            const fecha = reporte?.fecha ? new Date(reporte.fecha) : null;
            const validDate = fecha instanceof Date && !isNaN(fecha);
            const temaTitles = getTemaTitles(reporte);
            const subtemaTitles = getSubtemaTitles(reporte);
            const anyo = reporte.anyo ?? (validDate ? Number(format(fecha, 'yyyy')) : null);
            const month = reporte.mes
                ? MONTH_NAME_TO_NUMBER[String(reporte.mes).toLowerCase()] || String(reporte.mes)
                : validDate
                    ? format(fecha, 'MM')
                    : '';

            return {
                ...reporte,
                temaTitles,
                subtemaTitles,
                year: anyo ? String(anyo) : '',
                month: month || '',
            };
        }).sort((reporteA, reporteB) => {
            const fechaA = reporteA.fecha ? new Date(reporteA.fecha).getTime() : 0;
            const fechaB = reporteB.fecha ? new Date(reporteB.fecha).getTime() : 0;
            return fechaB - fechaA;
        });
    }, [reportes]);

    const temas = useMemo(
        () => [...new Set(reportesWithMeta.flatMap(r => r.temaTitles))].sort(),
        [reportesWithMeta]
    );

    const subtemas = useMemo(() => {
        const uniqueSubtemas = new Set();
        reportesWithMeta.forEach(r => {
            if (!temaFilter || r.temaTitles.includes(temaFilter)) {
                r.subtemaTitles.forEach(title => uniqueSubtemas.add(title));
            }
        });
        return [...uniqueSubtemas].sort();
    }, [reportesWithMeta, temaFilter]);

    // Derivación directa para evitar el useEffect innecesario
    const activeSubtemaFilter = subtemas.includes(subtemaFilter) ? subtemaFilter : "";

    const years = useMemo(
        () => [...new Set(reportesWithMeta.map(r => r.year).filter(Boolean))].sort((b, a) => Number(b) - Number(a)),
        [reportesWithMeta]
    );

    const months = useMemo(() => {
        const uniqueMonths = [...new Set(reportesWithMeta.map(r => r.month).filter(Boolean))];
        const sortedMonths = uniqueMonths.sort((a, b) => Number(a) - Number(b));
        return sortedMonths.map(value => ({
            value,
            label: monthNames[Number(value) - 1] || value
        }));
    }, [reportesWithMeta]);

    const filteredReportes = useMemo(() => {
        return reportesWithMeta.filter(post => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || [
                post.titulo,
                post.claves,
                post.periocidad,
            ].some(value => value?.toString().toLowerCase().includes(searchTermLower))
                || post.temaTitles.some(title => title.toLowerCase().includes(searchTermLower))
                || post.subtemaTitles.some(title => title.toLowerCase().includes(searchTermLower));

            const matchesTema = !temaFilter || post.temaTitles.includes(temaFilter);
            const matchesSubtema = !activeSubtemaFilter || post.subtemaTitles.includes(activeSubtemaFilter);
            const matchesYear = !yearFilter || post.year === yearFilter;
            const matchesMonth = !monthFilter || post.month === monthFilter;

            return matchesSearch && matchesTema && matchesSubtema && matchesYear && matchesMonth;
        });
    }, [reportesWithMeta, searchTerm, temaFilter, activeSubtemaFilter, yearFilter, monthFilter]);

    // Previene offsets fuera de rango al filtrar
    const safeOffset = itemOffset >= filteredReportes.length ? 0 : itemOffset;

    const endOffset = safeOffset + itemsPerPage;
    const currentReportes = filteredReportes.slice(safeOffset, endOffset);
    const pageCount = Math.ceil(filteredReportes.length / itemsPerPage);

    const handlePageClick = (event) => {
        if (filteredReportes.length === 0) return;
        const newOffset = (event.selected * itemsPerPage) % filteredReportes.length;
        setItemOffset(newOffset);
    };

    // Manejadores de actualización + reseteo de página
    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setItemOffset(0);
    };

    const handleTemaChange = (val) => {
        setTemaFilter(val);
        setSubtemaFilter("");
        setItemOffset(0);
    };

    const handleSubtemaChange = (val) => {
        setSubtemaFilter(val);
        setItemOffset(0);
    };

    const handleYearChange = (val) => {
        setYearFilter(val);
        setItemOffset(0);
    };

    const handleMonthChange = (val) => {
        setMonthFilter(val);
        setItemOffset(0);
    };

    const clearFilters = () => {
        setTemaFilter("");
        setSubtemaFilter("");
        setYearFilter("");
        setMonthFilter("");
        setItemOffset(0);
    };

    return (
        <div>
            <div className="container mx-auto grid md:grid-cols-12 gap-1">  
                <div className='md:col-span-1'></div>           
                <div className="col-span-11 w-full px-2 md:px-0">
                    <Searcher 
                        searchTerm={searchTerm} 
                        setSearchTerm={handleSearchChange} 
                        placeholder="¿Qué quieres buscar?" 
                    />
                </div>             
            </div>

            <div className='mx-auto px-2 container my-15'>
                <div className='flex flex-col lg:flex-wrap lg:flex-row gap-5 mb-5'>
                    <div>
                        <label className='block text-14 text-primary'>Selecciona un Tema</label>
                        <select
                            value={temaFilter}
                            onChange={(e) => handleTemaChange(e.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value='' className='text-titulo! bg-card!'>Todos</option>
                            {temas.map(tema => (
                                <option key={tema} value={tema} className='text-titulo! bg-card!'>{tema}</option>
                            ))}
                        </select>
                    </div>

                    {subtemas.length > 0 && (
                        <div>
                            <label className='block text-14 text-primary'>Selecciona un Subtema</label>
                            <select
                                value={activeSubtemaFilter}
                                onChange={(e) => handleSubtemaChange(e.target.value)}
                                className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                            >
                                <option value='' className='text-titulo! bg-card!'>Todos</option>
                                {subtemas.map(subtema => (
                                    <option key={subtema} value={subtema} className='text-titulo! bg-card!'>{subtema}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className='block text-14 text-primary'>Selecciona un Año</label>
                        <select
                            value={yearFilter}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value='' className='text-titulo! bg-card!'>Todos</option>
                            {years.map(year => (
                                <option key={year} value={year} className='text-titulo! bg-card!'>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className='block text-14 text-primary'>Selecciona un Mes</label>
                        <select
                            value={monthFilter}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value='' className='text-titulo! bg-card!'>Todos</option>
                            {months.map(month => (
                                <option key={month.value} value={month.value} className='text-titulo! bg-card!'>{month.label}</option>
                            ))}
                        </select>
                    </div>

                    {(temaFilter || activeSubtemaFilter || yearFilter || monthFilter) && (
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

            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mx-auto container px-2'>
                {currentReportes.map(reporte => (
                    <a href={reporte.archivo} target="_blank" rel="noopener noreferrer" download key={reporte.id}>
                        <div className='border-2 border-card rounded-2xl p-8 hover:border-tertiary hover:border group h-full flex flex-col justify-between'>
                            <div>
                                <div className="flex items-center gap-2 mb-4 bg-white justify-between">
                                    <p className='text-18 text-titulos group-hover:text-tertiary'>{reporte.titulo}</p>
                                    <div className="group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols--download group-hover:bg-white!"></span>
                                    </div> 
                                </div> 
                            </div>

                            <div className='flex flex-wrap gap-2 mt-4'>
                                {reporte.year && (
                                    <p className='font-garet-bold text-tertiary text-[12px] capitalize border border-tertiary bg-etiqueta-sec p-2 rounded-xl'>{reporte.year}</p>
                                )}
                                {reporte.periocidad && (
                                    <p className='font-garet-bold text-titulo text-[12px] capitalize border border-titulo bg-etiqueta-ter p-2 rounded-xl'>{reporte.periocidad}</p>
                                )}
                                {reporte.fecha && (
                                    <p className='font-garet-bold text-primary text-[12px] capitalize border border-[#5C24724D] bg-[#F3EAFF] p-2 rounded-xl'>
                                        Publicada: {format(new Date(reporte.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {pageCount > 1 && (
                <div className="my-8 flex justify-center">
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
                        forcePage={Math.floor(safeOffset / itemsPerPage)}
                    />
                </div>
            )}
        </div>
    );
}