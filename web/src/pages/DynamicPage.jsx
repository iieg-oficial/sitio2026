import { useParams } from 'react-router';
import PaginaPorSlug from '../components/pageComponents/PaginaPorSlug';

export default function DynamicPage() {
  const { slug } = useParams();
  
  // Pasa el slug directamente
  return <PaginaPorSlug slug={slug} />;
}