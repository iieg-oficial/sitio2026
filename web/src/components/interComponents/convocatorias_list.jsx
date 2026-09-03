import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import api from '@services/apiService'
import { SafeHtml } from '@components/SafeHtml';

export default function ConvocatoriasList() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleConvocatoria, setSingleConvocatoria] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await api.get(`/cursos-public/slug/${slug}`);
                const convocatoria = response.data;
                setSingleConvocatoria(convocatoria);
                setActiveTab(convocatoria?.perfiles?.[0]?.area || null);
                setError(null);
            } catch (error) {
                console.error("Error al obtener la convocatoria:", error);
                setError(error?.response?.data?.detail || error.message || 'Error al obtener la convocatoria');
                setSingleConvocatoria(null);
                setActiveTab(null);
            }
        }
        fetchConvocatoria();
    }, [slug]);

    if (!singleConvocatoria) {
        if (error) {
            return <div>Error al cargar la convocatoria: {error}</div>;
        }
        return <div>Cargando ...</div>;
    }

    return (
        <>
        {Array.isArray(singleConvocatoria.perfiles) && singleConvocatoria.perfiles.length > 0 && (
        <section className='lg:w-8/12 mx-auto my-15'>
            <div className='grid grid-cols-12 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                            <h2 className='text-primary text-36 font-garet-extra'>Perfiles</h2>
                        </div>
                    </div>
            <div className='relative'>
                <span className="material-symbols--chevron-left absolute z-10 bottom-5 left-0 xl:hidden!"></span>
                <div className='flex justify-left mt-8 gap-4 mx-auto w-full overflow-x-auto pb-2'>
                    {singleConvocatoria.perfiles.map((perfil) => (
                        <button 
                        key={perfil.id}
                        onClick={() => setActiveTab(perfil.area)}
                        className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-3xl font-garet-extra text-18 transition-colors ${activeTab === perfil.area
                                    ? 'bg-[#FFF2E5] text-tertiary border-tertiary border-1'
                                    : 'bg-white text-body hover:bg-[#FFF2E5] hover:text-tertiary hover:border-1'}`
                                }
                        >
                            {perfil.area}
                        </button>
                    ))}
                </div>
                <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 xl:hidden!"></span>
            </div>
            
            <div className='p-5 my-5 mx-auto md:px-10 xl:px-25'>
                {singleConvocatoria.perfiles.map((perfil) => {
                    if (activeTab === perfil.area) {
                        return (
                            <div key={perfil.id}>
                                <h2 className='text-tertiary text-28 font-garet-extra'>{perfil.nombre}</h2>
                                                      
                                <SafeHtml htmlContent={perfil.descripcion} className='mt-5 prose max-w-none cursos text-22! text-titulo!'/>
                            </div>
                        )
                    }
                })}
            </div>
        </section>
        )}
        </>
    );
}   