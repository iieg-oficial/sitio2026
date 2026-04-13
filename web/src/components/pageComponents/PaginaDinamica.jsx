import { useParams } from 'react-router';
import { lazy, Suspense } from 'react';
import { pageMap } from '../../config/pageMap';


function PaginaDinamica() {
  const { slug } = useParams();

  const blockNames = pageMap[slug];
  
if (!blockNames) {
    const NotFound = lazy(() => import('../blocks/NotFound'));
    return (
      <Suspense fallback={<p>Cargando...</p>}>
        <NotFound />
      </Suspense>
    );
  }

  const blocks = blockNames.map((name) => ({
    name,
    Component: lazy(() =>
      import(`../blocks/${name}.jsx`).catch(() => import('../blocks/NotFound'))
    ),
  }));

  return (
    <>
      {blocks.map(({ name, Component }) => (
        <Suspense key={name} fallback={<p>Cargando {name}...</p>}>
          <Component />
        </Suspense>
      ))}
    </>
  );
}


export default PaginaDinamica