import { useState, useCallback } from 'react';
import api from '@services/apiService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../blocks/styles/plataformas.css';
import { useFetchOnFocus } from '@hooks/useFetchOnFocus';

export default function PlataformasSlider() {
    const [plataformas, setPlataformas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlataformas = useCallback(async () => {
        try {
            const response = await api.get('/sistemas', {
                params: {
                    destacado: false,
                    slider: true,
                },
            });
            const data = Array.isArray(response.data?.sistemas) ? response.data.sistemas : [];
            setPlataformas(data);
        } catch (error) {
            console.error('Error al obtener plataformas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y actualización al enfocar
    useFetchOnFocus(fetchPlataformas);

    if (loading && plataformas.length === 0) return null;
    if (plataformas.length === 0) return null;

    return (
        <div>
            <Swiper
                modules={[Navigation, Autoplay]}
                className=""
                navigation
                autoplay={{ delay: 10000, pauseOnMouseEnter: true }}
                spaceBetween={20}
                slidesPerView={1}
                lazy={true}
                a11y={{
                    enabled: true,
                    prevSlideMessage: 'Anterior',
                    nextSlideMessage: 'Siguiente',
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                    1280: {
                        slidesPerView: 4,
                    },
                }}
            >
                {plataformas.map((plataforma) => (
                    <SwiperSlide key={plataforma.id} className="place-items-center p-2 pb-14">
                        <a
                            href={plataforma.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center group"
                        >
                            <img
                                src={
                                    plataforma.imagen_slider ||
                                    'https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png'
                                }
                                alt={plataforma.titulo}
                                className="w-full object-cover group-hover:scale-110 rounded-xl bg-white border border-[#E6EEFF] p-3"
                            />
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}