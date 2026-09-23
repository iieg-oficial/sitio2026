import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import './banners.css';
import { SafeHtml } from '@components/SafeHtml';

export default function Banners() {
    const [banners, setBanners] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await api.get('/banner');
                
                const data = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.banners || []);

                setBanners(data);
            } catch (error) {
                console.error("Error al cargar banners:", error);
            }
        }
        fetchBanners()
    }, [location])

    if (banners.length === 0) return null; // Evita renderizar Swiper vacío


  return (
    <>    
      <Swiper
        key={banners.length}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        modules={[Pagination, Autoplay ]}
        className="mySwiper h-full bg-secondary"
        autoplay={{ delay: 10000, pauseOnMouseEnter: true }}
        lazy={true}
        a11y={{
                enabled: true,
                prevSlideMessage: 'Anterior',               
                nextSlideMessage: 'Siguiente',
                
            }}
      >
        {banners.map(banner => (
            <SwiperSlide key={banner.id} className="relative w-full h-full content-center lg:content-normal " style={{ backgroundColor: banner.color_fondo}}>
              {banner.full_screen ? (
                    <>
                        <a href={banner.link} target="_blank" rel="noopener noreferrer">
                            <img src={banner.imagen_desktop} alt={banner.titulo} className="hidden md:block w-full object-cover h-full"/>
                            <img src={banner.imagen_mobile} alt={banner.titulo} className="md:hidden w-full object-cover h-full"/>
                        </a>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 container mx-auto px-5 xl:px-5 2xl:px-0 my-[15px] lg:my-[50px]">
                        <div className="grid xl:grid-cols-6">
                            <div className="xl:col-span-5 xl:col-start-2">
                                <h2 className='text-white'>{banner.titulo}</h2>          
                                <SafeHtml htmlContent={banner.descripcion} className='mt-10 prose max-w-none banner !text-white mb-15'/>
                                <Link to={banner.link} className="button block font-base float-left bg-tertiary hover:bg-medio">{banner.boton}</Link>
                            </div>
                        </div>
                        <div>
                            <img src={banner.imagen} alt={banner.titulo} className="w-full h-auto object-cover xl:w-[460px] mx-auto"/>
                        </div>
                    </div>
                )}
            </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}