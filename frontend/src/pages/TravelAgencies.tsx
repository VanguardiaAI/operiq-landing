import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const TravelAgencies = () => {
  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleReservarClick = () => {
    navigate('/login-companies');
  };

  // Toggle para abrir/cerrar FAQs
  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Pueden las agencias de viajes ganar comisiones a través de Privyde?",
      answer: (
        <p className="text-gray-600">
          Sí, las agencias de viajes pueden ganar comisiones por viajes reservados a través de su agencia con Privyde. Se puede ganar más comisiones. Hable con nuestro equipo para obtener más información.
        </p>
      ),
    },
    {
      question: "¿Qué información recibe mi cliente?",
      answer: (
        <p className="text-gray-600">
          Las confirmaciones de reserva solo se envían al titular de la reserva y nunca al cliente. Su cliente no recibirá ninguna información sobre el precio. Las únicas ocasiones en que contactamos con el pasajero son: Cuando el chófer está de camino: el pasajero recibe un correo electrónico y un mensaje SMS con los datos de contacto del chófer. Cuando el chófer ha llegado: el pasajero recibe otro correo electrónico y un mensaje SMS confirmando la llegada del chófer. Si necesitamos aclarar detalles: por ejemplo, podemos llamar al número de móvil del pasajero si nuestro chófer no puede localizarlo.
        </p>
      ),
    },
    {
      question: "¿Qué vehículos usa Privyde?",
      answer: (
        <p className="text-gray-600">
          Privyde ofrece varios servicios según la lista de vehículos aprobados de la ciudad. Estos pueden incluir: • Business Class: Mercedes-Benz E-Class, BMW Serie 5, Cadillac XTS o similar • Business Van/SUV: Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac Escalade, Toyota Alphard o similar • First Class: Mercedes-Benz S-Class, BMW Serie 7, Audi A8 o similar • Electric Class (disponible en ciudades seleccionadas): Jaguar I-PACE, Tesla Model S, Tesla Model X o similar • Sprinter Class (disponible en ciudades seleccionadas): Mercedes-Benz Sprinter o similar Otros tipos de vehículos pueden ser aprobados para diferentes ciudades si cumplen con el estándar de Privyde.
        </p>
      ),
    },
    {
      question: "¿Con cuánta antelación puedo reservar un viaje?",
      answer: (
        <p className="text-gray-600">
          Puede reservar viajes con meses de antelación o tan pronto como 60 minutos antes de que lo necesite. Recomendamos reservar con la mayor antelación posible. Privyde cuenta con la política de cancelación más flexible del sector, ya que los pasajeros pueden cancelar viajes de forma gratuita hasta una hora antes de la hora de recogida. También puede realizar cambios en su reserva hasta 60 minutos antes de la hora de recogida.
        </p>
      ),
    },
    {
      question: "¿Cómo contribuye Privyde a las opciones de viaje sostenibles?",
      answer: (
        <p className="text-gray-600">
          Privyde contribuye a los viajes sostenibles al ofrecer opciones de vehículos eléctricos, incorporar vehículos eléctricos en nuestra oferta de Business Class en muchas más ciudades y trabajar activamente para compensar su huella de carbono.
        </p>
      ),
    },
    {
      question: "¿Cómo son los precios de Privyde frente a los proveedores tradicionales?",
      answer: (
        <p className="text-gray-600">
          El modelo de precios competitivo de Privyde es más transparente en comparación con los proveedores tradicionales, lo que garantiza una buena relación calidad-precio sin comprometer la calidad del servicio.
        </p>
      ),
    },
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
          src="/images/couple-approaching-car.jpg" 
          alt="Una pareja con equipaje ondulante sonríe mientras caminan hacia un Mercedes-Benz Eqs" 
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
              Servicios globales de chófer para 
              <motion.span 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              > agencias de viajes</motion.span>
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
          {/* Sección de introducción */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Mejore sus servicios de agencia de viajes
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Proporcione a sus clientes una experiencia de viaje excepcional con nuestro servicio de chófer global. Desde traslados al aeropuerto hasta viajes de negocios, ofrecemos un servicio de alta calidad que complementa su oferta de servicios de viaje.
                </p>
                <motion.button 
                  className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReservarClick}
                >
                  Reservar ahora
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img 
                  src="/images/business-eqs-phone.jpg" 
                  alt="Invitado en asiento trasero de EQS hablando por teléfono con resplandor solar" 
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Awards Section */}
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Calidad galardonada
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <p className="text-center text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
              Ganaron el premio a la "Mejor compañía global de servicios de chófer" en los Premios Magellan y el premio a la "Mejor en la carretera" en los Premios Travolution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/award-lux-leaders.png" 
                  alt="B2B Icon - Lux Leaders in Luxury" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">Lux Leaders in Luxury</p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/award-business-travel.png" 
                  alt="B2B Award 2024 - Business Travel Awards Europe 2024" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">Business Travel Awards Europe 2024</p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/award-world-travel.png" 
                  alt="B2B Award 2024 - World Travel Awards 2024" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">World Travel Awards 2024</p>
              </motion.div>
            </div>
          </motion.section>
          
          {/* Features Grid Section */}
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
                <img 
                  src="/images/business-conference-travel.jpg" 
                  alt="B4B Conference/Event Travel Nature Man and Woman" 
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Facilidad de reserva</h3>
                <p className="text-gray-600 leading-relaxed">
                  Priorice el deber de cuidado de sus clientes con nuestros chóferes rigurosamente capacitados y protocolos de higiene.
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
                <img 
                  src="/images/female-chauffeur-mercedes-nyc.jpg" 
                  alt="B4B Hero Female Chauffeur and Mercedes by New York Skyline" 
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Global pero local</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ofrezca un servicio coherente a nivel mundial con un toque local que garantice comodidad y conveniencia a través de las fronteras.
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
                <img 
                  src="/images/cars-sunset.jpg" 
                  alt="B4B - Cars Tesla and Mercedes sedan and van next to each other at sunset" 
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajar con compensación de carbono</h3>
                <p className="text-gray-600 leading-relaxed">
                  Avances hacia el turismo sostenible al proporcionar la opción de viaje ecológica de los vehículos eléctricos en ciudades seleccionadas.
                </p>
              </motion.div>
            </div>
          </motion.section>
          
          {/* Transform Clients' Travel Section */}
          <motion.section 
            className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl text-center shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Transforme los viajes de sus clientes</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Asóciese con Privyde y mejore las ofertas de viajes de su agencia.
            </p>
            <motion.button 
              className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReservarClick}
            >
              Reservar ahora
            </motion.button>
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
              Preguntas frecuentes
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
          
          {/* Final Photo Section */}
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img 
              src="/images/chauffeur-loading-luggage.jpg" 
              alt="Un chófer carga el equipaje en la parte trasera de un vehículo, frente a dos emblemáticas casas urbanas de piedra marrón" 
              className="w-full h-auto rounded-xl shadow-lg object-cover"
            />
            <div className="text-center mt-4">
              <button className="text-gray-600 font-medium flex items-center mx-auto hover:text-gray-800 transition-colors">
                Desplácese hasta la parte superior de la página
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </motion.section>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TravelAgencies; 