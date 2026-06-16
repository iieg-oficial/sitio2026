import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet-async';
import PaginaDinamica from './PaginaDinamica';
import api from '@services/apiService';
import NotFound from '../blocks/NotFound';

function PaginaPorSlug({ slug }) {
  const [page, setPage] = useState(null);
  const [errorNotFound, setErrorNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      setErrorNotFound(false);
      setPage(null);
      try {
        const response = await api.get(`/paginas/slug/${slug}`);
        setPage(response.data);
      } catch(error) {
        if (error.response?.status === 404) {
          setErrorNotFound(true);
          setPage(null);
        }
        console.error("Error al obtener la página:", error);
      } 
    }
    fetchPage();
  }, [slug]);

  if (errorNotFound) {
      return (
        <article style={{ marginTop: '50px' }}>
          <NotFound />
        </article>
      );
  }

  if (!page) return <p>Cargando...</p>;

  return (
    <>    
    <Helmet>
        <title>{page.title}</title>
        {page.description_meta && <meta name="description" content={page.description_meta} />}
        {page.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
    </Helmet>
    <article>
      <div className='mx-auto w-full px-2 2xl:w-10/12 md:pt-5 mt-5'>
            <Backlink />
        </div>
        <section className="page-header text-center py-12">
            <h1 className="text-titulos">{page.title}</h1>
            { page.description && (
                <div dangerouslySetInnerHTML={{__html: page.description}} className='prose diez mt-5 w-full px-2 md:px-0 md:w-3/6 mx-auto' />
            )}
        </section>
        <PaginaDinamica />
    </article>
    </>
  );
}

export default PaginaPorSlug
