import { useParams } from 'react-router';
import { useEffect, useState, useRef } from "react";
import { Helmet } from 'react-helmet-async';


function PaginaIndividual() {
    const { id, type } = useParams(); // obtiene el id del elemento clicleable
    const [singlePost, setSinglePost] = useState(null);
    const mov1Ref = useRef(null);
    const mov2Ref = useRef(null);

    useEffect(() => {
        async function fetchSinglePost() {
            try {
                //const response = await fetch(`http://headless.test/wp-json/wp/v2/${type}/${id}`);
                // manejo simple de error
                if (!response.ok) {
                    console.error('Error en la respuesta de la API');
                    return <p>Cargando...</p>;
                }
                const data = await response.json();
                //console.log(data);
                setSinglePost(data);            
            } catch (err) {
                console.error("Error al obtener la página:", err);
            }
        }
        fetchSinglePost(); 

    }, [id]);

        // useEffect separado para la animación (se ejecuta cuando singlePost cambia y el ref está disponible)
    useEffect(() => {
        if (mov1Ref.current) { // Verifica que el elemento exista
            gsap.fromTo(mov1Ref.current, {
                x:-300
            },
                {
                x: 250,
                borderRadius: '50%',
                duration: 2,
                delay: 1,
                ease: 'back.out'
            });
        }

        if (mov2Ref.current) { // Verifica que el elemento exista
            gsap.fromTo(mov2Ref.current, {
                x:window.innerWidth + 200
            },
                {
                x: window.innerWidth - 370,
                borderRadius: '50%',
                duration: 2,
                delay: 1,
                ease: 'back.out'
            });
        }
        // Cleanup para detener animaciones si el componente se desmonta
        return () => {
            if (mov1Ref.current || mov2Ref.current) {
                gsap.killTweensOf(mov1Ref.current, mov2Ref.current);
            }
        };
    }, [singlePost]); // Dependencia en singlePost para que se ejecute después de que se setee


    //check if singlePost exists before render
    if (!singlePost) {
        return <div>Cargando ...</div>;
    }
  return (
    <>    
        <Helmet>
            <title>{singlePost.yoast_head_json.title}</title>
            <meta name="description" content={singlePost.yoast_head_json.og_title} />
            <meta property="og:title" content={singlePost.yoast_head_json.og_description} />
            <meta property="og:url" content={singlePost.yoast_head_json.og_url} />
        </Helmet>
        <article className='my-40 relative'>
            <div className='mov1 z-0 top-5 absolute' ref={mov1Ref}></div>
            <main className='mx-auto w-7/12 p-10 border-2 border-amber-950 z-10 relative'>
                <h1>{singlePost.title.rendered}</h1>
                <div dangerouslySetInnerHTML={{__html: singlePost.content.rendered}} className='mt-5' />
                {singlePost.type === "personal" && (
                    <>
                    <div>{singlePost.acf.campo_1}</div>
                    <div>{singlePost.acf.campo2}</div>
                    <div>{singlePost.acf.campo3}</div>
                    </>
                )}
                <img src={singlePost.yoast_head_json.og_image[0].url} alt={singlePost.title.rendered} />
            </main>
            <div className='mov1 z-0 bottom-10 absolute' ref={mov2Ref}></div>
        </article>
    </>
  );
}

export default PaginaIndividual