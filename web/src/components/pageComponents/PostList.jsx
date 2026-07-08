import { Link } from 'react-router'
import { format, isValid} from 'date-fns';
import { es } from 'date-fns/locale';
import TrackedLink from '@components/blocks/boton'

function PostList({ results = [], tabs = [], activeTab = 0, setActiveTab }) {
    if (!results || results.length === 0) return <p>No se encontraron resultados.</p>;

     const TabButton = ({ children, active, ...props }) => (
            <button
                type="button"
                {...props}
                className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${active
                    ? 'bg-etiqueta-sec text-tertiary border-tertiary'
                    : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'}`}
            >
                {children}
            </button>
        );

      console.log('results', results);

  return (
    <>
    <div className="relative container mx-auto px-2 mt-15">
                    <span class="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                    <div
                        className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                    >
                        {tabs.map((tab, index) => (
                            <TabButton
                                key={`${tab}-${index}`}
                                active={activeTab === index}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab}
                            </TabButton>
                        ))}
                    </div>
                    <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
            </div>
    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 container mx-auto">
      {results.map((post) => (

        <TrackedLink to={`/comunidad/${post.slug}`} className="" rel="noopener noreferrer" key={post.id}>
          <div className="bg-card p-4 rounded-3xl hover:border hover:border-primary grid md:grid-cols-2 gap-4 px-5 group">
            <div>
              <img src={post.gallery_images[0].url ?? "/demo.jpg"} alt={post.titulo} />
            </div>
            <div>
              <h3 className="text-primary font-extrabold text-28">{post.titulo}</h3>
              <div className="flex gap-4 my-4 flex-wrap">
                <p className='bg-[#ccc] text-body rounded-2xl px-4 py-2 text-14'>
                    {isValid(new Date(post.fecha))
                        ? format(new Date(post.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })
                        : 'Fecha no disponible'}
                </p>
                {post.temas?.map((tema) => (
                    <p key={tema.id} className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>
                        {tema.titulo}
                    </p>
                ))}
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
            </>

  );
};

export default PostList;