import PropTypes from 'prop-types';

const Searcher = ({ searchTerm = '', setSearchTerm, placeholder }) => {
    const isSearching = searchTerm.length > 0;

    return (
        <div className="w-full">
            {/* Contenedor principal que controla el ancho en móvil y escritorio */}
            <div className="mx-auto w-full px-2 md:w-3/6 max-w-[1000px]">
                
                {/* Contenedor/Simulador del Input:
                  Mantiene el fondo 'bg-card', los bordes redondeados 'rounded-3xl' y el centrado 'justify-center'.
                  Escucha el focus con 'focus-within:' para aplicar tus estilos de "positivo".
                */}
                <div className={`
                    flex items-center justify-center w-full border rounded-3xl px-4 py-2 bg-card transition-all duration-200
                    
                    /* Estado por defecto */
                    border-primary
                    
                    /* Tus efectos de FOCUS aplicados al borde cuando el usuario da click */
                    focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-primary focus-within:bg-[#F3EAFF]
                    
                    /* Tu cambio de estado dinámico (opcional, por si quieres cambiar el borde al escribir) */
                    ${isSearching ? 'border-primary' : ''}
                `}>

                    {/* El Input real: ahora es transparente y sin bordes propios */}
                    <input 
                        type="text" 
                        placeholder={placeholder}
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-primary text-center outline-none placeholder-primary font-garet-bold text-22"
                    />

                    {/* El Ícono SVG: 
                      Al estar en un flex justo después del input, se queda a la derecha del texto.
                      Cambiamos el fill a 'currentColor' y controlamos el color dinámicamente con className.
                    */}
                    <div className="flex items-center ml-2 shrink-0">                    
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24"
                            className={`transition-colors duration-200 ${isSearching ? 'text-secondary' : 'text-primary'}`}
                        >
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path 
                                fill="currentColor" 
                                d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14" 
                            />
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    );
}

Searcher.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default Searcher;