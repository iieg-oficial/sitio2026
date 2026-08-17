import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export default function Directorio() {
    const [directorio, setDirectorio] = useState([])
    const [directorios, setDirectorios] = useState([])
    const location = useLocation()

    const [idAbierto, setIdAbierto] = useState(null);

    const toggleAcordeon = (id) => {
        // Si el que clickeaste ya está abierto, lo cierra (null). Si no, abre el nuevo ID.
        setIdAbierto(idAbierto === id ? null : id);
    };

    useEffect(() => {
        const fetchDirectorio = async () => {
            const response = await api.get('/directorio', { params: { director: true } })
            setDirectorio(response.data)
        }
        const fetchDirectorios = async () => {
            const response = await api.get('/directorio', { params: { director: false } })
            setDirectorios(response.data)
        }
        
        fetchDirectorio()
        fetchDirectorios()
    }, [location])


    return (
        <div className="container mx-auto py-15 px-2">
            <h2 className="text-center mb-15">Directorio</h2>
            
            {directorio.map(item => {
                const isOpen = idAbierto === item.id;
                
                return (
                    <div 
                        key={item.id} 
                        className={`border-2 border-primary rounded-3xl pl-10 pr-5 py-7 mb-4 cursor-pointer transition-all duration-300 mx-auto md:w-3/6 ${isOpen ? 'border-2' : 'bg-white'}`}
                        onClick={() => toggleAcordeon(item.id)}
                    >                    
                        {/* Elemento Padre */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-11">
                                <p className='text-primary text-22 font-extrabold mb-4'>{item.nombre}</p>
                                <p className='text-base text-titulo font-bold'>{item.cargo}</p>
                            </div>
                            {/* Icono que gira si está abierto */}
                            <div className='col-span-1 bg-white shadow-lg h-[25px] w-[25px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl'>
                                <span className={`line-md--chevron-down text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></span>
                            </div>
                        </div>

                        {/* Elemento Hijo (info-or) */}
                        <div className={`info-or transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${isOpen ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>                        
                            
                            {/* Fila de Teléfono */}
                            <div className='flex items-center text-[14px] text-titulo'>
                                <span className="et--phone text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                <span>{item.telefono}</span>
                            </div>

                            {/* Fila de Email */}
                            <div className='flex items-center text-[14px] text-titulo'>
                                <span className="line-md--email text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                <span>{item.email}</span>
                            </div>

                        </div>
                    </div>
                );
            })}

            <div className='grid lg:grid-cols-2 gap-4 mt-10'>
                {directorios.map(elementos => {
                const isOpen = idAbierto === elementos.id;
                
                return (
                    <div 
                        key={elementos.id} 
                        className={`border-0 rounded-3xl pl-8 pr-5 py-5 mb-4 cursor-pointer transition-all duration-300 ${isOpen ? 'bg-card border-0' : 'bg-card'}`}
                        onClick={() => toggleAcordeon(elementos.id)}
                    >                    
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-11">
                                <p className='text-primary text-22 font-extrabold mb-4'>{elementos.nombre}</p>
                                <p className='text-base text-titulo font-bold'>{elementos.cargo}</p>
                            </div>
                            {/* Icono que gira si está abierto */}
                            <div className='col-span-1 bg-white shadow-lg h-[25px] w-[25px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl'>
                                <span className={`line-md--chevron-down text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></span>
                            </div>
                        </div>

                            {/* Elemento Hijo (info-or) */}
                            <div className={`info-or transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${isOpen ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>                        
                                
                                {/* Fila de Teléfono */}
                                <div className='flex items-center text-[14px] text-titulo'>
                                    <span className="et--phone text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                    <span>{elementos.telefono}</span>
                                </div>

                                {/* Fila de Email */}
                                <div className='flex items-center text-[14px] text-titulo'>
                                    <span className="line-md--email text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                    <span>{elementos.email}</span>
                                </div>

                            </div>
                        </div>
                        );
                    })}
            </div>

        </div>
    );
}
