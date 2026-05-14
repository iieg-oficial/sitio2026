export default function MisionVision() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto container">
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Misión</h2>
            </div>
            <div className="text-center">
                <img src="/demo.jpg" alt="" className="mx-auto" />
                <h2 className="text-3xl font-bold mb-6 text-gray-800">¿Tienes dudas? contáctanos</h2>
            </div>      
        </div>
    );
}