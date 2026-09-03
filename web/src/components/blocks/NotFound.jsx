import { Link } from 'react-router'

function NotFound() {
    return (
        <main className="flex min-h-[75dvh] mx-auto w-11/12 md:w:8/12 xl:w-[625px] text-center items-center justify-center">  
            <div>
                <img src="/ico_pag_no_encontrada.svg" alt="Página no encontrada" className="mx-auto mb-5 w-7/12 h-auto sm:w-1/2 xl:w-5/12" />
                <div className="text-center my-5">
                    <h1>No encontramos la página que estás buscando…</h1>
                    <Link to="/" className="mt-5 mx-auto w-[250px] button block font-18 text-white font-garat-bold bg-primary px-10 hover:text-primary hover:bg-white border border-primary">
                        Regresar al inicio
                    </Link>
                </div>
            </div>          
        </main>
    );
}

export default NotFound;