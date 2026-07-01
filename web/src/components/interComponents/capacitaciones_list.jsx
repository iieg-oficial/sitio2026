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
        <section className='container mx-auto'>
                    <h2 className='text-center'>Módulos</h2>
                    <div className='flex justify-left mt-8 gap-4 mx-auto w-8/12 '>
                        {modulosReversed.map((modulo) => (
                            <button 
                            key={modulo.id}
                            onClick={() => setActiveTab(modulo.nombre)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === modulo.nombre
                                ? 'bg-tertiary text-white border-tertiary'
                                : 'bg-white text-tertiary border-tertiary hover:bg-etiqueta-sec'}`
                            }
                            >
                                {modulo.nombre}
                            </button>
                        ))}
                    </div>
                    <div className='bg-card p-5 my-5 mx-auto w-8/12 rounded-3xl'>
                        {modulosReversed.map((modulo) => {
                            if (activeTab === modulo.nombre) {
                                return (
                                    <div key={modulo.id}>
                                        <div dangerouslySetInnerHTML={{__html: modulo.descripcion}} className='mt-5 prose max-w-none' />                        
                                    </div>
                                )}
                            } 
                        )}
                    </div>
                </section>

                <section className='container mx-auto'>
                    <h2 className='text-center'>Profesores</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto w-11/12 md:w-8/12'>
                        {profesoresReversed.map((profesor) => (
                           <div key={profesor.id} className='bg-card p-5 my-5 grid md:grid-cols-6 rounded-3xl gap-4'>
                            <div className='col-span-2'></div>
                            <div className='col-span-4'>
                                <p>{profesor.nombre}</p>
                                <div dangerouslySetInnerHTML={{__html: profesor.descripcion}} className='mt-5 prose max-w-none' />
                            </div>
                           </div>
                        ))}
                    </div>                    
                </section>
        </>
    )
}