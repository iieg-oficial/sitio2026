import { useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';

function PaginaDinamica() {
  const { slug } = useParams();
  
  const DynamicComponent = lazy(() => import(`../blocks/${slug}.jsx`).catch(() => import('../blocks/NotFound')));

  return (
    <Suspense fallback={<p>Cargando componente...</p>}>
      <DynamicComponent />
    </Suspense>
  );
}

export default PaginaDinamica