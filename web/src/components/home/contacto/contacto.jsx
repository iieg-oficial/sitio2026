import { useState } from "react";
import api from "../../../services/apiService";
import MapaContacto from './mapaContacto';
import mec from '@/config/mapalab-embed-content.json';

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
            <div className="bg-white p-8 mx-2 md:mx-0 xl:pl-30">
                <h2 className="mb-6 text-titulo">¿Tienes dudas? contáctanos</h2>
                <form onSubmit={handleSubmit} id="contacto-form" className="space-y-5 2xl:pr-40">
                    <div>
                        <label className="block text-primary text-14 mb-2">Nombre Completo <span className="text-tertiary">*</span></label>
                        <input 
                            type="text" 
                            placeholder="Ej. Juan Pérez" 
                            className="text-titulo text-22 w-full px-4 py-3 bg-[#EFF4FF] rounded-lg focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all active:ring-primary"
                            value={form.name} 
                            onChange={(e) => setForm({ ...form, name: e.target.value })} 
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-primary text-14 mb-2">Correo Electrónico <span className="text-tertiary">*</span></label>
                        <input 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                            className="text-titulo text-22 w-full px-4 py-3 bg-[#EFF4FF] rounded-lg focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all active:ring-primary"
                            value={form.email} 
                            onChange={(e) => setForm({ ...form, email: e.target.value })} 
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-primary text-14 mb-2">Tu Mensaje <span className="text-tertiary">*</span></label>
                        <textarea 
                            rows="5" 
                            placeholder="¿En qué podemos ayudarte?" 
                            className="text-titulo text-22 w-full px-4 py-3 bg-[#EFF4FF] rounded-lg focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all resize-none"
                            value={form.message} 
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={status === "Enviando..."}
                        className={`button2 border-tertiary !px-18 !py-3 font-bold text-tertiary ${
                            status === "Enviando..." ? "bg-medio text-white cursor-wait" : "hover:bg-tertiary hover:text-white"
                        }`}
                    >
                        {status === "Enviando..." ? "Enviando..." : "Enviar"}
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
                <div className="my-6 text-20 font-bold text-titulo">
                    
                    <a href={`tel:+52${mec.telefono.replace(/\s+/g, '')}`} className="text-titulo hover:text-tertiary flex items-center">
                        <span class="et--phone mr-4 w-[26px] h-[26px] flex-none"></span> 
                        <span className="flex-1">{mec.telefono}</span>
                    </a>
                    
                    <p className="mt-2 text-20 font-bold text-titulo flex items-center mt-5">
                        <span class="mynaui--map-pin w-[25px] h-[25px] mr-4 flex-none"></span> 
                        <span className="flex-1">{mec.direccion}</span>
                    </p>
                </div>
            </div>

            <div className="h-full min-h-[400px] lg:min-h-full px-2 py-8 lg:pl-0 lg:pr-8">
                <MapaContacto />
            </div>
        </>
    );
}