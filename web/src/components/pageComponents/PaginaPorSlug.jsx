import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet-async';
import PaginaDinamica from './PaginaDinamica';
import api from '@services/apiService';
import NotFound from '../blocks/NotFound';
import Backlink from "./Backlink";

export default function PaginaPorSlug({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPage = async () => {
      if (!slug) return;
      setLoading(true);
      setErrorNotFound(false);

      try {
        const response = await api.get(`/paginas/slug/${slug}`);
        if (isMounted) {
          setPage(response.data);
        }
      } catch (error) {
        if (isMounted) {
          if (error.response?.status === 404) {
            setErrorNotFound(true);
          }
          console.error("Error al obtener la página:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (errorNotFound) {
    return (
      <article style={{ marginTop: '50px' }}>
        <NotFound />
      </article>
    );
  }

  // Si está cargando y no hay datos previos de la página, mostramos el cargando
  if (loading && !page) {
    return <p className="text-center py-12">Cargando...</p>;
  }

  // Si por alguna razón la página es null (falló o slug inválido)
  if (!page) {
    return (
      <article style={{ marginTop: '50px' }}>
        <NotFound />
      </article>
    );
  }

  const interno = ["flashes", "reportes"].includes(page.slug_custom);

  return (
    <>    
      <Helmet>
        <title>{page.title || 'Cargando...'}</title>
      </Helmet>
      <article className="px-5 2xl:px-0">
        <section className={interno ? "page-header text-center pb-12" : "page-header text-center py-12"}>
          <div className="container mx-auto grid md:grid-cols-12 gap-1">  
            {interno && <div className='md:col-span-1'><Backlink /></div>}            
            <div className={interno ? 'col-span-11 w-full px-2 md:px-0' : 'col-span-12 mx-auto'}>
            <h1 className="text-titulos text-center">
              {page.title}
            </h1> 
            <div dangerouslySetInnerHTML={{ __html: page.description }} className={interno ? 'w-11/12 md:w-4/6 prose w-7/12 mt-5 mx-auto text-18' : 'md:w-6/12 prose w-6/12 mt-5 mx-auto text-18'} />             
            </div>             
          </div>
        </section>

        {/* Pasamos el slug directamente a PaginaDinamica */}
        <PaginaDinamica slug={slug} />
      </article>
    </>
  );
}