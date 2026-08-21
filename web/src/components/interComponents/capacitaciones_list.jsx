import { useEffect, useState } from 'react';

export default function CapacitacionesList({ curso }) {
    const [singleCapacitacion, setSingleCapacitacion] = useState(curso ?? null);
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        setSingleCapacitacion(curso ?? null);
    }, [curso]);

    useEffect(() => {
        if (Array.isArray(singleCapacitacion?.modulos) && singleCapacitacion.modulos.length > 0) {
            setActiveTab([...singleCapacitacion.modulos].reverse()[0].nombre);
        }
    }, [singleCapacitacion]);

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
                            <h2 className='text-primary text-36 font-extrabold'>Módulos del programa</h2>
                            <div className='flex justify-left mt-8 gap-4 mx-auto w-full overflow-x-auto pb-2'>
                                {modulosReversed.map((modulo) => (
                                    <button 
                                    key={modulo.id}
                                    onClick={() => setActiveTab(modulo.nombre)}
                                    className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg font-extrabold text-28 transition-colors ${activeTab === modulo.nombre
                                        ? 'bg-etiqueta-sec text-tertiary border-tertiary border-1'
                                        : 'bg-white text-titulo hover:bg-etiqueta-sec hover:text-tertiary hover:border-1'}`
                                    }
                                    >
                                        {modulo.nombre}
                                    </button>
                                ))}
                            </div>
                            <div className='p-5 my-5 md:mx-auto'>
                                {modulosReversed.map((modulo) => {
                                    if (activeTab === modulo.nombre) {
                                        return (
                                            <div key={modulo.id}>
                                                <div dangerouslySetInnerHTML={{__html: modulo.descripcion}} className='mt-5 prose max-w-none cursos' />                        
                                            </div>
                                        )}
                                    } 
                                )}
                            </div>
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
                            <h2 className='text-primary text-36 font-extrabold'>Conoce a los profesores</h2>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4'>
                        {profesoresReversed.map((profesor) => (
                           <div key={profesor.id} className='bg-card p-5 my-5 grid sm:grid-cols-12 rounded-3xl gap-4'>
                            <div className='sm:col-span-2 flex items-center'>
                                <img src={profesor.foto} alt={profesor.nombre} className='object-cover' />
                            </div>
                            <div className='sm:col-span-10'>
                                <p className='text-tertiary font-bold text-22 mb-5'>{profesor.nombre}</p>
                                <p className='text-titulo font-bold text-18'>{profesor.puesto}</p>
                                <div dangerouslySetInnerHTML={{__html: profesor.descripcion}} className='mt-5 prose max-w-none diez mt-5' />
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