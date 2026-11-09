import { useMemo, useRef, useState } from 'react';
import Card from './Card';
import TitleAndNote from './TitleAndNote';
import Searcher from './searcher';
import { buildTopics, buildGuide, buildSelect, DEFAULT_VIDEO_ID } from '../../helpers/homeAdapters';
import { useHomeContent } from '@hooks/useHomeContent';

const Body = ({ isModal = false }) => {
    const carouselRef = useRef(null);
    const faqRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [expandedSection, setExpandedSection] = useState(null);    
    const [activeBtn, setActiveBtn] = useState(0);
    const { home } = useHomeContent();
    const showVideo = true;
    const videoId =  DEFAULT_VIDEO_ID;
    const videoTitle = 'MapaLab — IIEG';
    const topicsList = useMemo(() => buildTopics(home?.topics?.items));
    const guideSteps = useMemo(() => buildGuide(home?.guide?.items));
    const selectOptions = useMemo(() => buildSelect(home?.select?.items));

    const toggleSection = (id) => {
        const isOpening = expandedSection !== id;
        trackHomeAction(isOpening ? 'section_open' : 'section_close', String(id));
        setExpandedSection(expandedSection === id ? null : id);
        setActiveBtn(!activeBtn);
        if (isOpening) {
            setTimeout(() => {
                faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const handleMouseDown = (e) => {
        const carousel = carouselRef.current;
        if (!carousel) return;
        setIsDragging(true);
        setStartX(e.pageX - carousel.offsetLeft);
        setScrollLeft(carousel.scrollLeft);
        carousel.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const carousel = carouselRef.current;
        if (!carousel) return;
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        const carousel = carouselRef.current;
        if (carousel) carousel.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
        if (isDragging) handleMouseUp();
    };

    return (
        <div className="gap-y-9">
            {!isModal && (
                <div
                    className='
                        relative z-10 -mt-[5vh] 2xl:-mt-[23vh] mx-[3%] 2xl:mx-[5%] bg-[#F9FBFF] rounded-[30px]
                        p-3 md:p-5 lg:p-10 flex flex-col shadow-[0px_3px_21px_#ACBFE56C] gap-y-3
                    '
                >
                    <span className='block font-garet font-normal text-numeralia text-[18px] mt-4 lg:mt-0 mb-4 2xl:leading-16 tracking-normal text-center'>
                        Puedes buscar por palabra clave o seleccionar una de las temáticas disponibles para navegar en el mapa
                    </span>
                    <Searcher className="relative mx-auto mb-2 w-6/12" />                   
                    <Card topics={topicsList} />
                </div>
            )}
            <div className="my-9 mx-4 flex flex-col justify-center items-center">
                <TitleAndNote title="¿Qué puedes hacer en MapaLab?" description="*Para un mejor funcionamiento, te sugerimos acceder desde una computadora." />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-x-16 2xl:gap-x-36 2xl:gap-y-14 md:mx-10 mt-8">
                   
                </div>
            </div>

            <div className="pt-5 relative">
                <TitleAndNote title="No te pierdas estas funcionalidades del mapa" description="* La visualización de las capas dependerá de tu navegador; te sugerimos eliminar las capas que no estés utilizando para un mejor rendimiento del mapa." />
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- drag-scroll en contenedor con rol region; keyboard users usan scroll nativo con flechas */}
                <div
                    ref={carouselRef}
                    role="region"
                    aria-label="Carrusel de opciones"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className="
                        flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth ml-[3%] xl:ml-[5%]
                        mt-8 px-4 md:px-10 cursor-grab select-none
                        [&::-webkit-scrollbar]:hidden [scrollbar-width:none]
                    "
                >
                    
                    
                </div>
            </div>
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 my-10 md:my-[61px] mx-1 sm:mx-4">
               
            </div>

            <div ref={faqRef} className={`w-full px-2 bg-[#F9FBFF] ${expandedSection === 1 ? 'flex flex-col items-center justify-center' : 'hidden'}`}>
                
            </div>


        </div>
    );
};

export default Body;