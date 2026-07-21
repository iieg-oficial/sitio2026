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
        <section className='lg:w-10/12 mx-auto'>
            <section className='my-15'>
                    <div className='grid grid-cols-6 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-5'>
                            <h2 className='text-primary text-36 font-extrabold'>Módulos del programa</h2>
                        </div>
                    </div>
                    
                    <div className='flex justify-left mt-8 gap-4 mx-auto w-8/12 '>
                        {modulosReversed.map((modulo) => (
                            <button 
                            key={modulo.id}
                            onClick={() => setActiveTab(modulo.nombre)}
                            className={`px-4 py-2 rounded-lg font-extrabold text-28 transition-colors ${activeTab === modulo.nombre
                                ? 'bg-etiqueta-sec text-tertiary border-tertiary border-1'
                                : 'bg-white text-titulo hover:bg-etiqueta-sec hover:text-tertiary hover:border-1'}`
                            }
                            >
                                {modulo.nombre}
                            </button>
                        ))}
                    </div>
                    <div className='p-5 my-5 mx-auto md:px-10 xl:px-25 w-8/12 '>
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
                </section>

                <section className=''>
                    <div className='grid grid-cols-6 gap-5'>
                        <div className='col-span-1'>
                            <img src="" alt="" />
                        </div>
                        <div className='col-span-5'>
                            <h2 className='text-primary text-36 font-extrabold'>Conoce a los profesores</h2>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto lg:w-8/12'>
                        {profesoresReversed.map((profesor) => (
                           <div key={profesor.id} className='bg-card p-5 my-5 grid lg:grid-cols-6 rounded-3xl gap-4'>
                            <div className='col-span-2'></div>
                            <div className='col-span-4'>
                                <p className='text-tertiary font-bold text-22 mb-5'>{profesor.nombre}</p>
                                <p className='text-titulo font-bold text-18'>{profesor.puesto}</p>
                                <div dangerouslySetInnerHTML={{__html: profesor.descripcion}} className='mt-5 prose max-w-none diez mt-5' />
                            </div>
                           </div>
                        ))}
                    </div>                    
                </section>
        </section>
        </>
    )
}