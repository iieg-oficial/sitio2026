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
      try {
        const response = await api.get(`/paginas/${slug}`);
        setPage(response.data);
      } catch(error) {
        if (error.response?.status === 404) {
          setErrorNotFound(true);
        }
        console.error("Error al obtener la página:", error);
      } 
    }
    fetchPage();
  }, [slug]);

  if (errorNotFound) {
      return (
        <article style={{ marginTop: '50px' }}>
          <PaginaDinamica />
        </article>
      );
  }

  if (!page) return <p>Cargando...</p>;

  return (
    <>    
    <Helmet>
        <title>{page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
    </Helmet>
    <article>
        <h1>{page.title}</h1>
        <PaginaDinamica />
    </article>
    </>
  );
}

export default PaginaPorSlug
