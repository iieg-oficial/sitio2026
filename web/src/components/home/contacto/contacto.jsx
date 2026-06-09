import { useState } from "react";
import api from "../../../services/apiService";

export default function Contacto() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [status, setStatus] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Enviando...");
        try {
            // Usamos el servicio de API configurado que ya tiene la baseURL adecuada
            const response = await api.post("/contacto/", form);
            
            if (response.data.status === "ok") {
                setStatus("ok");
                setForm({ name: "", email: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("Error en el envío:", error);
            setStatus("error");
        }
    };

    return (
        <>          
            <div className="bg-white p-8 mx-2 md:mx-0 ">
                <h2 className="mb-6 text-titulo">¿Tienes dudas? contáctanos</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-primary text-14 mb-2">Nombre Completo</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Juan Pérez" 
                            className="w-full px-4 py-3 bg-[##EFF4FF] focus:ring-2 focus:ring-positivo focus:bg-white outline-none transition-all active:ring-positivo"
                            value={form.name} 
                            onChange={(e) => setForm({ ...form, name: e.target.value })} 
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-primary text-14 mb-2">Correo Electrónico</label>
                        <input 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                            className="w-full px-4 py-3 bg-[##EFF4FF] focus:ring-2 focus:ring-positivo focus:bg-white outline-none transition-all active:ring-positivo"
                            value={form.email} 
                            onChange={(e) => setForm({ ...form, email: e.target.value })} 
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Tu Mensaje</label>
                        <textarea 
                            rows="5" 
                            placeholder="¿En qué podemos ayudarte?" 
                            className="w-full px-4 py-3 bg-[##EFF4FF] focus:ring-2 focus:ring-positivo focus:bg-white outline-none transition-all resize-none"
                            value={form.message} 
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={status === "Enviando..."}
                        className={`button2 border-tertiary px-5 py-2 text-tertiary ${
                            status === "Enviando..." ? "bg-medio text-white cursor-wait" : "hover:bg-tertiary hover:text-white"
                        }`}
                    >
                        {status === "Enviando..." ? "Enviando..." : "Enviar Mensaje"}
                    </button>

                    {status === "ok" && (
                        <div className="p-4 bg-green-50 border-l-4 border-exito text-exito animate-fade-in">
                            <p className="font-bold">✓ ¡Éxito!</p>
                            <p className="text-sm">Tu mensaje ha sido enviado correctamente.</p>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="p-4 bg-red-50 border-l-4 border-negativo text-negativo animate-fade-in">
                            <p className="font-bold">⚠ Error</p>
                            <p className="text-sm">No pudimos enviar tu mensaje. Por favor intenta de nuevo.</p>
                        </div>
                    )}
                </form>
                <div className="my-6 text-22 text-titulo">
                    <a href="tel:+523337771770" className="block text-titulo hover:text-tertiary">
                        <span class="et--phone"></span> 33 3777 1770
                    </a>
                    <p className="mt-2 text-titulo">
                        <span class="mynaui--map-pin"></span> Calz. de los Pirules #71, Granja, 45010. Zapopan, Jal.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden h-full">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.6363330579716!2d-103.44923245953379!3d20.684369299596163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428aecbb4902a4f%3A0xb1a0d25cb7c814cf!2sInstituto%20de%20Informaci%C3%B3n%20Estad%C3%ADstica%20y%20Geogr%C3%A1fica%20IIEG!5e0!3m2!1ses-419!2smx!4v1774984803790!5m2!1ses-419!2smx" 
                    width="100%" 
                    height="100%" 
                    className="min-h-[400px] lg:min-h-full"
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        </>
    );
}