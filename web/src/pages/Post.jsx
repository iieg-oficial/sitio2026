import { useEffect, useState } from 'react'
import PostList from '@components/pageComponents/PostList'
import Searcher from '@components/pageComponents/searcher'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async'

function Post() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'resumen', 'contenido', 'keywords', 'subject.titulo'];

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const [page, setPage] = useState(null);

    const fetchPageHome = async () => {
        setLoading(true)
        try {
            const res = await api.get('/paginas/slug/comunidad')
            setPage(res.data)
        } catch (err) {
            console.error("Error fetching page community:", err)
        }
        finally {
            setLoading(false)
        }
    }

    const showData = async () => {
        const response = await api.get('/posts');
        setPosts(response.data);  
    }

    useEffect(() => {
        showData();        
    }, []);

    const filteredPosts = !searchTerm 
        ? posts 
        : posts.filter(post => {
            return keys.some(key => {
            const value = key.split('.').reduce((obj, part) => obj?.[part], post);
            return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = filteredPosts.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(filteredPosts.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredPosts.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    return (
        <>
    <Helmet>
        <title>{page.title}</title>
        {page.description_meta && <meta name="description" content={page.description_meta} />}
        {page.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
    </Helmet>
        <div>
            <h1>Comunidad</h1>       
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            <PostList results={currentItems} 
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
        </div>
        </>
    )
}

export default Post