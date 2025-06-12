import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, Globe, Shield, Users, DollarSign, Key, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const StrategicPartnerships = () => {
  const navigate = useNavigate();

  const handleReservarClick = () => {
    navigate('/login-companies');
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section con mejor estructura para móviles */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden w-full">
        {/* Overlay más oscuro para mejorar el contraste */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        {/* Imagen de fondo */}
        <img 
          src="/images/limo-airport.png" 
          alt="Servicio de chófer de primera clase" 
          className="w-full h-[500px] md:h-[600px] object-cover object-center opacity-70"
        />
        
        {/* Contenido del hero con mejor padding y estructura */}
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-6xl">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight">
                Conviértase en socio de 
                <span className="inline-block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black"> Privyde</span>
              </h1>
              
              <motion.button 
                className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mt-4"
                onClick={handleReservarClick}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reservar ahora
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - AHORA COMPLETAMENTE SEPARADO DEL HERO */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        
        {/* Aviation Section - COMPLETAMENTE FUERA DEL HERO */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Aviación
                <span className="block w-16 h-1 bg-black mt-4"></span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ofrezca un servicio de chófer de primera clase para sus invitados de Primera y Clase Ejecutiva.
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Confíe en un socio de confianza para las principales aerolíneas comerciales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Atienda a sus pasajeros VIP de aerolíneas a nivel mundial</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Trabaje con soluciones personalizadas para servicios de cortesía, complementarios y para la tripulación</span>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="/images/B4B-Aviation-Card.jpg" 
                alt="Servicio de chófer para aviación" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Cruise Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Cruceros
                <span className="block w-16 h-1 bg-black mt-4"></span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Eleve la experiencia de sus invitados con un traslado con chófer.
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Ofrezca a sus invitados una experiencia fluida de puerta a puerta</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Aproveche nuestra experiencia local con recogidas en puertos y aeropuertos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Solución de reserva de viajes de cortesía con marca blanca disponible</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="/images/B4B-TA-Happy-Clients.jpg" 
                alt="Servicio de chófer para cruceros" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Financial Services Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Servicios financieros
                <span className="block w-16 h-1 bg-black mt-4"></span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ofrezca beneficios de valor añadido a sus miembros titulares de tarjetas de alto poder adquisitivo.
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Reserva de traslado de cortesía para viajes aéreos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Ofertas mejoradas para servicios pagados por miembros titulares de tarjetas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Equipo de soporte con experiencia en atención a clientes de alto valor en el sector financiero</span>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="/images/Business-Traveler-Dubai.jpg" 
                alt="Servicio de chófer para servicios financieros" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Hotel Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Hoteles
                <span className="block w-16 h-1 bg-black mt-4"></span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Extienda la hospitalidad y brinde experiencias de viaje excepcionales más allá de las puertas del hotel.
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Ofrezca a sus huéspedes de alto valor traslados gratuitos al aeropuerto</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Proporcione a los huéspedes excursiones y visitas por la ciudad utilizando nuestro servicio por horas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Confíe en nuestra experiencia global en la atención a viajeros de todo el mundo</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="/images/Pict-Dubai.jpg" 
                alt="Servicio de chófer para hoteles" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Business Benefits Section */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
            Experimente nuestros beneficios para empresas
            <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Globe className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Cobertura global</h3>
              <p className="text-gray-600 leading-relaxed">
                Servicio consistente y fiable en más de 50 países en todo el mundo. Experiencia local garantizada.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Cumplimiento y seguridad</h3>
              <p className="text-gray-600 leading-relaxed">
                Viaje con confianza en vehículos premium limpios conducidos por profesionales con licencia y asegurados.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Soporte prioritario</h3>
              <p className="text-gray-600 leading-relaxed">
                Equipo de soporte dedicado disponible 24/7 para cualquier necesidad diaria y requisitos en el sitio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <DollarSign className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Precios competitivos</h3>
              <p className="text-gray-600 leading-relaxed">
                Precios todo incluido basados en la distancia más corta posible y fijados en el momento de la reserva.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Key className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Soluciones empresariales personalizadas</h3>
              <p className="text-gray-600 leading-relaxed">
                Integre fácilmente soluciones llave en mano personalizadas a través de una API para gestionar servicios complementarios.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-black mb-6 bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                <Leaf className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajes sostenibles</h3>
              <p className="text-gray-600 leading-relaxed">
                ¡Ofrecemos con orgullo una variedad de vehículos eléctricos en ciudades seleccionadas y nos aseguramos de que nuestra huella de carbono sea compensada!
              </p>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl shadow-sm">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl text-gray-700 mb-8 relative italic">
              <span className="text-5xl text-gray-400 absolute -top-6 -left-2">"</span>
              <p className="ml-8">
                Emirates está comprometida a extender su calidad premium. Ofrecemos servicio de chófer gratuito a nuestros clientes de Primera y Clase Ejecutiva en más de 75 ciudades en todo el mundo y, gracias a la presencia global de Privyde, podemos ofrecer esto en más destinos.
              </p>
              <span className="text-5xl text-gray-400 absolute -bottom-10 -right-2">"</span>
            </blockquote>
            <div className="text-right mt-6">
              <p className="font-medium text-gray-900">Bill McPherson</p>
              <p className="text-gray-600">Emirates Airlines, Anterior Vicepresidente, Servicios Aeroportuarios (Estaciones externas)</p>
            </div>
          </div>
        </section>

        {/* API Integration Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative">
                Explore nuestras integraciones API
                <span className="block w-16 h-1 bg-black mt-4"></span>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Desde reservas instantáneas hasta cancelaciones simplificadas, nuestras integraciones de vanguardia con plataformas de reserva globales hacen que los viajes corporativos sean sin esfuerzo. Sincronice, escale y simplifique, sin perder el ritmo.
              </p>
              <ul className="space-y-6 mb-8">
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Integración global GDS: Reserve y gestione viajes a través de Sabre, Amadeus y Travelport con funcionalidad completa.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Compatibilidad con OBT principales: Aproveche herramientas como SAP Concur y Navan para reservas en tiempo real, integradas directamente en sus flujos de trabajo existentes.</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-6 w-6 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Acceso instantáneo, actualizaciones en tiempo real: Precios en vivo, disponibilidad y detalles del viaje lo mantienen en control y a sus clientes en curso, sin importar el destino.</span>
                </li>
              </ul>
              <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center">
                Más información
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            <div>
              <img 
                src="/images/cityscape-sunset.jpg" 
                alt="Vista nocturna de la ciudad" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Awards Section */}
        <section className="mb-32 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 relative">
            Servicio de chófer premiado
            <span className="block w-24 h-1 bg-black mx-auto mt-4"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col items-center">
              <img 
                src="/images/B2B-Icon-Lux.jpg" 
                alt="Leaders in Luxury" 
                className="h-24 w-auto mb-6"
              />
              <p className="text-gray-600">Leaders in Luxury</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col items-center">
              <img 
                src="/images/B2B-Award-2024-Business.jpg" 
                alt="Business Travel Awards Europe 2024" 
                className="h-24 w-auto mb-6"
              />
              <p className="text-gray-600">Business Travel Awards Europe 2024</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 flex flex-col items-center">
              <img 
                src="/images/B2B-Award-2024-World.jpg" 
                alt="World Travel Awards 2024" 
                className="h-24 w-auto mb-6"
              />
              <p className="text-gray-600">World Travel Awards 2024</p>
            </div>
          </div>
        </section>

        {/* CTA Section - Call to Action */}
        <section className="mb-16 bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-lg text-white">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Únase como socio de chófer hoy.
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              ¿Posee o gestiona vehículos premium? Hablemos.
            </p>
            <Link to="/drivers" className="bg-white text-gray-900 font-medium h-12 px-8 py-3 rounded-md shadow-md hover:shadow-lg transition-all duration-300 inline-block">
              Conviértase en socio de chófer
            </Link>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StrategicPartnerships; 