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
    <div className='container mx-auto px-2'>
        <div className="relative container mx-auto px-2">
                    <span class="material-symbols--chevron-left absolute z-10 bottom-5 left-0 sm:hidden!"></span>
                    <div
                        className="flex gap-5 mb-10 lg:ml-15 overflow-x-auto sm:overflow-visible snap-x snap-mandatory"
                        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                    >                    
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => { setActiveTab(subject); setItemOffset(0); } }
                                className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === subject
                                        ? 'bg-etiqueta-sec text-tertiary border-tertiary'
                                        : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'}`}
                            >
                                {subject}
                            </button>
                        ))}                    
                    </div>
                    <span class="material-symbols--chevron-right absolute z-10 bottom-5 right-0 sm:hidden!"></span>
                </div>


        <div className='flex gap-2 mb-4'>
            {gruposPreguntas.length === 0 && <p>No hay preguntas</p>}

            {gruposPreguntas.map(([tema, preguntas]) => {        
                      
                return (
                    <div key={tema} className='w-full mb-15'>
                        {preguntas.map((pregunta) => {
                            const isOpen = openPreguntas[pregunta.id] ?? false;  

                            return (
                                <div key={pregunta.id} className='mb-5 w-full rounded-2xl bg-card pl-6 p-4'>
                                    <button onClick={() => togglePregunta(pregunta.id)} className='grid grid-cols-12 w-full'>
                                        <h2 className='text-primary text-22 col-span-11 text-left'>{pregunta.pregunta}</h2>
                                        <div className='col-span-1'>
                                        <div className=' bg-white shadow-lg h-[25px] w-[25px] rounded-full float-right transition-shadow duration-300 hover:shadow-xl'>
                                            <span className={`line-md--chevron-down text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></span>
                                        </div>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div dangerouslySetInnerHTML={{__html: pregunta.respuesta}} className='diez mt-5' />
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