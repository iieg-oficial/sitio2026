import { useEffect, useState, useMemo } from 'react'
import PostList from '@components/pageComponents/PostList'
import Searcher from '@components/pageComponents/searcher'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns';

function Post() {
    const defaultPage = {
        title: 'Comunidad',
        description: '<p>Bienvenido a la comunidad. Aquí encontrarás las últimas publicaciones y novedades.</p><p>Usa el buscador para filtrar los posts según tus intereses y términos de búsqueda.</p>',
        description_meta: 'Encuentra publicaciones de la comunidad con el buscador y accede a las novedades del portal.',
        keywords_meta: 'comunidad,posts,búsqueda,noticias'
    };

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(defaultPage);
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [activeTab, setActiveTab] = useState(0)    
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'resumen', 'contenido', 'keywords', 'subject.titulo', 'claves', 'temas', 'temas.titulo'];

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const fetchPageHome = async () => {
        try {
            const res = await api.get('/paginas/slug/comunidad');
            setPage(res.data);
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error("Error fetching page community:", err);
            }
        }
    }

    const showData = async () => {
        const response = await api.get('/posts');
    console.log('RAW response.data:', response.data);
    const payload = response.data;
    const postsData = Array.isArray(payload)
        ? payload
        : payload?.posts ?? payload?.items ?? payload?.data ?? [];
    console.log('postsData resultante:', postsData);

    setPosts(postsData);
    }

    useEffect(() => {
        fetchPageHome();
        showData();        
    }, []);

const filteredPosts = useMemo(() => (
    !searchTerm 
    ? posts 
    : posts.filter(post => {
        const term = searchTerm.toLowerCase();
        const simpleKeys = ['titulo', 'resumen', 'contenido', 'keywords', 'subject.titulo', 'claves'];
        const matchesSimple = simpleKeys.some(key => {
            const value = key.split('.').reduce((obj, part) => obj?.[part], post);
            return value?.toString().toLowerCase().includes(term);
        });
        const matchesTema = post.temas?.some(t => t.titulo?.toLowerCase().includes(term));
        return matchesSimple || matchesTema;
    })
), [posts, searchTerm]);

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
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    const filteredByTab = useMemo(() => {
        if (activeTab === 0) return filteredPosts;
        return filteredPosts.filter(post => post.temas?.some(t => t.titulo === activeSubject));
    }, [activeTab, activeSubject, filteredPosts]);

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = filteredByTab?.slice(itemOffset, endOffset);

    const pageCount = Math.ceil(filteredByTab?.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredByTab?.length;
        setItemOffset(newOffset);
    };

    
    return (
        <>
    <Helmet>
        <title>{page?.title }</title>
        {page?.description_meta && <meta name="description" content={page.description_meta} />}
        {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
    </Helmet>
        <article className="px-5 xl:px-5 2xl:px-0 ">
            <div className='page-header text-center py-12'>
                <div className="container mx-auto">                
                <h1 className="text-titulos text-center">{page.title}</h1>
                </div>
                { page.description && (
                    <div dangerouslySetInnerHTML={{__html: page.description}} className='prose diez mt-5 w-full px-2 md:px-0 md:w-3/6 mx-auto' />
                )}
                </div>

            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />            

            <PostList 
                results={currentItems} 
                tabs={tabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                key={`${itemOffset}-${searchTerm}`} />

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
        </article>
        </>
    )
}

export default Post