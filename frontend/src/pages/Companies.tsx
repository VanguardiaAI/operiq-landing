import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Companies = () => {
  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  // Estado para el formulario de contacto
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phonePrefix: "+34",
    phoneNumber: "",
    country: "España",
    location: "",
    companyName: "",
    companySize: "1-10 empleados",
    hearAbout: "Búsqueda en Google",
    message: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Actualiza el estado del formulario cuando cambian los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReservarClick = () => {
    navigate('/register-companies');
  };

  const handleContactSubmit = () => {
    // Guardar los datos del formulario en localStorage para usarlos en la página de registro
    localStorage.setItem('companyContactData', JSON.stringify(formData));
    // Redirigir a la página de registro de empresas
    navigate('/register-companies');
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
      question: "¿Con cuánta antelación puedo reservar un viaje?",
      answer: (
        <p className="text-gray-600">
          Puede reservar viajes con meses de antelación o tan pronto como 60 minutos antes de que lo necesite. Recomendamos reservar con la mayor antelación posible. Privyde cuenta con la política de cancelación más flexible del sector, ya que los pasajeros pueden cancelar viajes de forma gratuita hasta una hora antes de la hora de recogida. También puede realizar cambios en su reserva hasta 60 minutos antes de la hora de recogida.
        </p>
      )},
    {
      question: "¿Qué vehículos utiliza Privyde?",
      answer: (
        <p className="text-gray-600">
          Privyde ofrece cuatro tipos de vehículos en la mayoría de las ubicaciones: Business Class, Electric Class, First Class y Business Van/SUV.
          <br /><br />
          Cada una de estas categorías contiene una selección de modelos comparables de primera línea, que puede ver en el proceso de reserva o en nuestro Centro de ayuda.
          <br /><br />
          Tenga en cuenta que las imágenes que se muestran al reservar son meramente ilustrativas. No podemos garantizar ninguna solicitud de modelos o colores específicos de vehículos, ya que el vehículo a utilizar está sujeto a disponibilidad.
        </p>
      )},
    {
      question: "Which languages do the chauffeurs speak?",
      answer: (
        <p className="text-gray-600">
          All of Privyde's chauffeurs speak English and the language of the country they operate in.
        </p>
      )},
    {
      question: "Which payment options are available?",
      answer: (
        <p className="text-gray-600">
          Privyde accepts Visa, Maestro, Mastercard and American Express cards. It is not possible to pay for the ride in cash. You can also pay via Paypal in the apps and Apple Pay if you are an iOS user. Paypal and Apple Pay are not currently available on the website.
          <br /><br />
          Business accounts can also request to receive monthly invoices, instead of paying on a ride-by-ride basis.
          <br /><br />
          Please keep in mind that all payment for your ride is set up in advance; your chauffeur is not able to accept payment on location.
          <br /><br />
          See the latest information here.
        </p>
      )},
    {
      question: "¿Cómo contribuye Privyde a las opciones de viaje sostenibles?",
      answer: (
        <p className="text-gray-600">
          Privyde contribuye a los viajes sostenibles al ofrecer opciones de vehículos eléctricos, incorporar vehículos eléctricos en nuestra oferta de Business Class en muchas más ciudades y trabajar activamente para compensar su huella de carbono.
        </p>
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
          src="/images/woman-in-a-suit-walking.jpeg" 
          alt="Invitada de Privyde caminando hacia un Mercedes-Benz mientras el chófer le abre la puerta" 
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
              Transporte terrestre para 
              <motion.span 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              > ejecutivos de empresas</motion.span> en todo el mundo
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
              Servicios de chófer para empresas para cada ocasión
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
          </motion.div>

          {/* Services Grid Section */}
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/woman-client.jpeg" 
                  alt="Empresario en asiento trasero con chófer femenina cerrando la puerta" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajes de negocios y reuniones</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Asegúrese de que las llegadas sean puntuales y las salidas fluidas, y fomente unas relaciones profesionales sólidas en todo momento.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/security.png" 
                  alt="Invitado en asiento trasero de EQS hablando por teléfono con resplandor solar" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajes de ciudad a ciudad</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Trabaje sin esfuerzo mientras viaja de ciudad a ciudad. Viaje sin problemas entre Londres y Manchester, París y Lyon, y mucho más.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/limo-airport.png" 
                  alt="Pareja con equipaje acercándose al coche, vista desde el asiento trasero de EQS" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Traslados al aeropuerto en todo el mundo</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Disfrute de recogidas/destinos en el aeropuerto sin contratiempos, para que sus viajes de empresa sean más cómodos.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <img 
                  src="/images/ejecutivo-tablet.png" 
                  alt="Chófer cerrando la puerta, invitado en asiento trasero, vista desde arriba" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajes para clientes y socios</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Impresione a clientes y socios con un servicio de chófer excepcional al mejorar su experiencia de viaje.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Testimonial Section */}
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Pruebe nuestro servicio galardonado
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl mb-10 max-w-4xl mx-auto shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md">
              <blockquote className="italic text-xl text-gray-700 mb-4 relative">
                <span className="text-5xl text-gray-400 absolute -top-6 -left-2">"</span>
                I know that I can rely on Privyde's high quality standards worldwide. The customer is the main focus at Privyde, which makes me feel taken care of.
                <span className="text-5xl text-gray-400 absolute -bottom-10 -right-2">"</span>
              </blockquote>
              <p className="text-right font-medium mt-2 text-gray-800">Tom Grover, European VSP, Smith & Nephew</p>
            </div>
          </motion.section>

          {/* Chauffeur Network Section */}
          <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/images/corporative.png" 
                  alt="Un chofer en un traje frente a su Mercedes-Benz con el horizonte de la ciudad" 
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                  Chóferes con un nuevo concepto de fiabilidad
                  <span className="block w-16 h-1 bg-black mt-4"></span>
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Nuestra red global de chóferes con licencia y seguro local garantiza una experiencia de transporte perfecta para los viajes de empresa.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Disponibles en más de 50 países</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Chóferes cualificados de habla inglesa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Seguimiento y notificaciones en tiempo real</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Flota moderna para un viaje profesional y productivo</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* No Invoices Needed Section */}
          <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                  Sin necesidad de facturas
                  <span className="block w-16 h-1 bg-black mt-4"></span>
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Simplifique la gestión de sus facturas. Nuestro sistema de facturación automatizado agiliza el proceso, mientras que el servicio de asistencia técnica de la empresa está a su disposición para ayudarle.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Plataforma todo en uno para reservas sin contratiempos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Facturación automatizada para una fácil gestión de facturas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Asistencia y gestores de cuentas a su disposición</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-left">Disfrute de descuentos para empresas e inicio de sesión para más de 500 viajeros</span>
                  </li>
                </ul>
                <motion.button 
                  className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReservarClick}
                >
                  Reservar ahora
                </motion.button>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/images/woman-client.jpeg" 
                  alt="Mujer saliendo del coche con chófer B4B" 
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>
            </div>
          </section>

          {/* Booking for Executives Section */}
          <section className="mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/images/woman-client.jpeg" 
                  alt="Una mujer elegante sentada en el asiento trasero de su viaje con chófer con bolsas de compras en el asiento a su lado" 
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                  Booking for your executives
                  <span className="block w-16 h-1 bg-black mt-4"></span>
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  If you're a PA/EA or corporate booker that wants to manage your executive travel with ease using a booking platform designed for your fast-paced world, then you're in luck. We've dedicated a page to you answer all your queries.
                </p>
                <motion.button 
                  className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReservarClick}
                >
                  Reservar ahora
                </motion.button>
              </div>
            </div>
          </section>

          {/* By the Hour Section */}
          <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                  By the hour
                  <span className="block w-16 h-1 bg-black mt-4"></span>
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  This service helps businesses globally. No more waiting for different taxis at different locations, taking crowded public transport, or finding parking for your rental car. Maximize your productivity with our by-the-hour service.
                </p>
                <motion.button 
                  className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReservarClick}
                >
                  Reservar ahora
                </motion.button>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/images/limo-elegant.png" 
                  alt="Un chófer de Privyde sonríe y ajusta un control mientras conduce un Mercedes EQS" 
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>
            </div>
          </section>

          {/* Awards Section */}
          <section className="mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Award-winning chauffeur service
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300">
                <img 
                  src="/images/limo-leds.png" 
                  alt="B2B Icon - Lux Leaders in Luxury" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">Lux Leaders in Luxury</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300">
                <img 
                  src="/images/award-business-travel.png" 
                  alt="B2B Award 2024 - Business Travel Awards Europe 2024" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">Business Travel Awards Europe 2024</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300">
                <img 
                  src="/images/award-world-travel.png" 
                  alt="B2B Award 2024 - World Travel Awards 2024" 
                  className="h-20 w-auto mb-4"
                />
                <p className="text-lg font-medium text-center text-gray-800">World Travel Awards 2024</p>
              </div>
            </div>
          </section>

          {/* Sustainability Initiatives Section */}
          <section className="mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Iniciativas de sostenibilidad
              <span className="block w-24 h-1 bg-gray-600 mx-auto mt-4"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
                <img 
                  src="/images/chauffeur-tesla.jpg" 
                  alt="Chófer masculino ajustándose los puños frente a Tesla" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Electric Class</h3>
                    <span className="ml-2 bg-gray-200 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">NUEVO</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Elija nuestra nueva Electric Class para reservar viajes con chofer en vehículos eléctricos de alto nivel como el Jaguar I-PACE, Tesla Model S y Tesla Model X.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Más información
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
                <img 
                  src="/images/ev-charging.jpg" 
                  alt="Primer plano de carga de vehículo eléctrico" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">La nueva normalidad</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    De la forma en que lo vemos, los vehículos eléctricos se convertirán en el estándar y es por lo cual los vehículos eléctricos ya están incorporados a nuestra Business Class y First Class en muchas ciudades. Nuestro objetivo es seguir facilitando los desplazamientos sostenibles aumentando nuestra flota de vehículos eléctricos.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Más información
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
                <img 
                  src="/images/car-forest.jpg" 
                  alt="Coche circulando por un bosque, vista desde arriba" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">100% de compensación de carbono</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Sea cual sea la clase de vehículo que elija, compensamos automáticamente las emisiones con nuestro programa de compensación de carbono.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Más información
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Experimente nuestros beneficios para empresas
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Precios competitivos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Acceda a un servicio de primera calidad a precios basados en la distancia que son justos para usted y para nuestros chóferes.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Disponibilidad en todo el mundo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nuestro servicio de chófer en todo el mundo garantiza un viaje rápido y fiable.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Envío prioritario</h3>
                <p className="text-gray-600 leading-relaxed">
                  Optimice su experiencia con reservas prioritarias y seguimiento en tiempo real.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Reserva fácil</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reserva sencilla desde una misma página con confirmación inmediata y precios claros.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Asistencia para empresas</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nuestro equipo de asistencia multilingüe 24/7 garantiza que nuestros clientes empresarios estén cubiertos en todo momento.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Opción de vehículo eléctrico</h3>
                <p className="text-gray-600 leading-relaxed">
                  ¡Estamos orgullosos de ofrecer una variedad de vehículos eléctricos en ciudades seleccionadas para garantizar la compensación de nuestra huella de carbono!
                </p>
              </div>
            </div>
          </section>

          {/* Articles Section */}
          <section className="mb-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Check out our latest articles
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <img 
                  src="/images/ceo-eqs.jpg" 
                  alt="Jens Wohltorf CEO in EQS" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Funding Announcement</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Learn more about our biggest finance round yet.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Read the story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <img 
                  src="/images/chauffeur-silver.jpg" 
                  alt="Privyde's 2024 in Review" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Privyde's 2024 in Review</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Take a peek into how our 2024 went, and what we achieved.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Read the story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                <img 
                  src="/images/family-eqs-backseat.jpg" 
                  alt="Woman relaxing and child playing with tablet in back seat of EQS" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">Travel Trends Report</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Get an insight into how travel impacts productivity, backed with real data.
                  </p>
                  <button className="text-black font-medium hover:text-gray-600 transition-colors flex items-center">
                    Read the report
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 relative">
              Mejore sus viajes de negocios
              <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Experimente un servicio galardonado; solo tiene que enviar el formulario o un correo electrónico directamente a nuestro equipo corporativo: corporatesales@operiq.com.
            </p>
            
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <p className="text-sm text-gray-500 mb-6">
                Complete este formulario y en el siguiente paso creará su cuenta de empresa para acceder a tarifas corporativas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <select 
                    id="country" 
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option>España</option>
                    <option>Estados Unidos</option>
                    <option>México</option>
                    <option>Argentina</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phonePrefix" className="block text-sm font-medium text-gray-700 mb-1">Prefijo</label>
                  <select 
                    id="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option>+34</option>
                    <option>+1</option>
                    <option>+52</option>
                    <option>+54</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
                  <input 
                    type="tel" 
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                <input 
                  type="text" 
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">¿Dónde está ubicado?</label>
                <input 
                  type="text" 
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">Tamaño de la empresa</label>
                <select 
                  id="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option>1-10 empleados</option>
                  <option>11-50 empleados</option>
                  <option>51-200 empleados</option>
                  <option>201-500 empleados</option>
                  <option>501-1000 empleados</option>
                  <option>1000+ empleados</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="hearAbout" className="block text-sm font-medium text-gray-700 mb-1">¿Cómo se enteró de nosotros?</label>
                <select 
                  id="hearAbout"
                  value={formData.hearAbout}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option>Búsqueda en Google</option>
                  <option>Redes sociales</option>
                  <option>Recomendación</option>
                  <option>Publicidad</option>
                  <option>Otro</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">¿Cómo podemos ayudarle?</label>
                <textarea 
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <motion.button 
                className="select-button h-10 px-6 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-full md:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContactSubmit}
              >
                Continuar al registro
              </motion.button>
            </div>
          </section>

          {/* FAQ Section con animaciones */}
          <motion.section 
            className="mb-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
              Frequently asked questions
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

          {/* Female Chauffeur Photo */}
          <section className="mb-32">
            <img 
              src="/images/female-chauffeur-palm.jpg" 
              alt="A chauffeur smiles as she gets out of her vehicle with palm trees in the background" 
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
          </section>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Companies; 