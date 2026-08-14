import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import './banners.css';

export default function Banners() {
    const [banners, setBanners] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchBanners = async () => {
            const response = await api.get('/banner/', { params: { activo: true } })
            setBanners(response.data)
        }
        fetchBanners()
    }, [location])


  return (
    <>    
      <Swiper
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 container mx-auto px-5 xl:px-5 2xl:px-0 my-[15px] lg:my-[70px] 2xl:my-[96px]">
                        <div>
                            <h2 className='text-white'>{banner.titulo}</h2>                            
                            <div dangerouslySetInnerHTML={{__html: banner.descripcion}} className='mt-10 prose max-w-none !text-white mb-15' />
                            <Link to={banner.link} className="button block font-base float-left bg-medio hover:bg-tertiary">{banner.boton}</Link>
                        </div>
                        <div>
                            <img src={banner.imagen} alt={banner.titulo} className="w-full object-cover"/>
                        </div>
                    </div>
                )}
            </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
