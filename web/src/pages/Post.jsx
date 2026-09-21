import { useEffect, useState, useMemo } from 'react'
import PostList from '@components/pageComponents/PostList'
import Searcher from '@components/pageComponents/searcher'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async'
import { SafeHtml } from '@components/SafeHtml';

function Post() {
    const defaultPage = {
        title: 'Comunidación institucional',
        description: '',
        description_meta: 'Comunicación institucional',
        keywords_meta: 'comunidad,posts,búsqueda,noticias',
        postlink: 'https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png'
    };

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(defaultPage);
    const [activeTab, setActiveTab] = useState(0)    
    const [searchTerm, setSearchTerm] = useState("");
    

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Cargar Página Home
            try {
                const res = await api.get('/paginas/slug/comunicacion-institucional');
                const responseData = res?.data;
                if (!responseData || typeof responseData !== 'object') {
                    setPage(defaultPage);
                } else {
                    const safePage = {
                        ...defaultPage,
                        ...responseData,
                        title: responseData.title || defaultPage.title,
                        description: responseData.description || defaultPage.description,
                        description_meta: responseData.description_meta || defaultPage.description_meta,
                        keywords_meta: responseData.keywords_meta || defaultPage.keywords_meta,
                        postlink: responseData.postlink || defaultPage.postlink,
                    };
                    setPage(safePage);
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error("Error fetching page community:", err);
                }
                setPage(defaultPage);
            }

            // 2. Cargar Posts
            try {
                const response = await api.get('/posts');
                const payload = response.data;
                const postsData = Array.isArray(payload)
                    ? payload
                    : payload?.posts ?? payload?.items ?? payload?.data ?? [];
                
                setPosts(postsData);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setPosts([]);
            }
        };

        loadInitialData();
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
        <title>{page?.title || defaultPage.title}</title>
        {page?.description_meta && <meta name="description" content={page.description_meta} />}
        {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
        <meta property="og:image" content={page?.postlink ? page.postlink : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        {/* Twitter Cards (Específico para X / Twitter) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page?.title || defaultPage.title} />
        <meta name="twitter:description" content={page?.description_meta || defaultPage.description_meta || 'Comunicación institucional'} />
        <meta name="twitter:image" content={page?.postlink ? page.postlink : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} />
    </Helmet>
        <article className="px-5 xl:px-5 2xl:px-0 ">
            <div className='page-header text-center py-12'>
                <div className="container mx-auto">                
                <h1 className="text-titulos text-center">{page?.title || defaultPage.title}</h1>
                </div>
                {page?.description ? (
                    <SafeHtml htmlContent={page.description || defaultPage.description} className='prose diez mt-5 w-full px-2 md:px-0 md:w-3/6 mx-auto'/>
                ) : (
                    <SafeHtml htmlContent={defaultPage.description} className='prose diez mt-5 w-full px-2 md:px-0 md:w-3/6 mx-auto'/>
                )}
                </div>

            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?" />            

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