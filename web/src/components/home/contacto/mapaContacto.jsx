import { useScript } from '@hooks/useScript';

const BASE_URL = (import.meta.env.VITE_MAPALAB_BASE_URL || '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_MAPALAB_API_KEY || '';

const SEDE_MARKER = '20.68443473644039,-103.44669185275052';
const SEDE_ZOOM = '16';
const SEDE_DIRECCION = 'Calz. de los Pirules #71, Granja, 45010. Zapopan, Jal.';
const SEDE_TITULO = 'Instituto de Información Estadística y Geográfica de Jalisco';

export default function MapaContacto() {
    const configurado = Boolean(BASE_URL && API_KEY);
    const status = useScript(configurado ? `${BASE_URL}/widget/v1/mapalab.js` : null);

    if (configurado && status === 'ready') {
        return (
            <iieg-mapalab
                api-key={API_KEY}
                base-url={BASE_URL}
                marker={SEDE_MARKER}
                marker-title={SEDE_TITULO}
                marker-description={SEDE_DIRECCION}
                zoom={SEDE_ZOOM}
                width="100%"
                height="100%"
                title="Ubicación del IIEG"
            ></iieg-mapalab>
        );
    }

    if (configurado && status === 'loading') {
        return <div className="w-full h-full bg-[#EFF4FF] animate-pulse" />;
    }

    return (
        <div className="w-full h-full bg-[#EFF4FF] flex flex-col items-center justify-center p-8 text-center">
            <span className="mynaui--map-pin w-[32px] h-[32px] mb-4 text-tertiary"></span>
            <p className="text-primary text-14 mb-4 max-w-xs">{SEDE_DIRECCION}</p>
            <a
                href={`${BASE_URL || 'https://iieg.jalisco.gob.mx/mapalab'}/mapa?marker=${SEDE_MARKER}&zoom=${SEDE_ZOOM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button2 border-tertiary !px-8 !py-2 font-bold text-tertiary hover:bg-tertiary hover:text-white"
            >
                Ver ubicación en MapaLab
            </a>
        </div>
    );
}
