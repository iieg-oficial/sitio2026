import Banners from './home/banners/banners'
import Contacto from './home/contacto/contacto'
import PlataformasDestacado from './home/plataformas/plataformasDestacado'
import PlataformasSlider from './home/plataformas/plataformas_slider'
import DatosNuevos from './home/datos_nuevos/datos_nuevos'
import Flashes from './home/flash/flash'
import Mapas from './home/mapa/mapas'

const COMPONENT_MAP = {
    'banners': Banners,
    'contacto': Contacto,
    'plataformasDestacado': PlataformasDestacado,
    'plataformas_slider': PlataformasSlider,
    'datos_nuevos': DatosNuevos,
    'flashes': Flashes,
    'mapas': Mapas
}

export default function BlockRenderer({ block }) {
    if (!block || !block.type) return null

    const Component = COMPONENT_MAP[block.type]

    if (!Component) {
        console.warn(`Unknown block type: ${block.type}`)
        return null
    }   

    if (typeof Component !== 'function') {
        console.warn(`El bloque de tipo "${block.type}" no tiene un componente válido asignado.`);
        return null; // O un <div>Bloque no soportado</div> en lugar de romper la app
    }

    // Pasa las props de forma segura (si block.props es null/undefined usa un objeto vacío)
    const props = block.props || {}

    return <Component {...block.props} />
}
