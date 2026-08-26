import { useEffect, useMemo, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate'
import { useLocation } from 'react-router'
import Searcher from '../pageComponents/searcher';

const ITEMS_PER_PAGE = 12

export default function Sistemas() {
    const [sistemas, setSistemas] = useState([])
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [itemOffset, setItemOffset] = useState(0)
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchSistemas = async () => {
            try {
                setLoadError(false)
                const response = await api.get('/sistemas')
                const data = Array.isArray(response.data?.sistemas) ? response.data.sistemas : []
                
                // Ordenar inicialmente por 'orden' de menor a mayor (nulls al final)
                const sortedData = data.sort((a, b) => {
                    const ordA = a.orden != null ? a.orden : Infinity
                    const ordB = b.orden != null ? b.orden : Infinity
                    return ordA - ordB
                })
                
                setSistemas(sortedData)
            } catch {
                setLoadError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchSistemas()
    }, [location])

    const filteredPosts = useMemo(() => (
        !searchTerm 
            ? sistemas 
            : sistemas.filter(post => {
                const term = searchTerm.toLowerCase();
                if (post.titulo?.toLowerCase().includes(term)) return true;
                if (post.sistemas?.toLowerCase().includes(term)) return true;
                if (post.temas?.some(t => t.titulo?.toLowerCase().includes(term))) return true;
                return false;
            })
    ), [sistemas, searchTerm]);

    const subjects = useMemo(() => [...new Set(filteredPosts
        .flatMap(p => p.temas?.map(t => t.titulo) ?? [])
        .filter(Boolean)
    )].sort(), [filteredPosts]);

    const tabs = useMemo(() => ['Todo', ...subjects], [subjects]);
    const activeSubject = activeTab > 0 ? subjects[activeTab - 1] : null;

    useEffect(() => {
        if (activeTab > subjects.length) {
            setActiveTab(0);
        }
    }, [subjects.length, activeTab]);

    useEffect(() => {
        setItemOffset(0)
    }, [searchTerm, activeTab]);

    const filteredByTab = useMemo(() => {
        if (activeTab === 0) return filteredPosts;
        return filteredPosts.filter(post => post.temas?.some(t => t.titulo === activeSubject));
    }, [activeTab, activeSubject, filteredPosts]);

    const endOffset = itemOffset + ITEMS_PER_PAGE
    const currentSystems = filteredByTab.slice(itemOffset, endOffset)
    const pageCount = Math.ceil(filteredByTab.length / ITEMS_PER_PAGE)

    const handlePageClick = (event) => {
        const newOffset = (event.selected * ITEMS_PER_PAGE) % filteredByTab.length
        setItemOffset(newOffset)
    }

    const TabButton = ({ children, active, ...props }) => (
        <button
            type="button"
            {...props}
            className={`px-10 py-3 cursor-pointer rounded-3xl border font-garet-bold text-18 transition-colors flex-shrink-0 snap-start min-w-[120px] ${active
                ? 'bg-etiqueta-sec text-tertiary border-tertiary font-garet-extrabold'
                : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec font-garet-extrabold'}`}
        >
            {children}
        </button>
    );


    return (
        <div className='container mx-auto px-2'>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?" />

            <div className="relative container mx-auto px-2 mt-15">
                    <span class="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                    <div
                        className="flex gap-5 mb-2 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                    >
                        {tabs.map((tab, index) => (
                            <TabButton
                                key={`${tab}-${index}`}
                                active={activeTab === index}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab}
                            </TabButton>
                        ))}
                    </div>
                    <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
            </div>

            <div className='flex flex-col gap-6 mb-4'>
                    {filteredByTab.length === 0 && <p>No hay sistemas</p>}

                    {filteredByTab.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {currentSystems.map((sistema) => {

                                const original = sistema.imagen
                                const thumb = original ? original.substring(original.lastIndexOf('/') + 1) : null;
                                

                                return (
                                    <CardTag 
                                        key={sistema.id}
                                        {...(hasLink ? { 
                                            href: sistema.link, 
                                            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})
                                        } : {})}
                                    >
                                        <div 
                                            className={`mb-5 w-full rounded-2xl bg-card p-8 my-5 grid lg:grid-cols-6 gap-5 ${
                                                hasLink ? 'cursor-pointer hover:border-primary hover:border group' : ''
                                            }`}
                                        >
                                            <div className='md:h-[60px] lg:h-auto lg:col-span-2'>
                                                <img
                                                    src={sistema.imagen ? sistema.imagen : '/demo.jpg'}                                                
                                                    alt={sistema.titulo}
                                                    className="mb-3 h-auto w-full rounded-lg object-cover md:h-full lg:h-auto md:w-auto lg:w-full"
                                                />
                                            </div>
                                            <div className='lg:col-span-4'>
                                                <h3 className="mb-3 text-primary text-28 font-garet-extrabold">
                                                    {sistema.titulo}
                                                </h3>
                                                <div className="diez text-18 font-garet" dangerouslySetInnerHTML={{ __html: sistema.descripcion }} />
                                            </div>
                                            <div className='lg:col-span-6 mt-5'>
                                                {sistema.tipo && (
                                                    <span className={`e${sistema.tipo} rounded-xl px-4 py-2 text-14`}>
                                                        {sistema.tipo_label || sistema.tipo.replace('-', ' ')}
                                                    </span>
                                                )}
                                                
                                                {hasLink && (
                                                    <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary'>
                                                        <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

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
                            forcePage={Math.floor(itemOffset / ITEMS_PER_PAGE)}
                        />
                    )}
            </div>
        </div>
        
    )
}   