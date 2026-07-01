import { Link } from 'react-router'
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TrackedLink from '@components/blocks/boton'

function PostList({ results = [] }) {
    if (!results || results.length === 0) return <p>No se encontraron resultados.</p>;

  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 container mx-auto">
      {results.map((post) => (
        <div key={post.id} className="bg-card p-4 rounded-3xl hover:border hover:border-primary">
          <h3>{post.titulo}</h3>
          <div className="flex gap-4 my-4 flex-wrap">
            <span className='bg-etiqueta-ter text-14 px-4 py-2 rounded-2xl text-tertiary'>{format(new Date(post.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
            {post.subject ?
            <span className='bg-etiqueta-ter text-14 px-4 py-2 rounded-2xl text-tertiary'>{post.subject?.titulo}</span>
            : null}
          </div>
          <p>{post.resumen}</p>
          
          <Link to={`/comunidad/${post.slug}`} state={{ type: 'blog' }} className="read-more bg-blue-500 text-white">
            Leer más
          </Link>
        </div>
      ))}
    </section>
  );
};

export default PostList;