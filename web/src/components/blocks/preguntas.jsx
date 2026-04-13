import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';

export default function Preguntas() {
    const [preguntas, setPreguntas] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [openSubjects, setOpenSubjects] = useState([]);

    const showPreguntas = async (opcion) => {
        const response = await api.get('/preguntas')
        setPreguntas(response.data.preguntas)
    }
    useEffect(() => {
        showPreguntas()
    }, [])

    
    const subjects = [...new Set(
        preguntas.map(p => p.subject?.titulo))].sort();
    
    useEffect(() => {
        if (subjects.length > 0 && !subjects.includes(activeTab)) {
            setActiveTab(subjects[0]);
        }
    }, [subjects.join(',')]);

    const toggleSubject = (subject) => {
        setOpenSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
    };

    const groupedBySubject = preguntas.reduce((grupos, pregunta) => {
        const subject = pregunta.subject?.titulo || 'Sin categoría';
        if (!grupos[subject]) {
            grupos[subject] = [];
        }
        grupos[subject].push(pregunta);
        return grupos;
    }, {});
    
   return (
    <div>
        <h1>Preguntas frecuentes</h1>
        <div className='border-2 border-gray-200 rounded-lg p-4'>
            {subjects.map(subject => (
                <div key={subject} className='border-2 border-gray-200 rounded-lg mb-3'>
                    <button
                        onClick={() => setActiveTab(subject)}
                        className='w-full flex justify-between items-center px-4 py-3 font-semibold text-left hover:bg-gray-50'
                    >
                        <span>{subject}</span>
                        <span className='text-gray-400'>{activeTab === subject ? '▼' : '▲'}</span>
                    </button>
                    {activeTab === subject && (
                        <div className='px-4 pb-4'>
                            {groupedBySubject[subject].map(pregunta => (
                                <div key={pregunta.id} className='mb-3'>
                                    <h3 className='font-semibold'>{pregunta.pregunta}</h3>
                                    <p>{pregunta.respuesta}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
   )
}
                        