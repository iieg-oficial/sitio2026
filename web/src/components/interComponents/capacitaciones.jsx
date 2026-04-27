import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@services/apiService'

export default function Capacitaciones() {
    const { slug } = useParams(); // obtiene el id del elemento clicleable
    const [singleCapacitacion, setSingleCapacitacion] = useState(null);
    const [activeTab, setActiveTab] = useState(null);

    useEffect(() => {
        const fetchCapacitacion = async () => {
            try {
                const response = await api.get(`/cursos-public/${slug}`);
                setSingleCapacitacion(response.data);
            } catch (error) {
                console.error("Error al obtener la capacitación:", error);
            }
        }
        fetchCapacitacion();
    }, [slug]);

    if (!singleCapacitacion) {
        return <div>Cargando ...</div>;
    }

    return (
        <>
            <Helmet>
                <title>{singleCapacitacion.titulo}</title>
                <meta name="description" content={singleCapacitacion.resumen} />
                <meta property="og:title" content={singleCapacitacion.titulo} />
                <meta property="og:description" content={singleCapacitacion.resumen} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>
            <article className='mx-auto container my-40 relative flex flex-col items-center'>
                <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative bg-white'>
                    <h1 className='text-3xl font-bold mb-4'>{singleCapacitacion.titulo}</h1>
                    <div dangerouslySetInnerHTML={{__html: singleCapacitacion.descripcion}} className='mt-5 prose max-w-none' />
                </main>
                <section className='grid grid-cols-1 md:grid-cols-3'>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Fecha:</strong> {new Date(singleCapacitacion.inicio).toLocaleDateString()}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Formato:</strong> {singleCapacitacion.tipo_curso.formato}</p>
                    </div>
                    <div className='mt-8 text-sm text-gray-500 border-t pt-4'>
                        <p><strong>Horario:</strong> {singleCapacitacion.Horario}</p>
                    </div>
                </section>
                <section className='w-11/12 md:w-10/12 mx-auto'>
                    <div>
                        <h2>Objetivo</h2>
                        <p>{singleCapacitacion.Objetivo}</p>
                    </div>
                    <div>
                        <h2>Perfil de Ingreso</h2>
                        <p>{singleCapacitacion.p_ingreso}</p>
                    </div>
                     <div>
                        <h2>Perfil de Egreso</h2>
                        <p>{singleCapacitacion.p_egreso}</p>                        
                    </div>
                </section>
                <section className="border-2 border-gray-200 p-5 my-5">
                    <p><strong>Módulos:</strong> 
                        {singleCapacitacion.modulos.map((modulo) => (
                            <div key={modulo.id}>
                                <strong>{modulo.nombre}</strong>
                                <p>{modulo.descripcion}</p>
                            </div>
                        ))}
                    </p><br></br>
                    <p><strong>Instituciones:</strong> 
                    {singleCapacitacion.instituciones.map((institucion) => institucion.nombre).join(', ')}
                    {singleCapacitacion.instituciones.map((institucion) => (
                            <div key={institucion.id}>
                                <strong>{institucion.nombre}</strong>
                                <p>{institucion.descripcion}</p>
                            </div>
                        ))}
                    </p><br></br>
                    <p>
                        <strong>Perfiles:</strong> 
                        {singleCapacitacion.perfiles.map((perfil) => perfil.nombre).join(', ')}
                        {singleCapacitacion.perfiles.map((perfil) => (
                            <div key={perfil.id}>
                                <strong>{perfil.nombre}</strong>
                                <p>{perfil.descripcion}</p>
                            </div>
                        ))}
                        </p><br></br>
                    <p>
                        <strong>Profesores:</strong> 
                        {singleCapacitacion.profesores.map((profesor) => (
                            <div key={profesor.id}>
                                <strong>{profesor.nombre}</strong>
                                <p>{profesor.descripcion}</p>
                            </div>
                        ))}
                        </p><br></br>
                    <p>
                        <strong>Tipo de curso:</strong> {singleCapacitacion.tipo_curso}
                    </p><br></br>
                    <p><strong>Destacado:</strong> {singleCapacitacion.destacado}</p><br></br>
                    <p><strong>Inscripción:</strong> {singleCapacitacion.inscripcion}</p><br></br>
                    <p><strong>Acreditación:</strong> {singleCapacitacion.acreditacion}</p><br></br>
                    <p><strong>Vigencia:</strong> {singleCapacitacion.vigencia}</p><br></br>
                    <p><strong>Contacto:</strong> {singleCapacitacion.contacto}</p><br></br>
                </section>
                    
                <section className='container mx-auto'>
                    <h2>Módulos</h2>
                    <ul>
                        {singleCapacitacion.modulos.map((modulo) => (
                            <li key={modulo.id}>{modulo.nombre}</li>
                        ))}
                    </ul>
                    <div className='flex justify-center mt-8'>
                        {singleCapacitacion.modulos.map((modulo) => (
                            <button 
                            key={modulo.id}
                            onClick={() => setActiveTab(modulo.nombre)}
                            className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === modulo.nombre
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`
                            }
                            >
                                {modulo.nombre}
                            </button>
                        ))}
                    </div>
                    <div className='border-2 border-gray-200 p-5 my-5'>
                        {singleCapacitacion.modulos.map((modulo) => {
                            if (activeTab === modulo.nombre) {
                                return (
                                    <div key={modulo.id}>
                                        <h2>{modulo.nombre}</h2>
                                        <p>{modulo.descripcion}</p>
                                    </div>
                                )}
                            } 
                        )}
                    </div>
                </section>
                    
            </article>
        </>
    );
}