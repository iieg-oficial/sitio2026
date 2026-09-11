import { useScript } from '@hooks/useScript';
import mec from '@/config/mapalab-embed-content.json';

const BASE_URL = (import.meta.env.VITE_MAPALAB_BASE_URL || '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_MAPALAB_API_KEY || '';

const CHIP_STYLE_BY_COLOR = { morado: 'solid', naranja: 'accent' };

const MARKER_CARD = JSON.stringify({
    chips: mec.chips.map(({ texto, color }) => ({ text: texto, style: CHIP_STYLE_BY_COLOR[color] || 'soft' })),
    rows: [
        { label: 'Organismo', text: mec.organismo },
        { label: 'Qué hace', text: mec.descripcion },
    ],
    links: [
        { icon: 'ubicacion', text: mec.direccion },
        { icon: 'celular', text: mec.telefono, href: `tel:+52${mec.telefono.replace(/\s+/g, '')}` },
        { icon: 'mapas', text: 'Explorar Jalisco en MapaLab', href: '@visor' },
    ],
    tiles: mec.cifras.items.map(({ valor, etiqueta }) => ({ value: valor, label: etiqueta })),
    order: ['chips', 'rows', 'links', 'tiles'],
});

export default function MapaContacto() {
    const configurado = Boolean(BASE_URL && API_KEY);
    const status = useScript(configurado ? `${BASE_URL}/widget/v1/mapalab.js` : null);

    if (configurado && status === 'ready') {
        return (
            <iieg-mapalab
                api-key={API_KEY}
                base-url={BASE_URL}
                marker={mec.coordenadas}
                marker-title={mec.nombreCorto}
                marker-card={MARKER_CARD}
                zoom={String(mec.zoom)}
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
            <p className="text-primary text-14 mb-4 max-w-xs">{mec.direccion}</p>
            <a
                href={`${BASE_URL || 'https://iieg.jalisco.gob.mx/mapalab'}/mapa?marker=${mec.coordenadas}&zoom=${mec.zoom}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button2 border-tertiary !px-8 !py-2 font-bold text-tertiary hover:bg-tertiary hover:text-white"
            >
                Ver ubicación en MapaLab
            </a>
        </div>
    );
}
