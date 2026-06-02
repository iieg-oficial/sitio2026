export default function Informacion() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mx-auto container py-15 px-2">
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <p className="text-center mt-6 text-gray-800">
                    <b>Gestionamos</b> el Sistema de Información Estratégica de Jalisco
                </p>
            </div>
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <p className="text-center mt-6 text-gray-800">
                    <b>Generamos información</b> relevante para los jaliscienses
                </p>
            </div>
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <p className="text-center mt-6 text-gray-800">
                    <b>Procesamos datos</b> de fuentes oficiales para hacerlos accesibles
                </p>
            </div>
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <p className="text-center mt-6 text-gray-800">
                    <b>Analizamos datos</b> para asistir la toma de decisiones
                </p>
            </div>          
        </div>
    );
}