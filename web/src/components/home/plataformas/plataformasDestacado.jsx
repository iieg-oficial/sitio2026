import { useState, useCallback } from 'react';
import api from '@services/apiService';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function PlataformasDestacado() {
    const [plataformas, setPlataformas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlataformas = useCallback(async () => {
        try {
            const response = await api.get('/sistemas/destacados');
            const data = Array.isArray(response.data?.sistemas) ? response.data.sistemas : [];
            setPlataformas(data);
        } catch (error) {
            console.error('Error al obtener plataformas destacadas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización al volver a enfocar
    useFetchOnFocus(fetchPlataformas);

    if (loading && plataformas.length === 0) return null;
    if (plataformas.length === 0) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-card mx-auto xl:w-11/12 order-1 xl:order-2 container 2xl:container lg:absolute top-0 z-10 lg:rounded-4xl lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 place-items-center pt-3 pb-5 px-5">
            {plataformas.map((plataforma) => (
                <div key={plataforma.id}>
                    <a
                        href={plataforma.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center group"
                    >
                        <img
                            src={plataforma.imagen}
                            alt={plataforma.titulo}
                            className="w-full object-cover group-hover:scale-110 rounded-full max-h-[150px] max-w-[150px]"
                        />
                        <h3 className="mt-2 text-center text-tertiary text-18">
                            {plataforma.titulo}
                        </h3>
                    </a>
                </div>
            ))}
        </div>
    );
}