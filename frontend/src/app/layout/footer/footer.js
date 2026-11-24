import { useState } from "react";
import './footer.css';

function Footer() {
    const [email, setEmail] = useState("");
    const handleConfirm = () => {
    // Redirige al cliente de correo con el destinatario fijo
    window.location.href = `mailto:paolo.avalos@ucsp.edu.pe?subject=Suscripción&body=El usuario ingresó: ${email}`;
  };
  return (
    <footer className="footer">
        <span style={{color: 'white', fontFamily:  "Brush Script MT", fontSize:"30px"}}>Inspirame con todo lo ultimo</span>
        <div className = 'Email'>
            <input type='text' placeholder='*E-mail' value={email} 
                onChange={(e) => setEmail(e.target.value)} />
             <button onClick={handleConfirm}>Confirmar</button>
        </div>
        <div className ="cuadro">
            <div className ="cuadroFila"> 
                <span style={{color: 'white', marginLeft:'40px'}}>Servicios al cliente</span>
                <ul>
                    <li><button type="button" className="dorado enlace-footer">Contacto</button></li>
                    <li><button type="button" className="dorado enlace-footer">Entrega y retorno</button></li>
                    <li><button type="button" className="dorado enlace-footer">FQA</button></li>
                </ul>
            </div>
            <div className ="cuadroFila"> 
                <span style={{color: 'white', marginLeft:'40px'}} >Nuestro Equipo</span>
                <ul>
                    <li><button type="button" className="dorado enlace-footer">Rodrigo Ccallo</button></li>
                    <li><button type="button" className="dorado enlace-footer">Fernanda Cruz</button></li>
                    <li><button type="button" className="dorado enlace-footer">Paolo Avalos</button></li>
                    <li><button type="button" className="dorado enlace-footer">Sabrina Flores</button></li>
                </ul>
            </div>
            <div className ="cuadroFila"> 
                <span style={{color: 'white', marginLeft:'40px'}}>Terminos legales</span>
                <ul>
                    <li><button type="button" className="dorado enlace-footer">Politicas</button></li>
                    <li><button type="button" className="dorado enlace-footer">No vendas tu informacion</button></li>
                </ul>
            </div>
        </div>
        <div className = "abajo">
                <div className="Sigue">
                    <span className="gray">Síguenos en: </span>
                    <button type="button" className="dorado enlace-footer">Instagram</button>
                    <button type="button" className="dorado enlace-footer">Twitter</button>
                    <button type="button" className="dorado enlace-footer">YouTube</button>
                </div>
                <div className="Tienda">
                    <span> LA TIENDA DEL BICHO</span>
                </div>
                <div className = 'Pais'>
                    <span className="gray">País / Región:</span>
                    <span className="blue">Perú (Spanish)</span>
                </div>
            </div>
    </footer>
  );
}

export default Footer;
