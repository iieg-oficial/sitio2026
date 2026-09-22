import { lazy, Suspense, Component } from 'react';
import { useParams } from 'react-router';
import { pageMap } from '../../config/pageMap';

// Error Boundary para evitar que la caída de un bloque tire la app completa
class BlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[BlockErrorBoundary] Error en el bloque "${this.props.blockKey}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // En producción puedes retornar null o un mensaje sutil
      return (
        <div className="p-4 text-center text-red-500 bg-red-50 my-2 rounded">
          <small>No se pudo cargar el bloque: {this.props.blockKey}</small>
        </div>
      );
    }
    return this.props.children;
  }
}

// Función para importar dinámicamente asegurando que siempre devuelva un React Component válido
const safeLazy = (importFn, blockName) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      // Validar si el módulo exporta un default válido
      if (!module || (!module.default && typeof module !== 'function')) {
        console.error(`El bloque "${blockName}" no tiene un 'export default' válido.`);
        return { default: () => null };
      }
      return module;
    } catch (err) {
      console.error(`Error al cargar el chunk del bloque "${blockName}":`, err);
      return { default: () => null };
    }
  });
};

// Registro de bloques ya cargados para evitar recrear el lazy module en cada render
const blocksRegistry = {};

const getBlockComponent = (blockKey) => {
  if (!blocksRegistry[blockKey]) {
    blocksRegistry[blockKey] = safeLazy(() => import(`../blocks/${blockKey}.jsx`), blockKey);
  }
  return blocksRegistry[blockKey];
};

export default function PaginaDinamica() {
  const { slug } = useParams();
  const bloques = pageMap[slug] || [];

  if (bloques.length === 0) {
    return <p className="text-center py-6">Página no encontrada o sin contenido.</p>;
  }

  return (
    <Suspense fallback={<p className="text-center py-6">Cargando contenido...</p>}>
      {bloques.map((blockKey) => {
        const BlockComponent = getBlockComponent(blockKey);

        return (
          <BlockErrorBoundary key={blockKey} blockKey={blockKey}>
            <BlockComponent />
          </BlockErrorBoundary>
        );
      })}
    </Suspense>
  );
}