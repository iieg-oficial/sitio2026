import { useState, useCallback, useMemo } from 'react';
import api from '@services/apiService';
import { SafeHtml } from '@components/SafeHtml';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function Preguntas() {
    const [preguntas, setPreguntas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [openPreguntas, setOpenPreguntas] = useState({});

    const fetchPreguntas = useCallback(async () => {
        try {
            const response = await api.get('/preguntas');
            const data = Array.isArray(response.data?.preguntas) ? response.data.preguntas : [];
            setPreguntas(data);
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización automática al regresar a la pestaña/ventana
    useFetchOnFocus(fetchPreguntas);

    const subjects = useMemo(() => {
        return [...new Set(preguntas
            .flatMap(p => p.temas?.map(t => t.titulo) ?? [])
            .filter(Boolean)
        )].sort();
    }, [preguntas]);

    const activeSubject = subjects[activeTab] ?? null;

    const preguntasBySubject = useMemo(() => {
        if (!activeSubject) return [];
        return preguntas.filter(
            p => p.temas?.some(t => t.titulo === activeSubject)
        );
    }, [preguntas, activeSubject]);

    const togglePregunta = (id) => {
        setOpenPreguntas(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const TabButton = ({ children, active, ...props }) => (
        <button
            type="button"
            {...props}
            className={`px-10 py-3 cursor-pointer rounded-3xl border font-garet-bold text-22 transition-colors flex-shrink-0 snap-start min-w-[120px] ${
                active
                    ? 'bg-etiqueta-sec text-tertiary border-tertiary font-garet-extrabold'
                    : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'
            }`}
        >
            {children}
        </button>
    );

    if (loading && preguntas.length === 0) {
        return <p className="text-center py-6 text-gray-500">Cargando preguntas...</p>;
    }

    return (
        <div className="container mx-auto px-2">
            <div className="relative container mx-auto px-2">
                <span className="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                <div
                    className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                    style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                >
                    {subjects.map((subject, index) => (
                        <TabButton
                            key={`${subject}-${index}`}
                            active={activeTab === index}
                            onClick={() => setActiveTab(index)}
                        >
                            {subject}
                        </TabButton>
                    ))}
                </div>
                <span className="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
            </div>

            <div className="flex flex-col gap-6 mb-4">
                {subjects.length === 0 && (
                    <p className="text-center text-gray-500 my-8">No hay preguntas disponibles por el momento.</p>
                )}

                {activeSubject && (
                    <div className="w-full">
                        {preguntasBySubject.map((pregunta) => {
                            const isOpen = openPreguntas[pregunta.id] ?? false;

                            return (
                                <div
                                    key={pregunta.id}
                                    className="mb-5 w-full rounded-2xl bg-card p-5 sm:p-7 lg:p-10 xl:pl-20 my-5 group hover:border-2 hover:border-primary"
                                >
                                    <button
                                        type="button"
                                        onClick={() => togglePregunta(pregunta.id)}
                                        className="grid grid-cols-12 w-full"
                                    >
                                        <h2 className="text-primary text-22 font-garet-bold col-span-11 text-left">
                                            {pregunta.pregunta}
                                        </h2>
                                        <div className="col-span-1">
                                            <div className="group-hover:bg-primary bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 hover:shadow-xl">
                                                <span
                                                    className={`line-md--chevron-down group-hover:bg-white! text-primary transition-transform duration-300 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                ></span>
                                            </div>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <SafeHtml
                                            htmlContent={pregunta.respuesta}
                                            className="diez mt-5 font-garet text-18 xl:pr-15"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}