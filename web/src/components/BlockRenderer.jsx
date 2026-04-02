import Carousel from './pageComponents/Carousel'
import Plataformas from './pageComponents/Plataformas'
import HeroBlock from './blocks/HeroBlock'
import TextBlock from './blocks/TextBlock'
import Contacto from './home/contacto'
import PlataformasDestacado from './home/plataformasDestacado'
import PlataformasSlider from './home/plataformas_slider'
import DatosNuevos from './home/datos_nuevos'

const COMPONENT_MAP = {
    'carousel': Carousel,
    'plataformas': Plataformas,
    'hero': HeroBlock,
    'text': TextBlock,
    'contacto': Contacto,
    'plataformasDestacado': PlataformasDestacado,
    'plataformas_slider': PlataformasSlider,
    'datos_nuevos': DatosNuevos,
}

export default function BlockRenderer({ block }) {
    if (!block || !block.type) return null

    const Component = COMPONENT_MAP[block.type]

    if (!Component) {
        console.warn(`Unknown block type: ${block.type}`)
        return null
    }   

    return <Component {...block.props} />
}
