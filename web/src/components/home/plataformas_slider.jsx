import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function PlataformasSlider() {
    const [plataformas, setPlataformas] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlataformas = async () => {
            const response = await api.get('/plataformas', { params: { destacado: false } })
            setPlataformas(response.data)
        }
        fetchPlataformas()
    }, [location])

    return (
        <div className="">
            <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            spaceBetween={20}
            slidesPerView={3}
            >
            {plataformas.map(plataforma => (
                        <SwiperSlide key={plataforma.id}>
                            <a href={plataforma.url} target="_blank" rel="noopener noreferrer">
                                <img src={plataforma.imagen} alt={plataforma.titulo} />
                            </a>
                        </SwiperSlide>
                    ))} 
            </Swiper>
            
        </div>
    )
}
            