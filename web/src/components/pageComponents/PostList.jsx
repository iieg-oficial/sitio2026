import { Link } from 'react-router'
import { format, isValid} from 'date-fns';
import { es } from 'date-fns/locale';
import TrackedLink from '@components/blocks/boton'
import { SafeHtml } from '@components/SafeHtml';

function PostList({ results = [], tabs = [], activeTab = 0, setActiveTab }) {
    if (!results || results.length === 0) return <p>No se encontraron resultados.</p>;

     const TabButton = ({ children, active, ...props }) => (
            <button
              type="button"
              {...props}
              className={`px-10 py-3 cursor-pointer rounded-3xl border font-garet-extra text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${active
                  ? 'bg-[#FFF2E5] text-tertiary border-tertiary'
                  : 'text-titulo hover:border hover:border-tertiary hover:text-tertiary hover:bg-[#FFF2E5]'}`}
            >
                {children}
            </button>
        );

      

  return (
            <>
            <div className="relative container mx-auto px-2 mt-15">
                <span className="material-symbols--chevron-left absolute z-10 bottom-5 left-0 xl:hidden!"></span>
                <div
                    className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto overflow-visible snap-x snap-mandatory"
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
                <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 xl:hidden!"></span>
            </div>

            {(!results || results.length === 0) ? (
                <p className="text-center my-15">No se encontraron resultados.</p>
            ) : (
                <section className="grid md:grid-cols-2 gap-5 mt-6 container mx-auto">
                    {results.map((post) => {

                        const original = post.gallery_images?.[0]?.url
                        const thumb = original ? original.substring(original.lastIndexOf('/') + 1) : null;

                        const imgSrc = thumb 
                                        ? `https://iieg.jalisco.gob.mx/acervo/thumb/portal/blog/${thumb}?w=400` 
                                        : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png";

                        return(
                            <TrackedLink to={`/comunicacion-institucional/${post.slug}`} className="" rel="noopener noreferrer" key={post.id}>
                                <div className="bg-card p-4 rounded-3xl hover:border hover:border-primary grid xl:grid-cols-2 gap-4 px-5 group">
                                    <div>
                                        <img src={post.gallery_images?.[0]?.url ?? "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} alt={post.titulo} className='rounded-3xl mx-auto'/>
                                        {/*<img src={imgSrc} alt={post.titulo} className='rounded-3xl'/>*/}
                                    </div>
                                    <div>
                                        <h3 className="text-primary font-garet-extra text-28">{post.titulo}</h3>
                                        <div className="flex gap-4 my-4 flex-wrap">
                                            <p className='bg-[#DDE7FF] text-titulo rounded-3xl px-4 py-2 text-14 border border-[#162A554D]'>
                                                {isValid(new Date(post.fecha))
                                                    ? format(new Date(post.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })
                                                    : 'Fecha no disponible'}
                                            </p>
                                            {post.temas?.map((tema) => (
                                                <p key={tema.id} className='bg-[#F3EAFF] text-secondary rounded-3xl px-4 py-2 text-14 border border-[#5C24724D]'>
                                                    {tema.titulo}
                                                </p>
                                            ))}
                                        </div>                                        
                                        <SafeHtml htmlContent={post.description} className='mt-5 prose max-w-none'/>
                                        <div className='bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 group-hover:shadow-2xl group-hover:bg-primary'>
                                            <span className="material-symbols--chevron-right text-primary group-hover:!bg-white"></span>
                                        </div>
                                    </div>
                                </div>
                            </TrackedLink>
                        );
                    })}
                </section>
            )}
        </>
    );
};

export default PostList;