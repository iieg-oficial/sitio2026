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
        className="mySwiper"
        autoplay={{ delay: 3000 }}
      >
        {banners.map(banner => (
            <SwiperSlide key={banner.id} className={`relative w-full min-h-8/12 grid place-items-center bg-[${!banner.full_screen ? '' : banner.color_fondo}]`}>
                {banner.full_screen ? (
                    <>
                        <img src={banner.imagen_desktop} alt={banner.titulo} className="hidden md:block w-full object-cover"/>
                        <img src={banner.imagen_mobile} alt={banner.titulo} className="md:hidden w-full object-cover"/>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 place-items-center gap-4">
                        <div>
                            <h2>{banner.titulo}</h2>
                            <p>{banner.descripcion}</p>
                            <Link to={banner.link} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md">{banner.boton}</Link>
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
