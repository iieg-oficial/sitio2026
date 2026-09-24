import { useState, useCallback } from 'react';
import api from '@services/apiService';
import ConditionalLink from '../pageComponents/ConditionalLink';
import { SafeHtml } from '@components/SafeHtml';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Organos() {
    const [organos, setOrganos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrganos = useCallback(async () => {
        try {
            const response = await api.get('/organos');
            const data = Array.isArray(response.data?.organos) ? response.data.organos : [];
            setOrganos(data);
        } catch (error) {
            console.error('Error al cargar órganos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ejecuta la carga inicial y se actualiza al enfocar la pestaña/ventana
    useFetchOnFocus(fetchOrganos);

    if (loading && organos.length === 0) {
        return (
            <div className="container mx-auto px-2 mb-15 text-center py-10 text-gray-500 font-medium">
                Cargando órganos...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 mb-15">
            {organos.map((organo) => (
                <ConditionalLink
                    key={organo.id}
                    link={organo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div
                        className={`bg-card group rounded-[45px] px-10 py-5 md:px-15 xl:px-20 xl:py-5 mb-10 ${
                            organo.link ? 'hover:border-2 hover:border-primary' : ''
                        }`}
                    >
                        <h2 className="text-primary font-extrabold">{organo.titulo}</h2>

                        <SafeHtml htmlContent={organo.descripcion} className="diez my-5" />
                        {organo.link && (
                            <div className="mb-4 h-10">
                                <div className="group-hover:bg-tertiary col-span-1 bg-white shadow-lg h-[40px] w-[40px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl float-right">
                                    <span className="quill--link-out text-tertiary group-hover:bg-white!"></span>
                                </div>
                            </div>
                        )}
                    </div>
                </ConditionalLink>
            ))}
        </div>
    );
}