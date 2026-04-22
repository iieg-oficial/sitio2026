import { Link } from 'react-router'

function PostList({ results = [] }) {
    if (!results || results.length === 0) return <p>No se encontraron resultados.</p>;

  return (
    <div className="results-grid">
      {results.map((post) => (
        <article key={post.id} className="post-card">
          <h3>{post.titulo}</h3>
          <p>{post.resumen}</p>
          <small>Categoría: {post.subject?.titulo}</small>
          <Link to={`/comunidad/${post.slug}`} state={{ type: 'blog' }} className="read-more bg-blue-500 text-white">
            Leer más
          </Link>
        </article>
      ))}
    </div>
  );
};

export default PostList;