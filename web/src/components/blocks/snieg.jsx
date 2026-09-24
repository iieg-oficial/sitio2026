import { useState, useCallback } from 'react';
import api from '@services/apiService';
import TrackedLink from '@components/blocks/boton';
import ConditionalLink from '../pageComponents/ConditionalLink';
import { SafeHtml } from '@components/SafeHtml';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Snieg() {
    const [snieg, setSnieg] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSnieg = useCallback(async () => {
        try {
            const response = await api.get('/snieg');
            const data = Array.isArray(response.data?.snieg) ? response.data.snieg : [];
            setSnieg(data);
        } catch (error) {
            console.error('Error al cargar SNIEG:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización al enfocar la pestaña/ventana
    useFetchOnFocus(fetchSnieg);

    if (loading && snieg.length === 0) {
        return <p className="text-center py-6 text-gray-500">Cargando información de SNIEG...</p>;
    }

    return (
        <div className="container mx-auto px-2 mb-15">
            {snieg.map((item) => (
                <ConditionalLink
                    key={item.id}
                    link={item.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div
                        className={`bg-card rounded-3xl p-6 mb-5 group grid md:grid-cols-6 gap-4 ${
                            item.enlace ? 'hover:border-1 hover:border-tertiary' : ''
                        }`}
                    >
                        <div className="md:col-span-2">
                            <img
                                src={
                                    item.imagen
                                        ? item.imagen
                                        : 'https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png'
                                }
                                alt={item.titulo}
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <h2 className="text-36 text-titulo font-garet-extra font-extrabold">
                                {item.titulo}
                            </h2>

                            <SafeHtml htmlContent={item.descripcion} className="mt-5 diez" />
                            {item.enlace && (
                                <div className="mb-4 h-10">
                                    <TrackedLink
                                        to={item.enlace}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className="group-hover:bg-tertiary col-span-1 bg-white shadow-lg h-[40px] w-[40px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl float-right">
                                            <span className="quill--link-out text-tertiary group-hover:bg-white!"></span>
                                        </div>
                                    </TrackedLink>
                                </div>
                            )}
                        </div>
                    </div>
                </ConditionalLink>
            ))}
        </div>
    );
}