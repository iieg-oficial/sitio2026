import { lazy, Suspense } from "react";
import { useLocation } from 'react-router';
import { pageComponentMap } from '../../config/pageComponentMap';

function PaginaIndividual() {    
    const location = useLocation();
    const type = location.state?.type || location.pathname.split('/')[1];
    
    const blockNames = pageComponentMap[type];

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
          import(`../interComponents/${name}.jsx`).catch(() => import('../blocks/NotFound'))
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

export default PaginaIndividual