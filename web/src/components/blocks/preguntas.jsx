import { useEffect, useState } from 'react'
import api from '@services/apiService'

export default function Preguntas() {
    const [preguntas, setPreguntas] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [openSubjects, setOpenSubjects] = useState({});

    const showPreguntas = async () => {
        const response = await api.get('/preguntas')
        setPreguntas(response.data.preguntas)
    }

    useEffect(() => {
        showPreguntas()
    }, [])
    
    const groupedBySubject = [...new Set(preguntas.map(pregunta => pregunta.subject))].sort();
    
    useEffect(() => {
        if (groupedBySubject.length > 0 && !groupedBySubject.includes(activeTab)) {
            setActiveTab(groupedBySubject[0]);
        }
    }, [groupedBySubject.join(',')]);

    
   return (
    <div>
        <h1>Preguntas frecuentes</h1>
        {preguntas.map(pregunta => (
            <div key={pregunta.id}>
                <h2>{pregunta.titulo}</h2>
                <p>{pregunta.respuesta}</p>
            </div>
        ))}
        <div className='border-2 border-gray-200 rounded-lg p-4'>
            {groupedBySubject.map(subject => (
                <div key={subject} className='border-2 border-gray-200 rounded-lg mb-3'>
                    <p>{subject}</p>
                    {preguntas.filter(pregunta => pregunta.subject === subject).map(pregunta => (
                        <div key={pregunta.id} className='border border-gray-100 rounded p-3'>
                            <h3 className='text-blue-600 hover:underline'>{pregunta.titulo}</h3>
                            <p>{pregunta.respuesta}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
   )
}
                        