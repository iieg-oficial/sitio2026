import { Link } from 'react-router'

import NavbarFooter from '@components/menu/NavbarFooter'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <>
            <footer className="bg-primary text-white py-12 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8">
                        <div className='mb-8 md:mb-0 md:col-span-2 xl:col-span-1'>
                            <div>
                                <img
                                    src="/ico_iieg_logo.svg"
                                    alt="IIEG Logo"
                                    className="mb-12 mx-auto md:ml-0"
                                />
                            </div>
                            <div className='flex justify-center md:justify-start gap-4'>
                                <a href="" target="_blank" className='rounded-full bg-tertiary hover:bg-medio rsicon'>
                                    <span class="line-md--instagram"></span>
                                </a>

                                <a href="" target="_blank" className='rounded-full bg-tertiary hover:bg-medio rsicon'>
                                    <span class="ri--facebook-fill"></span>
                                </a>
                                
                                <a href="" target="_blank" className='rounded-full bg-tertiary hover:bg-medio rsicon'>
                                    <span class="pajamas--twitter"></span>
                                </a>
                                
                                <a href="" target="_blank" className='rounded-full bg-tertiary hover:bg-medio rsicon'>
                                    <span class="ri--linkedin-fill"></span>
                                </a>
                                
                                <a href="" target="_blank" className='rounded-full bg-tertiary hover:bg-medio rsicon'>
                                    <span class="mdi--youtube"></span>
                                </a>
                            </div>                            
                        </div>

                        <div className='mb-8 md:mb-0 md:col-span-2 xl:col-span-1'>
                            <div>
                                <a href='' target='_blank'>
                                    <img src="/ico_gobjal_logo.svg" alt="Link al sitio del gobierno de jalisco" className="mx-auto mb-12 md:mr-0 xl:mx-auto" />
                                </a>
                            </div>
                            <div>
                                <a href='' target='_blank'>
                                    <img src="/img_transparencia.png" alt="Link a la plataforma de transparencia" className="mx-auto mt-4 md:mr-0 xl:mx-auto" />
                                </a>
                            </div>
                        </div>

                        <div className='md:col-span-2 xl:col-span-1'>
                           <ul style={{ listStyleType: 'none' }}>
                            <li className='mb-8'>
                                <a href='/' className='linkfooter'>Inicio</a>
                            </li>
                            <li className='mb-8'>
                                <a href='/conocenos' className='linkfooter'>Conócenos</a>
                            </li>
                            <li className='mb-8'>
                                <a href='/sistemas-de-informacion' className='linkfooter'>Sistemas de Información</a>
                            </li>
                            <li className='mb-8'>
                                <a href='/datos-abiertos' className='linkfooter'>Datos Abiertos y documentación</a>
                            </li>
                           </ul>
                        </div>

                        <div className='md:col-span-2 xl:col-span-1'>
                           <ul style={{ listStyleType: 'none' }}>
                            <li className='mb-8'>
                                <a href='' target='_blank' className='linkfooter'>Licitaciones</a>
                            </li>
                            <li className='mb-8'>
                                <a href='' target='_blank' className='linkfooter'>Transparencia</a>
                            </li>
                            <li className='mb-8'>
                                <a href='' target='_blank' className='linkfooter'>Sitio anterior</a>
                            </li>
                            <li className='mb-8'>
                                <a href='/aviso-de-privacidad' className='linkfooter'>Aviso de privacidad</a>
                            </li>
                           </ul>
                        </div>
                    </div>

                </div>
            </footer>
        </>
    )
}

export default Footer
