import { useEffect, useState } from "react";
import Banner from "../Banner";
import { Helmet } from 'react-helmet-async';
import PaginaDinamica from './PaginaDinamica';


function PaginaPorSlug({ slug }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`http://headless.test/wp-json/wp/v2/pages?slug=${slug}`);
        const data = await res.json();
            
        if (data.length > 0) {
          setPage(data[0]); // Siempre devuelve un array
        }
      } catch (err) {
        console.error("Error al obtener la página:", err);
      }
    }
    fetchPage();

}, [slug]);

  if (!page) return <p>Cargando...</p>;
    
  const DynamicComponent = dynamicComponents[slug];
  

  return (
    <>    
    <Helmet>
        <title>{page.yoast_head_json.title}</title>
        <meta name="description" content={page.yoast_head_json.description} />
        <meta property="og:title" content={page.yoast_head_json.og_title} />
        <meta property="og:url" content={page.yoast_head_json.og_url} />
    </Helmet>
    <article>
        <Banner mensaje={page.title.rendered} />
        {DynamicComponent ? <DynamicComponent /> : <p>Componente no encontrado.</p>}
        <PaginaDinamica />
    </article>
    </>
  );
}


export default PaginaPorSlug