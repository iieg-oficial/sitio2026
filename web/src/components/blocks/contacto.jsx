export default function Contacto() {
    return (
        <>
            <div>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.6363330579716!2d-103.44923245953379!3d20.684369299596163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428aecbb4902a4f%3A0xb1a0d25cb7c814cf!2sInstituto%20de%20Informaci%C3%B3n%20Estad%C3%ADstica%20y%20Geogr%C3%A1fica%20IIEG!5e0!3m2!1ses-419!2smx!4v1774984803790!5m2!1ses-419!2smx" width="600" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div>
                <h2>¿Tienes dudas? contáctanos</h2>
                <form action="">
                    <input type="text" placeholder="Nombre" />
                    <input type="email" placeholder="Correo" />
                    <textarea name="" id="" cols="30" rows="10" placeholder="Mensaje"></textarea>
                    <button type="submit">Enviar</button>
                </form>
            </div>
        </>
    )
}