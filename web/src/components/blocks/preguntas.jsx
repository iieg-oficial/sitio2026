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
    
    
   return (
    <div>
        <h1>Preguntas frecuentes</h1>
        <div className='border-2 border-gray-200 rounded-lg p-4'>
            {preguntas.map(pregunta => (
                <div key={pregunta.id} className='border-2 border-gray-200 rounded-lg mb-3'>
                    <button
                        onClick={() => setActiveTab(pregunta.id)}
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
                        