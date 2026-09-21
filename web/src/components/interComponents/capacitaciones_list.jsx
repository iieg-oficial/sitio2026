import { useEffect, useState } from 'react';
import { SafeHtml } from '@components/SafeHtml';

export default function CapacitacionesList({ curso }) {
    const singleCapacitacion = curso ?? null;

    // Calculamos cuál debería ser el nombre por defecto del último módulo
    const defaultTab = Array.isArray(singleCapacitacion?.modulos) && singleCapacitacion.modulos.length > 0
        ? singleCapacitacion.modulos[singleCapacitacion.modulos.length - 1].nombre
        : null;

    // Inicializamos el estado directamente con ese valor
    const [activeTab, setActiveTab] = useState(defaultTab);

    if (!singleCapacitacion) {
        return <div>Cargando ...</div>;
    }

    const modulosReversed = Array.isArray(singleCapacitacion?.modulos)
        ? [...singleCapacitacion.modulos].reverse()
        : [];
    const profesoresReversed = Array.isArray(singleCapacitacion?.profesores)
        ? [...singleCapacitacion.profesores].reverse()
        : [];

    return (
        <>
        <section className='lg:w-8/12 mx-auto'>
            {Array.isArray(singleCapacitacion.modulos) && singleCapacitacion.modulos.length > 0 && (
            <section className='my-15'>
                    <div className='grid grid-cols-12 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                            <h2 className='text-primary text-36 font-garet-extra'>Módulos del programa</h2>
                        </div>
                    </div>
                    <div className=''>
                            <div className='relative'>
                                <span className="material-symbols--chevron-left absolute z-10 bottom-5 left-0 xl:hidden!"></span>
                                <div className='flex justify-left mt-8 gap-4 mx-auto w-full overflow-x-auto pb-2'>
                                    {modulosReversed.map((modulo) => (
                                        <button 
                                        key={modulo.id}
                                        onClick={() => setActiveTab(modulo.nombre)}
                                        className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-3xl font-garet-bold text-28 transition-colors ${activeTab === modulo.nombre
                                            ? 'bg-[#FFF2E5] text-tertiary border-tertiary border-1'
                                            : 'bg-white text-titulo! hover:bg-etiqueta-ter hover:text-tertiary hover:border-1'}`
                                        }
                                        >
                                            {modulo.nombre}
                                        </button>
                                    ))}
                                </div>
                                <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 xl:hidden!"></span>
                            </div>
                            <div className='p-5 my-5 md:mx-auto bg-card rounded-xl p-6'>
                                {modulosReversed.map((modulo) => {
                                    if (activeTab === modulo.nombre) {
                                        return (
                                            <div key={modulo.id}>
                                                <SafeHtml htmlContent={modulo.descripcion} className='mt-5 prose max-w-none cursos text-titlo! text-22!'/>                        
                                                
                                            </div>
                                        )}
                                    } 
                                )}
                            </div>
                    </div>
                    
                </section>
            )}
            {Array.isArray(singleCapacitacion.profesores) && singleCapacitacion.profesores.length > 0 && (
                <section className=''>
                    <div className='grid grid-cols-12 gap-2 md:gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-11'>
                            <h2 className='text-primary text-36 font-garet-extra'>Conoce a los profesores</h2>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-4'>
                        {profesoresReversed.map((profesor) => (
                           <div key={profesor.id} className='bg-card p-5 my-5 grid sm:grid-cols-12 rounded-3xl gap-4'>
                            <div className='sm:col-span-2 2xl:col-span-3'>
                                <img src={profesor.foto} alt={profesor.nombre} className='object-cover mx-auto' />
                            </div>
                            <div className='sm:col-span-10 2xl:col-span-9'>
                                <p className='text-tertiary font-garet-bold text-22 mb-5'>{profesor.nombre}</p>
                                <p className='text-titulo! font-garet-bold text-18'>{profesor.puesto}</p>
                                <SafeHtml htmlContent={profesor.descripcion} className='mt-5 prose max-w-none diez mt-5' />
                                
                            </div>
                           </div>
                        ))}
                    </div>                    
                </section>
            )}
        </section>
        </>
    )
}