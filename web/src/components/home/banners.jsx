import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Banners() {
    const [banners, setBanners] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchBanners = async () => {
            const response = await api.get('/banner', { params: { activo: true } })
            setBanners(response.data)
        }
        fetchBanners()
    }, [location])

  return (
    <>    
      <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        modules={[Pagination, Autoplay ]}
        className="mySwiper h-full"
        autoplay={{ delay: 10000, pauseOnMouseEnter: true }}
        lazy={true}
        a11y={{
                enabled: true,
                prevSlideMessage: 'Anterior',               
                nextSlideMessage: 'Siguiente',
                
            }}
      >
        {banners.map(banner => (
            <SwiperSlide key={banner.id} className="relative w-full h-full content-center " style={{ backgroundColor: banner.color_fondo}}>
              {banner.full_screen ? (
                    <>
                        <img src={banner.imagen_desktop} alt={banner.titulo} className="hidden md:block w-full object-cover"/>
                        <img src={banner.imagen_mobile} alt={banner.titulo} className="md:hidden w-full object-cover"/>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 container mx-auto h-56 px-2 md:px-0">
                        <div>
                            <h2>{banner.titulo}</h2>                            
                            <div dangerouslySetInnerHTML={{__html: banner.descripcion}} className='mt-5 prose max-w-none' />
                            <Link to={banner.link} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md mt-3 block">{banner.boton}</Link>
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
