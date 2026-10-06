import { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "../home/banners/banners.css";

export default function Galeria({ images }) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    return (
        <div className="galeria-imagenes">            
            {images && images.length >= 2 ? (
                <>
                    <Swiper
                        style={{
                            "--swiper-navigation-color": "#fff",
                            "--swiper-pagination-color": "#fff",
                        }}
                        loop={true}
                        spaceBetween={10}
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="mySwiper2"
                    >
                        {/* .slice(1) ignora la imagen en la posición 0 */}
                        {images.slice(1).map((imagen) => (
                            <SwiperSlide key={imagen.id}>
                                <img src={imagen.url} alt={`Imagen ${imagen.id}`} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <Swiper
                        onSwiper={setThumbsSwiper}
                        loop={true}
                        spaceBetween={10}
                        slidesPerView={Math.min(images.length - 1, 5)}
                        freeMode={true}
                        watchSlidesProgress={true}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="mySwiper"
                    >
                        {/* .slice(1) también aquí para que las miniaturas coincidan */}
                        {images.slice(1).map((imagen) => (
                            <SwiperSlide key={imagen.id}>
                                <img 
                                    src={imagen.url} 
                                    alt={`Imagen ${imagen.id}`} 
                                    onError={(e) => {
                                        if (!e.target.dataset.triedFallback) {
                                            e.target.dataset.triedFallback = 'true';
                                            e.target.src = imagen.url
                                                ? imagen.url
                                                : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png";
                                        } else {                                        
                                            e.target.onerror = null;
                                            e.target.src = "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png";
                                        }
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </>
            ) : null}
        </div>
    );
}
