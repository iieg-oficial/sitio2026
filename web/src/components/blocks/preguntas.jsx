import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Preguntas() {
    const [preguntas, setPreguntas] = useState([]);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(null);
    const [openPreguntas, setOpenPreguntas] = useState({});

    useEffect(() => {
        showPreguntas()
    }, [location])

    const showPreguntas = async () => {
        const response = await api.get('/preguntas')
        setPreguntas(response.data.preguntas)
    }

    const subjects = [...new Set(preguntas.map(p => p.subject?.titulo))].sort();

    useEffect(() => {
        if (subjects.length > 0 && !subjects.includes(activeTab)) {
            setActiveTab(subjects[0]);
        }
    }, [subjects.join(',')]);

    const preguntasBySubject = preguntas.filter(p => p.subject?.titulo === activeTab);
    
    const groupedBySubject = preguntasBySubject.reduce((grupos, pregunta) => {
        const tema = pregunta.subject?.titulo ?? 'Sin tema';
        if (!grupos[tema]) grupos[tema] = [];
        grupos[tema].push(pregunta);
        return grupos;
    }, {});

    const gruposPreguntas = Object.entries(groupedBySubject);
    
    const togglePregunta = (id) => {        
        setOpenPreguntas(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

   return (
    <div>
        <h1>Preguntas frecuentes</h1>
        <div className="flex gap-2 mb-4">
                {subjects.map(subject => (
                    <button
                        key={subject}
                        onClick={() => { setActiveTab(subject); } }
                        className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === subject
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                    >
                        {subject}
                    </button>
                ))}
        </div>
        <div className='flex gap-2 mb-4'>
            {gruposPreguntas.length === 0 && <p>No hay preguntas</p>}

            {gruposPreguntas.map(([tema, preguntas]) => {        
                      
                return (
                    <div key={tema} className='w-full border-2 border-gray-200 rounded-lg p-4'>
                        {preguntas.map((pregunta) => {
                            const isOpen = openPreguntas[pregunta.id] ?? true;  

                            return (
                                <div key={pregunta.id}>
                                    <button onClick={() => togglePregunta(pregunta.id)}>
                                        <h2>{pregunta.titulo}</h2>
                                        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                                    </button>
                                    {isOpen && (
                                        <div className='mt-2 bg-gray-200 p-2 rounded-lg'><p>{pregunta.respuesta}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            }
            
            )}
        </div>
    </div>
   )
}