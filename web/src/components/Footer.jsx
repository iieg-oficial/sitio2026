import { Link } from 'react-router'

import NavbarFooter from '@components/menu/NavbarFooter'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <>
            <footer className="bg-primary text-white py-8 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div>
                                <img
                                    src="/ico_iieg_logo.svg"
                                    alt="IIEG Logo"
                                    className="w-16 h-16 mb-4"
                                />
                            </div>
                            <div>
                                <span class="entypo-social--facebook-with-circle"></span>
                                <span class="mage--instagram-circle"></span>
                                <span class="fa6-brands--square-x-twitter"></span>
                                <span class="entypo-social--linkedin-with-circle"></span>
                                <span class="entypo-social--youtube-with-circle"></span>
                            </div>                            
                        </div>

                        <div>
                            <div>
                                <a href='' target='_blank'>
                                    <image src="/ico_gobjal_logo.svg" alt="Link al sitio del gobierno de jalisco" className="w-32 h-32 mb-4" />
                                </a>
                            </div>
                            <div>
                                <a href='' target='_blank'>
                                    <image src="/img_transparencia.png" alt="Link a la plataforma de transparencia" className="w-32 h-32 mb-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                           <ul>
                            <li>
                                <a href='/' className='linkfooter'>Inicio</a>
                            </li>
                            <li>
                                <a href='/conocenos' className='linkfooter'>Conócenos</a>
                            </li>
                            <li>
                                <a href='/sistemas-de-informacion' className='linkfooter'>Sistemas de Información</a>
                            </li>
                            <li>
                                <a href='/datos-abiertos' className='linkfooter'>Datos Abiertos y documentación</a>
                            </li>
                           </ul>
                        </div>

                        <div>
                           <ul>
                            <li>
                                <a href='' target='_blank' className='linkfooter'>Licitaciones</a>
                            </li>
                            <li>
                                <a href='' target='_blank' className='linkfooter'>Transparencia</a>
                            </li>
                            <li>
                                <a href='' target='_blank' className='linkfooter'>Sitio anterior</a>
                            </li>
                            <li>
                                <a href='/aviso-de-privacidad' className='linkfooter'>Aviso de privacidad</a>
                            </li>
                           </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {currentYear} IIEG. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer
