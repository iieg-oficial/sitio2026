import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import bgHome from '../../public/mapalab/bg_home.svg'
import TrackedLink from '@components/blocks/boton'
import logo from '../../public/mapalab/mapalab_square.svg'
import banner from '../../public/mapalab/bannerHeader.webp'
import Body from '../components/pageComponents/Body'

export default function Mapalab() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true)

    const fetchPageHome = async () => {
        setLoading(true)
        try {            
            const res = await api.get('/paginas/slug/mapalab')
            setPage(res.data)
            console.log('Page data:', res.data)  
        } catch (err) {
            console.error("Error fetching page:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPageHome()
    }, [])


    return (
        <>
            <Helmet>
                <title>{page?.title || 'Mapalab - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
                <meta property="og:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page?.title || 'Mapalab - IIEG'} />
                <meta name="twitter:description" content={page?.description_meta || 'Mapa interactivo de Jalisco del IIEG. Visualiza mapas oficiales del estado de Jalisco con capas geoespaciales de temperatura, precipitación, recursos naturales, eventos y datos estadísticos.'} />
                <meta name="twitter:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
            </Helmet>
            <div
                className='min-h-screen overflow-x-hidden'
                style={{
                    backgroundImage: `url(${bgHome})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
                >                    
                    <div className="headerMapalab" style={{ background: 'linear-gradient(359deg, rgb(92, 36, 114) 0%, rgb(150, 60, 186) 100%)' }}>
                        <div className='pt-5 pl-5 float-left absolute z-20'>
                            <Backlink />
                        </div>
                        <header
                            className="relative px-4 h-dvh md:h-[90dvh] 2xl:h-[80dvh] min-h-[720px] sm:min-h-[600px] w-full overflow-visible"
                        >
                            
                            <div className="hidden md:block md:absolute inset-0 xl:hidden" style={{ 
                                        backgroundImage: `linear-gradient(359deg, rgba(92, 36, 114, 0.9) 0%, rgba(150, 60, 186, 0.9) 100%), url(${banner})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                     }}>
                                <img
                                    src={banner}
                                    alt="MapaLab"
                                    className="w-full h-auto 2xl:w-full 2xl:h-auto 3xl:max-w-[723px] 3xl:max-h-[583px] object-cover float-right md:hidden xl:block"                                    
                                />
                            </div>

                            <div className="hidden xl:block w-[35vw] absolute right-0 top-[20%] 2xl:top-[12%] 3xl:top-[10%] overflow-visible">
                                <img
                                    src={banner}
                                    alt="MapaLab"
                                    className="w-full h-auto 2xl:w-full 2xl:h-auto 3xl:max-w-[723px] 3xl:max-h-[583px] object-cover float-right"
                                />
                            </div>
                            

                            <div className="relative z-10 h-full 2xl:h-[70%] flex flex-col xl:flex-row items-center justify-center xl:justify-start 2xl:gap-36 xl:container xl:mx-auto">
                                <div className="xl:flex xl:w-[20vw] 3xl:w-[25vw] justify-center xl:justify-end xl:mb-18">
                                    <img
                                        src={logo}
                                        alt="Logo MapaLab banner desktop"
                                        className="w-[115px] h-auto xl:w-[216px] xl:h-[232px] object-contain"
                                    />  
                                </div>
                                <div className="w-full mt-15 md:mt-0 2xl:w-[35vw] px-4 flex justify-center xl:justify-start">
                                    <div className="w-full max-w-[497px] xl:max-w-[600px] xl:pl-20 2xl:pl-0 2xl:max-w-[497] flex flex-col gap-3">
                                        <h1 className="font-garet text-[50px]/[59px] text-white tracking-normal text-left">
                                            <span className="block font-garet tracking-normal"></span>
                                            <span className="block font-garet-extra tracking-normal">Explora Jalisco en capas</span>
                                        </h1>
                                        
                                            <p className="font-garet font-medium text-white text-[21px]/[34px] tracking-normal text-left">
                                                MapaLab es una herramienta interactiva que pone a tu alcance información geoespacial confiable y actualizada.
                                            </p>
                                        
                                                <TrackedLink
                                                    to="https://iieg.jalisco.gob.mx/mapalab/mapa"
                                                    className={`
                                                        flex items-center justify-center h-[54px] w-full max-w-[410px]
                                                        mt-2 bg-tertiary rounded-[30px] transition-colors
                                                        hover:bg-[#E57600] hover:shadow-[0px_6px_6px_#5C247234]
                                                        font-garet font-medium text-white text-[18px] tracking-normal
                                                    `}
                                                >
                                                    Quiero explorar el mapa
                                                </TrackedLink>

                                    
                                    </div>
                                </div>
                            </div>

                         
                        </header>      
                    </div>
                    <Body />
            </div>
        </>
    )
}

