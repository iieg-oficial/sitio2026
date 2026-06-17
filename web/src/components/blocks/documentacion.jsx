import { useEffect, useState } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import ReactPaginate from 'react-paginate';

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'descripcion', 'claves', 'subject.titulo'];

    const fetchDocumentaciones = async () => {
        const response = await api.get('/documentacion')
        setDocumentaciones(response.data.documentaciones)
        console.log("datos chidos", response.data)
    }

    useEffect(() => {
        fetchDocumentaciones()
    }, []);

    const filteredDocumentaciones = !searchTerm 
        ? documentaciones
        : documentaciones.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const pageCount = Math.ceil(filteredDocumentaciones.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % filteredDocumentaciones.length;
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto px-2 container my-15'>
                {filteredDocumentaciones.map(documentacion => (
                    <div className='rounded-2xl bg-card p-8' key={documentacion.id}>   
                        {documentacion.temas
                            .filter(tema => !tema.parent_id)
                            .map(tema => (
                                <div key={tema.id}>
                                <span className='text-22'>{tema.titulo}</span>

                                {/* Subtemas que coincidan con el id del tema */}
                                {documentacion.temas
                                    .filter(subtema => subtema.parent_id === tema.id)
                                    .map(subtema => (
                                    <span key={subtema.id} className='text-16'> | {subtema.titulo}</span>
                                    ))
                                }
                                </div>
                            ))
                        }
                        <h3 className='text-primary'>{documentacion.titulo}</h3>
                        <div dangerouslySetInnerHTML={{__html: documentacion.descripcion}} className='mt-5 prose max-w-none my-5' />                                                
                        <div className='flex flex-wrap gap-4'>
                            { documentacion.metodologia && documentacion.metodologia.trim() !== '' && (
                                <a href={documentacion.metodologia} className='rounded-2xl bg-body text-white text-18 px-5 py-2'>Metodología</a>
                            )}
                            { documentacion.codigo && documentacion.codigo.trim() !== '' && (
                                <a href={documentacion.codigo} className='rounded-2xl bg-body text-white text-18 px-5 py-2'>Código abierto</a>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            <ReactPaginate
                previousLabel={"Ant"}
                nextLabel={"Sig"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                forcePage={Math.floor(itemOffset / itemsPerPage)}
            />
        </div>
    )
}