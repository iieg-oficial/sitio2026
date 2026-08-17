import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import '../../blocks/styles/plataformas.css'

export default function PlataformasSlider() {
    const [plataformas, setPlataformas] = useState([])
    const location = useLocation()

    useEffect(() => {
    const fetchPlataformas = async () => {
        try {
        const response = await api.get('/sistemas/', {
            params: {
            destacado: false,
            slider: true
            }
        })
        setPlataformas(response.data.sistemas)
        } catch (error) {
        console.error('Error al obtener plataformas:', error)
        }
    }
    fetchPlataformas()
    }, [location])

    return (
        <div >
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
            {plataformas.map(plataforma => (
                        <SwiperSlide key={plataforma.id} className="place-items-center p-2 pb-14" >
                            <a href={plataforma.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                                <img src={plataforma.imagen || "/demo.jpg"} alt={plataforma.titulo} className="w-full object-cover group-hover:scale-110"/>                                
                                <p>{plataforma.link}</p>
                            </a>
                        </SwiperSlide>
                    ))} 
            </Swiper>
            
        </div>
    )
}
            