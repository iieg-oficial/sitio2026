import { useParams } from 'react-router-dom';
import PaginaPorSlug from './PaginaPorSlug';

function DynamicPage() {
  const { slug } = useParams(); // obtiene el slug desde la URL
  return <PaginaPorSlug slug={slug} />;
}

export default DynamicPage