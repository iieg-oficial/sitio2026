import { Link } from 'react-router'
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TrackedLink from '@components/blocks/boton'

function PostList({ results = [] }) {
    if (!results || results.length === 0) return <p>No se encontraron resultados.</p>;

  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 container mx-auto">
      {results.map((post) => (
        <TrackedLink to={`/comunidad/${post.slug}`} className="" rel="noopener noreferrer">
          <div key={post.id} className="bg-card p-4 rounded-3xl hover:border hover:border-primary grid md:grid-cols-2 gap-4 px-5 group">
            <div></div>
            <div>
              <h3 className="text-primary font-extrabold text-28">{post.titulo}</h3>
              <div className="flex gap-4 my-4 flex-wrap">
                <p className='bg-[#ccc] text-body rounded-2xl px-4 py-2 text-14'>{format(new Date(post.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                {post.subject ?
                <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{post.subject?.titulo}</p>
                : null}
              </div>
              <div dangerouslySetInnerHTML={{__html: post.resumen}} className='mt-5 prose max-w-none' />
              
              <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary'>
                <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
              </div>
            </div>
          </div>
        </TrackedLink>
      ))}
    </section>
  );
};

export default PostList;