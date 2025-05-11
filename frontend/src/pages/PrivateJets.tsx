import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Image from "@/components/ui/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking-form";
import DownloadSection from "@/components/download-section";
import { ChevronDown, ChevronUp, DollarSign, Clock, TimerReset, CheckCircle, ChevronLeft, ChevronRight, Shield, Star, Plane } from "lucide-react";

const PrivateJets = () => {
  // Estado para controlar qué clase de servicio está seleccionada
  const [activeServiceClass, setActiveServiceClass] = useState<number>(0);

  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Toggle para abrir/cerrar FAQs
  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  // Referencia para el slider
  const sliderRef = useRef<HTMLDivElement>(null);

  // Funciones para manejar el slider
  const handlePrev = () => {
    if (activeServiceClass > 0) {
      setActiveServiceClass(activeServiceClass - 1);
    } else {
      setActiveServiceClass(serviceClasses.length - 1);
    }
  };

  const handleNext = () => {
    if (activeServiceClass < serviceClasses.length - 1) {
      setActiveServiceClass(activeServiceClass + 1);
    } else {
      setActiveServiceClass(0);
    }
  };

  // Datos de clases de servicio para jets privados
  const serviceClasses = [
    {
      id: 1,
      title: "Light Jet",
      description: "Cessna Citation CJ3, Embraer Phenom 300, Learjet 75, o similar",
      capacity: "Capacidad para 6-8 personas",
      luggage: "Capacidad para equipaje de mano y hasta 8 maletas estándar",
      availability: "Ideal para vuelos nacionales y regionales de hasta 3 horas",
      range: "Autonomía de vuelo de aproximadamente 2.000 km",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    },
    {
      id: 2,
      title: "Midsize Jet",
      description: "Cessna Citation XLS, Gulfstream G150, Hawker 800XP, o similar",
      capacity: "Capacidad para 8-10 personas",
      luggage: "Amplio espacio para equipaje, hasta 10 maletas estándar",
      availability: "Disponible para vuelos continentales de hasta 5 horas",
      range: "Autonomía de vuelo de aproximadamente 4.000 km",
      image: "https://images.unsplash.com/photo-1583161036683-f5f3856ee519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    },
    {
      id: 3,
      title: "Heavy Jet",
      description: "Gulfstream G450, Challenger 650, Dassault Falcon 2000, o similar",
      capacity: "Capacidad para 10-14 personas",
      luggage: "Amplio compartimento para equipaje, hasta 15 maletas estándar",
      availability: "Ideal para vuelos intercontinentales y viajes de negocios de larga distancia",
      range: "Autonomía de vuelo de aproximadamente 7.000 km",
      image: "https://images.unsplash.com/photo-1612647242324-5d5d017b4742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    },
    {
      id: 4,
      title: "Ultra Long Range",
      description: "Gulfstream G650, Bombardier Global 7500, Dassault Falcon 8X, o similar",
      capacity: "Capacidad para 12-16 personas",
      luggage: "Espacio para equipaje de gran capacidad, hasta 20 maletas",
      availability: "Disponible para vuelos intercontinentales sin escalas",
      range: "Autonomía de vuelo superior a 11.000 km para trayectos globales",
      image: "https://images.unsplash.com/photo-1582851896496-4901e8145949?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    },
  ];

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Cuáles son las ventajas de viajar en jet privado?",
      answer: (
        <p className="text-gray-600">
          Viajar en jet privado ofrece numerosas ventajas como ahorro significativo de tiempo al evitar las largas esperas en los aeropuertos comerciales, mayor flexibilidad de horarios y rutas, acceso a más de 5.000 aeropuertos en todo el mundo (frente a los aproximadamente 500 que utilizan las aerolíneas comerciales), máxima privacidad para realizar reuniones de negocios o disfrutar de tiempo personal, mayor comodidad con cabinas diseñadas para el máximo confort, y la posibilidad de personalizar cada aspecto del viaje según sus necesidades específicas.
        </p>
      ),
    },
    {
      question: "¿Con cuánta antelación debo reservar un jet privado?",
      answer: (
        <p className="text-gray-600">
          Aunque podemos organizar vuelos con tan solo 4 horas de antelación, recomendamos reservar con al menos 48-72 horas para garantizar la disponibilidad de la aeronave preferida. Para viajes durante temporadas altas, eventos importantes o destinos populares, es aconsejable reservar con 1-2 semanas de anticipación. Para itinerarios complejos o grupos grandes, un plazo de 7-10 días nos permitirá coordinar todos los aspectos de su viaje a la perfección.
        </p>
      ),
    },
    {
      question: "¿Qué aeropuertos puedo utilizar con un jet privado?",
      answer: (
        <p className="text-gray-600">
          Una de las grandes ventajas de los jets privados es el acceso a más de 5.000 aeropuertos en todo el mundo, muchos de los cuales no están disponibles para vuelos comerciales. Esto incluye aeropuertos locales más pequeños que a menudo están más cerca de su destino final, reduciendo significativamente el tiempo de traslado terrestre. Además, puede seleccionar los aeropuertos de salida y llegada que mejor se adapten a su itinerario, evitando los principales centros aeroportuarios congestionados cuando sea posible.
        </p>
      ),
    },
    {
      question: "¿Cómo se determina el precio de un vuelo en jet privado?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">El precio de un vuelo en jet privado se calcula según varios factores:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Distancia y duración del vuelo</li>
            <li>Tipo y tamaño de aeronave seleccionada</li>
            <li>Tiempo de espera en destino (si es un viaje de ida y vuelta)</li>
            <li>Tarifas de aeropuerto y navegación aérea</li>
            <li>Costos de catering y servicios especiales solicitados</li>
            <li>Temporada y disponibilidad de aeronaves</li>
          </ul>
          <p className="mt-2">Trabajamos con transparencia total en los precios, proporcionando un presupuesto detallado sin costes ocultos. Además, ofrecemos opciones de vuelos vacíos (empty legs) que pueden resultar significativamente más económicos para clientes con flexibilidad en sus fechas de viaje.</p>
        </div>
      ),
    },
    {
      question: "¿Qué servicios a bordo están incluidos?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Todos nuestros vuelos incluyen:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tripulación profesional altamente capacitada</li>
            <li>Catering premium adaptado a sus preferencias</li>
            <li>Bebidas alcohólicas y no alcohólicas de alta gama</li>
            <li>Wi-Fi a bordo (según equipamiento de la aeronave)</li>
            <li>Prensa y entretenimiento personalizados</li>
            <li>Servicios de concierge para reservas en destino</li>
          </ul>
          <p className="mt-2">Además, podemos personalizar cada aspecto de su experiencia de vuelo, desde configuraciones especiales de cabina hasta arreglos de catering específicos, decoración para ocasiones especiales o cualquier otro servicio que pueda necesitar.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Full-Width Image */}
      <div className="flex flex-col w-full">
        {/* Title Bar */}
        <div className="title-bar relative">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-black">
              Jets Privados
            </h1>
          </div>
        </div>

        {/* Image Container */}
        <div className="hero-container relative">
          {/* Background Image */}
          <div className="full-size-background">
            <Image
              src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="Jet privado lujoso en pista de aeropuerto con escalera lista para pasajeros"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </div>
          
          {/* Booking Widget - Solo visible en pantallas grandes (lg) */}
          <div className="booking-widget-container-overlay hidden lg:block">
            <BookingForm />
          </div>
        </div>
      </div>
      
      {/* Booking Widget - Solo visible en tablets y móviles (fuera del hero) */}
      <div className="lg:hidden mx-auto px-4 mb-8 mt-6 relative z-30">
        <BookingForm />
      </div>

      {/* Download Section */}
      <DownloadSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Features Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <Clock className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Ahorre tiempo valioso</h3>
              <p className="text-gray-600 leading-relaxed">
                Olvídese de largas esperas y procedimientos de seguridad. Llegue al aeropuerto apenas 15 minutos antes del despegue y despegue cuando usted esté listo.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Privacidad y seguridad</h3>
              <p className="text-gray-600 leading-relaxed">
                Disfrute de la máxima privacidad con su equipo o familiares. Nuestras aeronaves cumplen con los más altos estándares de seguridad y mantenimiento.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <div className="text-red-500 mb-6 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center">
                <Plane className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Acceso global</h3>
              <p className="text-gray-600 leading-relaxed">
                Vuele a más de 5.000 aeropuertos en todo el mundo, incluyendo destinos no accesibles para vuelos comerciales, acercándose a su destino final.
              </p>
            </div>
          </div>
        </section>

        {/* Service Classes Section - Slider */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nuestra flota de Jets Privados
          </h2>
          
          {/* Slider con flechas de navegación */}
          <div className="relative" ref={sliderRef}>
            <div className="overflow-hidden">
              <div className="flex flex-wrap lg:flex-nowrap justify-center">
                {/* Contenido del slider */}
                <div className="w-full relative">
                  {/* Card principal */}
                  <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <div className="relative">
                      {/* Flechas de navegación */}
                      <button 
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-r-lg z-10 shadow-md"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-800" />
                      </button>
                      
                      <img 
                        src={serviceClasses[activeServiceClass].image} 
                        alt={serviceClasses[activeServiceClass].title} 
                        className="w-full h-64 md:h-80 object-cover object-center"
                      />
                      
                      <button 
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-l-lg z-10 shadow-md"
                        aria-label="Siguiente"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-800" />
                      </button>
                      
                      {/* Indicadores de diapositiva */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        {serviceClasses.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveServiceClass(index)}
                            className={`w-2 h-2 rounded-full ${
                              activeServiceClass === index ? 'bg-red-500' : 'bg-white bg-opacity-70'
                            }`}
                            aria-label={`Ir a diapositiva ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{serviceClasses[activeServiceClass].title}</h3>
                      <p className="text-gray-700 text-sm mb-4">{serviceClasses[activeServiceClass].description}</p>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{serviceClasses[activeServiceClass].capacity}</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{serviceClasses[activeServiceClass].luggage}</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{serviceClasses[activeServiceClass].availability}</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{serviceClasses[activeServiceClass].range}</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* Selector de páginas numerado */}
                      <div className="flex justify-center mt-6 space-x-1">
                        {serviceClasses.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveServiceClass(index)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium ${
                              activeServiceClass === index 
                                ? 'bg-black text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Sections */}
        <section className="mb-20">
          <div className="grid grid-cols-1 gap-12">
            {/* Primera sección */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Experiencia premium en jets privados</h2>
              <p className="text-gray-600 mb-0 leading-relaxed">
                Los viajes en jet privado representan la máxima expresión de lujo, comodidad y eficiencia en el transporte aéreo. Nuestro servicio de jets privados está diseñado para ofrecer una experiencia de viaje sin igual, eliminando las molestias y las esperas asociadas con los vuelos comerciales. Con acceso a aeropuertos exclusivos, horarios totalmente flexibles y un servicio personalizado, volar en jet privado no es solo un modo de transporte, sino una extensión de su estilo de vida o la imagen de su empresa. Ya sea para viajes de negocios urgentes, vacaciones familiares de lujo o eventos especiales, nuestros jets privados le permiten maximizar su tiempo más valioso mientras disfruta de un confort inigualable y la más absoluta privacidad.
              </p>
            </div>
          </div>
        </section>

        {/* Images Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1583850097248-96ed5ff4a59a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Interior lujoso de jet privado con asientos de cuero y acabados en madera" 
                className="w-full h-auto rounded-xl shadow-lg object-cover mb-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1436397543931-01c4a5162bdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Jet privado en vuelo sobre las nubes al atardecer" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ventajas exclusivas para viajes corporativos e internacionales
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Los jets privados trascienden el concepto tradicional de transporte aéreo para convertirse en verdaderas herramientas de productividad y eficiencia. Para ejecutivos y equipos corporativos, nuestros servicios permiten mantener agendas imposibles con vuelos comerciales, visitando múltiples ciudades en un solo día y llegando descansados a cada destino. Las cabinas están diseñadas como oficinas voladoras donde se pueden realizar reuniones confidenciales sin interrupciones mientras se desplazan entre ciudades.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Para viajes internacionales, eliminamos las largas esperas en los controles fronterizos con procedimientos acelerados de inmigración y aduana. Nuestros pasajeros no solo disfrutan de la máxima privacidad, sino también de un servicio a bordo personalizado según sus preferencias gastronómicas y de confort, con catering de alta cocina y amenidades premium. A diferencia de las aerolíneas comerciales, sus mascotas pueden viajar cómodamente en la cabina principal junto a usted, haciendo que la experiencia de viaje sea placentera para todos los miembros de la familia.
              </p>
              <p className="text-lg text-gray-600">
                Garantizamos además la máxima flexibilidad para adaptarnos a cambios de última hora en sus planes, modificando horarios, rutas e incluso destinos finales según sus necesidades. Esta combinación única de beneficios hace que el valor de un vuelo privado transcienda el mero lujo para convertirse en una inversión en tiempo, privacidad y productividad.
              </p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            El proceso de reserva simplificado
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Solicitud</h3>
              <p className="text-gray-600">
                Contáctenos con sus requisitos de viaje, incluyendo fechas, destinos, número de pasajeros y preferencias especiales.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Propuesta</h3>
              <p className="text-gray-600">
                Recibirá una selección personalizada de aeronaves disponibles con precios transparentes y servicios incluidos.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Confirmación</h3>
              <p className="text-gray-600">
                Una vez seleccionada la aeronave, formalizamos la reserva y coordinamos todos los detalles logísticos de su viaje.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-500">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Experiencia</h3>
              <p className="text-gray-600">
                Disfrute de un viaje sin contratiempos con atención personalizada desde el momento de llegada hasta el destino final.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20 bg-gray-50 py-12 rounded-xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Lo que dicen nuestros clientes
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Como CEO que viaja constantemente, el servicio de jets privados ha transformado radicalmente mi productividad. Puedo visitar tres ciudades en un día y seguir llegando a casa para cenar con mi familia. La flexibilidad y el tiempo ahorrado justifican completamente la inversión."</p>
                <div>
                  <p className="font-semibold text-gray-900">Carlos Rodríguez</p>
                  <p className="text-gray-500 text-sm">CEO, Innotech Solutions</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"Viajamos con nuestra familia extendida, incluidos niños pequeños y nuestra mascota. La experiencia fue incomparable: sin estrés, sin esperas y con un servicio absolutamente personalizado. Los niños disfrutaron enormemente y pudimos comenzar nuestras vacaciones desde el momento en que abordamos."</p>
                <div>
                  <p className="font-semibold text-gray-900">Elena Martínez</p>
                  <p className="text-gray-500 text-sm">Cliente frecuente</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
            Preguntas frecuentes
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl border ${openFaqIndex === index ? 'border-red-200 shadow-md' : 'border-gray-200'} overflow-hidden transition-all duration-300`}
              >
                <button
                  className="flex justify-between items-center w-full p-6 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className={`text-xl font-semibold ${openFaqIndex === index ? 'text-red-600' : 'text-gray-900'}`}>{faq.question}</h3>
                  <div className={`${openFaqIndex === index ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50'} rounded-full p-1 transition-colors duration-300`}>
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
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-20 bg-gray-900 text-white rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">
                Experimente la diferencia de volar en privado
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Permítanos mostrarle cómo nuestro servicio de jets privados puede transformar su experiencia de viaje. Hable con nuestros especialistas para recibir un presupuesto personalizado o solicitar más información.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
                  Solicitar presupuesto
                </button>
                <button className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
                  Contactar a un especialista
                </button>
              </div>
            </div>
            <div className="relative min-h-[300px] md:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                alt="Jet privado esperando en la pista de aeropuerto al atardecer" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivateJets; 