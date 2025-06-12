import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Drivers = () => {
  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Toggle para abrir/cerrar FAQs
  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleReservarClick = () => {
    navigate('/login-companies');
  };

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Puede cualquiera convertirse en socio de Privyde?",
      answer: (
        <>
          <p className="text-gray-600 mb-4">
            Solo nos asociamos con empresas de chóferes aseguradas ya existentes. Para hacer una solicitud, debe:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2 text-left">
            <li className="text-gray-600 text-left">Cumplir los nuestros requisitos para los vehículos</li>
            <li className="text-gray-600 text-left">Enviar la documentación de su negocio, un vehículo y de usted mismo o de uno de los chóferes de su empresa</li>
          </ul>
          <p className="text-gray-600">
            Una vez su cuenta esté activa, puede agregar tantos vehículos y chóferes como quiera. Puede consultar los requisitos de vehículo y documentación de su ciudad y comenzar su solicitud de socio aquí.
          </p>
        </>
      )},
    {
      question: "¿Cuántos viajes puedo hacer al mes con Privyde?",
      answer: (
        <p className="text-gray-600">
          La cantidad de viajes que realice depende totalmente de usted. Puede aceptar tantos viajes como su capacidad permita. El volumen de viajes ofrecido depende de la demanda regional y estacional.
        </p>
      )},
    {
      question: "¿Cómo recibo los pagos?",
      answer: (
        <>
          <p className="text-gray-600">
            Al principio de cada mes, le enviaremos una factura con los detalles de todos los viajes realizados el mes anterior. Su factura también incluirá cualquier compensación adicional por extras, como el tiempo de espera o los cambios de ruta.
          </p>
          <p className="text-gray-600 mt-3">
            Los pagos se realizan mediante transferencia bancaria y suelen aparecer en su cuenta antes del 17 de cada mes.
          </p>
        </>
      )},
    {
      question: "¿Qué vehículos puedo usar para trabajar con Privyde?",
      answer: (
        <p className="text-gray-600">
          Solo pueden usarse determinados vehículos para los viajes de Privyde. Los requisitos del vehículo pueden variar según la ciudad en la que trabaje, y puede encontrar la lista de vehículos que necesita aquí. No tiene más que seleccionar el país y la ciudad sobre los que desea obtener más información.
        </p>
      )},
    {
      question: "¿Cómo puedo asociarme con Blackane?",
      answer: (
        <>
          <p className="text-gray-600">
            Nuestro proceso de solicitud de asociación nos ayuda a encontrar los mejores servicios de chófer profesional disponibles. Solo trabajamos con empresas de chófer aseguradas y con licencia, y nuestros requisitos de documentación se basan en las normativas locales, por lo que no debería necesitar ningún papeleo adicional para comenzar.
          </p>
          <p className="text-gray-600 mt-3">
            Una vez aprobada su documentación, el último paso del proceso de registro consistirá en participar en una sesión de seminario web en grupo en línea. Esta entrevista nos brinda la oportunidad de conocernos y hacer preguntas sobre nuestras expectativas mutuas respecto a nuestra nueva asociación. Después del seminario web, ¡estará listo para comenzar!
          </p>
          <p className="text-gray-600 mt-3">
            Puede comenzar su solicitud de asociación aquí.
          </p>
        </>
      )},
    {
      question: "¿Funciona Privyde con vehículos eléctricos?",
      answer: (
        <>
          <p className="text-gray-600">
            ¡Sí! En algunos mercados, los clientes pueden solicitar vehículos eléctricos específicamente y, en muchos otros, pasan a formar parte de nuestra flota regular. Además, nuestra flota en Dubai es ahora completamente eléctrica.
          </p>
          <p className="text-gray-600 mt-3">
            Animamos a invertir en vehículos eléctricos, no solo porque es mejor para su huella de carbono, sino porque la demanda de los clientes está aumentando, junto con los precios de los combustibles fósiles.
          </p>
          <p className="text-gray-600 mt-3">
            Solo se pueden utilizar vehículos totalmente eléctricos para realizar viajes con vehículos eléctricos. Los modelos eléctricos aceptados pueden variar según la ciudad en la que trabaje; puede encontrar la lista de vehículos que necesita aquí.
          </p>
        </>
      )},
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* SECCIÓN HERO - COMPLETAMENTE INDEPENDIENTE */}
      <section className="relative w-full bg-gray-900">
        {/* Overlay para mejorar visibilidad - AJUSTADO PARA HACERLO MÁS LIGERO */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        {/* Imagen de fondo */}
        <img 
          src="/images/airport.jpeg" 
          alt="Chófer esperando a un cliente" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        
        {/* Contenido del hero con animaciones */}
        <div className="relative z-20 container mx-auto px-6 py-20 md:py-32">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Conviértase en socio de 
              <motion.span 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              > servicios de chófer</motion.span>
            </h1>
            
            <motion.button 
              className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mt-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReservarClick}
            >
              Reservar ahora
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN DE CONTENIDO PRINCIPAL - COMPLETAMENTE SEPARADA DEL HERO */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Sección de introducción con testimonial */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Haga crecer su negocio con Privyde
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              La aplicación y el portal web de Privyde conectan a los socios de servicio chófer con licencia y seguro con una base de clientes global de viajeros de negocios y ocio. Puede completar algún hueco de su horario o incluso podríamos convertirnos en su principal fuente de viajes. Nuestros precios competitivos normalmente se ajustan a las tarifas del mercado local, y nuestro compromiso inquebrantable con la calidad nos permite ofrecer tarifas justas a los chóferes, al tiempo que garantiza un servicio excepcional a los pasajeros.
            </p>
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl mb-10 max-w-4xl mx-auto shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <blockquote className="italic text-xl text-gray-700 mb-4 relative">
                <span className="text-5xl text-gray-400 absolute -top-6 -left-2">"</span>
                Privyde is 60% of my revenue. I've grown from 2 to 20 chauffeurs and have 10 vehicles from working with them.
                <span className="text-5xl text-gray-400 absolute -bottom-10 -right-2">"</span>
              </blockquote>
              <p className="text-right font-medium mt-2 text-gray-800">Angel T., Privyde chauffeur, Madrid</p>
            </motion.div>
          </motion.div>

          {/* Main Content - AHORA COMPLETAMENTE SEPARADO DEL HERO */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
            {/* Benefits Grid with Improved Design */}
            <motion.section 
              className="mb-32"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Pagos fiables</h3>
                  <p className="text-gray-600 leading-relaxed">
                    La cantidad que se muestra en cada oferta es el mínimo que se transferirá a su cuenta; no deducimos más tarifas ni impuestos. Los pagos mensuales de sus viajes completados se depositarán directamente en su cuenta bancaria.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Control completo de horarios</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Seleccione sus viajes a través de nuestra subasta inversa. Cree su propio horario y simplemente realice los viajes que mejor se adapten a su disponibilidad, ubicación y tipo de vehículo. ¡Ofrecemos reservas por horas, viajes de ciudad a ciudad y mucho más!
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Únase a un equipo internacional</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Como miembro del equipo de Privyde, podrá decir que forma parte de un servicio internacional, ya que organizamos viajes para nuestros socios y sus huéspedes en más de 50 países.
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* Requirements Section with Enhanced Design */}
            <motion.section 
              className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src="/images/limo-equipaje.png" 
                    alt="Chófer poniendo equipaje en el maletero" 
                    className="w-full h-auto rounded-xl shadow-lg object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                    Requisitos
                    <span className="block w-16 h-1 bg-black mt-4"></span>
                  </h2>
                  <ul className="space-y-6 mb-8">
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-left">Poseer un registro de empresa válido, licencias y seguros para todos los chóferes y vehículos.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-left">Mantener los vehículos limpios, sin daños, libres de humo y en pleno cumplimiento de las regulaciones locales.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-left">Mantenerse al día con las nuevas normas y políticas y garantizar una calidad excelente.</span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mb-8 italic">Los detalles varían según la ubicación, consulte los requisitos específicos de su área:</p>
                  <motion.button 
                    className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Ver requisitos locales
                  </motion.button>
                </motion.div>
              </div>
            </motion.section>

            {/* FAQ Section con animaciones */}
            <motion.section 
              className="mb-32"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
                Preguntas más frecuentes
                <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
              </h2>
              
              <div className="space-y-4 max-w-4xl mx-auto">
                {faqData.map((faq, index) => (
                  <motion.div 
                    key={index} 
                    className={`bg-white rounded-xl border ${openFaqIndex === index ? 'border-gray-200 shadow-md' : 'border-gray-200'} overflow-hidden transition-all duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <button
                      className="flex justify-between items-center w-full p-6 text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <h3 className={`text-xl font-semibold ${openFaqIndex === index ? 'text-gray-600' : 'text-gray-900'}`}>{faq.question}</h3>
                      <div className={`${openFaqIndex === index ? 'text-black bg-gray-100' : 'text-gray-400 bg-gray-50'} rounded-full p-1 transition-colors duration-300`}>
                        {openFaqIndex === index ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>
                    <div 
                      className={`transition-all duration-500 ease-in-out ${
                        openFaqIndex === index 
                          ? 'max-h-[1000px] opacity-100' 
                          : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="border-t border-gray-200 pt-4 text-left">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Help Section with Enhanced Design */}
            <motion.section 
              className="mb-16 bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-lg text-white"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <img 
                    src="/images/ejecutivo-tablet.png" 
                    alt="Chófer sonriendo" 
                    className="w-full h-auto rounded-xl shadow-lg object-cover border-4 border-white"
                  />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold mb-6 relative text-white">
                    ¿Todavía tiene alguna pregunta?
                    <span className="block w-16 h-1 text-black mt-4"></span>
                  </h2>
                  <p className="text-gray-200 mb-8 leading-relaxed">
                    Visite nuestro Centro de ayuda para socios para consultar nuestras preguntas frecuentes detalladas o póngase en contacto directamente con nuestro equipo de soporte.
                  </p>
                  <motion.button 
                    className="bg-white text-gray-900 font-medium h-12 px-8 py-3 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Más información
                  </motion.button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Drivers; 