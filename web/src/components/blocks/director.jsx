import { useState, useCallback } from 'react';
import api from '@services/apiService';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Directorio() {
    const [directorio, setDirectorio] = useState([]);
    const [directorios, setDirectorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idAbierto, setIdAbierto] = useState(null);

    const toggleAcordeon = (id) => {
        setIdAbierto((prevId) => (prevId === id ? null : id));
    };

    // Petición unificada para cargar directores y demás personal
    const fetchData = useCallback(async () => {
        try {
            const [respDirector, respDirectorios] = await Promise.all([
                api.get('/directorio', { params: { director: true } }),
                api.get('/directorio', { params: { director: false } }),
            ]);

            setDirectorio(Array.isArray(respDirector.data) ? respDirector.data : []);
            setDirectorios(Array.isArray(respDirectorios.data) ? respDirectorios.data : []);
        } catch (error) {
            console.error('Error al cargar directorio:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ejecuta la carga inicial y se suscribe al focus de la ventana
    useFetchOnFocus(fetchData);

    return (
        <div className="container mx-auto py-15 px-2">
            <h2 className="text-center mb-15">Directorio</h2>

            {loading && directorio.length === 0 && directorios.length === 0 ? (
                <div className="text-center py-10 text-gray-500 font-medium">
                    Cargando directorio...
                </div>
            ) : (
                <>
                    {/* Sección Directores */}
                    {directorio.map((item) => {
                        const isOpen = idAbierto === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`border-2 border-primary rounded-3xl pl-10 pr-5 py-7 mb-4 cursor-pointer transition-all group duration-300 mx-auto md:w-3/6 ${
                                    isOpen ? 'border-2' : 'bg-white'
                                }`}
                                onClick={() => toggleAcordeon(item.id)}
                            >
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-11">
                                        <p className="text-primary text-22 font-extrabold mb-4">{item.nombre}</p>
                                        <p className="text-base text-titulo font-garet-bold">{item.cargo}</p>
                                    </div>
                                    <div className="col-span-1 bg-white group-hover:bg-primary shadow-lg h-[25px] w-[25px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl">
                                        <span
                                            className={`line-md--chevron-down text-primary group-hover:bg-white! transition-transform duration-300 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        ></span>
                                    </div>
                                </div>

                                <div
                                    className={`info-or transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${
                                        isOpen ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="flex items-center text-14 text-titulo">
                                        <span className="et--phone text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                        <span>{item.telefono || 'Sin teléfono'}</span>
                                    </div>

                                    <div className="flex items-center text-14 text-titulo">
                                        <span className="line-md--email text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                        <span>{item.email || 'Sin correo electrónico'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Sección General / Resto del Directorio */}
                    <div className="grid md:grid-cols-2 gap-4 mt-10">
                        {directorios.map((elementos) => {
                            const isOpen = idAbierto === elementos.id;

                            return (
                                <div
                                    key={elementos.id}
                                    className={`border-0 group rounded-3xl pl-8 pr-5 py-5 mb-4 cursor-pointer transition-all duration-300 ${
                                        isOpen ? 'bg-card border-0' : 'bg-card'
                                    }`}
                                    onClick={() => toggleAcordeon(elementos.id)}
                                >
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-11">
                                            <p className="text-primary text-22 font-bold">{elementos.nombre}</p>
                                            <p className="text-base text-titulo font-bold">{elementos.cargo}</p>
                                        </div>
                                        <div className="group-hover:bg-primary col-span-1 bg-white shadow-lg h-[25px] w-[25px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl">
                                            <span
                                                className={`line-md--chevron-down text-primary group-hover:bg-white! transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            ></span>
                                        </div>
                                    </div>

                                    <div
                                        className={`info-or transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2 ${
                                            isOpen ? 'max-h-40 opacity-100 mt-5' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="flex items-center text-[14px] text-titulo">
                                            <span className="et--phone text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                            <span>{elementos.telefono || 'Sin teléfono'}</span>
                                        </div>

                                        <div className="flex items-center text-[14px] text-titulo">
                                            <span className="line-md--email text-primary w-6 h-6 mr-2.5 flex items-center justify-center"></span>
                                            <span>{elementos.email || 'Sin correo electrónico'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}