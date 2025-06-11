import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Image from "@/components/ui/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking-form";
import DownloadSection from "@/components/download-section";
import { ChevronDown, ChevronUp, ShieldCheck, Eye, UserCheck, Lock, UserPlus, Layers, ChevronLeft, ChevronRight, CheckCircle, Star } from "lucide-react";

const SecurityServices = () => {
  // Estado para controlar qué clase de servicio está seleccionada
  const [activeServiceClass, setActiveServiceClass] = useState<number>(0);

  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Estado para controlar qué nivel de seguridad está seleccionado
  const [activeSecurityLevel, setActiveSecurityLevel] = useState<string>("standard");

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
      setActiveServiceClass(securityVehicles.length - 1);
    }
  };

  const handleNext = () => {
    if (activeServiceClass < securityVehicles.length - 1) {
      setActiveServiceClass(activeServiceClass + 1);
    } else {
      setActiveServiceClass(0);
    }
  };

  // Datos de vehículos de seguridad
  const securityVehicles = [
    {
      id: 1,
      title: "Ejecutivo Protegido",
      description: "Mercedes E-Class blindado B4, BMW Serie 5 Security, o similar",
      capacity: "Capacidad para 3 personas",
      security: "Protección nivel B4 - resistente a armas de fuego de mano",
      availability: "Aspecto discreto, indistinguible de un vehículo estándar",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Ejecutivo+Protegido",
    },
    {
      id: 2,
      title: "Luxury Escudo",
      description: "Mercedes S-Class Guard B6, BMW Serie 7 High Security, o similar",
      capacity: "Capacidad para 3 personas",
      security: "Protección nivel B6/B7 - resistente a armas de asalto",
      availability: "Discreto con apariencia de alta gama ejecutiva",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Luxury+Escudo",
    },
    {
      id: 3,
      title: "SUV Táctico",
      description: "Range Rover Sentinel, BMW X5 Protection VR6, o similar",
      capacity: "Capacidad para 4 personas",
      security: "Protección completa - vidrios anti-balas y suelo anti-explosión",
      availability: "Mayor capacidad todo-terreno con seguridad integrada",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=SUV+Táctico",
    },
    {
      id: 4,
      title: "Convoy Ejecutivo",
      description: "Mercedes G-Class, Cadillac Escalade ESV blindado, o similar",
      capacity: "Capacidad para 4-6 personas",
      security: "Solución completa con vehículo principal y escolta",
      availability: "Ideal para delegaciones o ejecutivos de alto perfil",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Convoy+Ejecutivo",
    },
    {
      id: 5,
      title: "Discreto Ultra-Seguro",
      description: "Vehículos normales con mejoras invisibles de seguridad",
      capacity: "Capacidad según modelo seleccionado",
      security: "Diversas opciones de protección en vehículos no llamativos",
      availability: "Máxima discreción con seguridad oculta",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Discreto+Ultra-Seguro",
    },
  ];

  // Datos para los niveles de seguridad
  const securityLevels = {
    standard: {
      title: "Protección estándar",
      icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
      points: [
        "Chófer con capacitación en conducción defensiva",
        "Vehículo con elementos básicos de seguridad pasiva",
        "Planificación previa de rutas y alternativas",
        "Comunicación constante con centro de operaciones",
        "Perfil discreto para no atraer atención innecesaria"
      ]
    },
    enhanced: {
      title: "Protección reforzada",
      icon: <Lock className="h-8 w-8 text-red-500" />,
      points: [
        "Vehículo blindado nivel B4 o superior con vidrios anti-balas",
        "Chófer con formación avanzada en conducción evasiva",
        "Verificación preventiva y continua del entorno",
        "Coordinación con servicios locales de seguridad",
        "Protocolos de emergencia con rutas alternativas"
      ]
    },
    executive: {
      title: "Protección ejecutiva",
      icon: <UserCheck className="h-8 w-8 text-red-500" />,
      points: [
        "Vehículo blindado de alta resistencia (B6/B7)",
        "Equipo de seguridad personal discreta",
        "Reconocimiento y evaluación previa de lugares a visitar",
        "Sistemas anti-rastreo y anti-interferencia electrónica",
        "Comunicación cifrada entre equipo y centro de operaciones"
      ]
    },
    complete: {
      title: "Solución integral",
      icon: <Layers className="h-8 w-8 text-red-500" />,
      points: [
        "Convoy de varios vehículos con escolta",
        "Equipo completo de protección personal",
        "Coordinación con seguridad en destinos",
        "Planificación estratégica y logística a nivel internacional",
        "Evaluación de amenazas personalizada y actualizada en tiempo real"
      ]
    }
  };

  // Testimonios de clientes
  const testimonials = [
    {
      name: "Ricardo Velázquez",
      position: "Director de Seguridad, Multinacional Energética",
      text: "Operiq ha redefinido nuestros estándares de seguridad ejecutiva. Su enfoque discreto pero altamente efectivo permite que nuestros directivos viajen con total tranquilidad sin llamar la atención. La combinación de vehículos de lujo con medidas de seguridad avanzadas es exactamente lo que buscábamos.",
      stars: 5,
    },
    {
      name: "Elena Domínguez",
      position: "Jefa de Operaciones, Grupo Financiero Internacional",
      text: "Después de incidentes de seguridad en uno de nuestros mercados emergentes, contratamos los servicios de Operiq. La diferencia fue inmediata: mantuvieron un perfil bajo pero con protección de primer nivel. Pudimos continuar con nuestras operaciones sin interrupción y con la tranquilidad de contar con profesionales experimentados.",
      stars: 5,
    },
    {
      name: "Alejandro Méndez",
      position: "Empresario y Figura Pública",
      text: "Como figura mediática, necesitaba un servicio que me permitiera mantener mi privacidad sin sacrificar la seguridad. El enfoque personalizado de Operiq y su capacidad para adaptarse a diferentes niveles de amenaza según las circunstancias ha sido invaluable. Su discreción es tan impecable como su servicio.",
      stars: 5,
    },
  ];

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Cómo evalúan el nivel de seguridad que necesito?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Nuestro proceso de evaluación es exhaustivo y personalizado:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Consulta inicial confidencial para entender sus circunstancias específicas</li>
            <li>Análisis de riesgo basado en su perfil, destinos frecuentes y contexto</li>
            <li>Evaluación de amenazas potenciales específicas a su industria o posición</li>
            <li>Consideración de preferencias personales y requisitos de privacidad</li>
            <li>Recomendación de un plan de seguridad escalonado y adaptable</li>
          </ul>
          <p className="mt-2">Cada solución se adapta precisamente a sus necesidades reales, evitando tanto la insuficiencia como el exceso de medidas que podrían llamar la atención innecesariamente.</p>
        </div>
      ),
    },
    {
      question: "¿Qué formación tiene su personal de seguridad?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Nuestro personal cuenta con credenciales excepcionales:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Chóferes de seguridad:</strong> Formación en conducción evasiva y defensiva avanzada, certificados internacionales</li>
            <li><strong>Agentes de protección:</strong> Experiencia previa en fuerzas de élite o unidades especializadas</li>
            <li><strong>Coordinadores:</strong> Formación específica en gestión de crisis y logística de seguridad</li>
            <li><strong>Analistas:</strong> Especialistas en evaluación de riesgos y amenazas con experiencia internacional</li>
          </ul>
          <p className="mt-2">Todo nuestro personal pasa por rigurosos procesos de selección, verificación de antecedentes y capacitación continua. Además, están formados específicamente en servicios discretos que combinan seguridad con elegancia y profesionalismo.</p>
        </div>
      ),
    },
    {
      question: "¿Sus vehículos blindados son reconocibles externamente?",
      answer: (
        <p className="text-gray-600">
          Una de nuestras principales ventajas es la absoluta discreción visual de nuestra flota. Nuestros vehículos blindados utilizan las técnicas más avanzadas de integración de protección, haciendo imposible distinguirlos de vehículos de lujo estándar. A diferencia de soluciones tradicionales de blindaje que añaden peso visible y modifican la apariencia, trabajamos con fabricantes que implementan elementos de seguridad desde el diseño original. Los vidrios anti-balas mantienen la transparencia y aspecto normal, las carrocerías reforzadas conservan las líneas elegantes del vehículo, y los sistemas defensivos quedan completamente ocultos. Esta discreción es fundamental para nuestra filosofía: la mejor seguridad es aquella que permanece invisible.
        </p>
      ),
    },
    {
      question: "¿Cómo garantizan la privacidad y confidencialidad?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">La confidencialidad es un pilar fundamental de nuestro servicio:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acuerdos de confidencialidad estrictos con todo nuestro personal</li>
            <li>Sistemas de comunicación cifrados de extremo a extremo</li>
            <li>Información compartimentada según el principio de "necesidad de conocimiento"</li>
            <li>Planificación de rutas y operaciones en entornos seguros</li>
            <li>Protección contra vigilancia electrónica en nuestros vehículos</li>
            <li>Protocolos anti-seguimiento físico y digital</li>
          </ul>
          <p className="mt-2">Nuestros clientes valoran que mantenemos el mismo nivel de discreción incluso después de finalizado el servicio. Su privacidad es permanente, no temporal.</p>
        </div>
      ),
    },
    {
      question: "¿Pueden proporcionar seguridad en destinos internacionales?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Ofrecemos cobertura global con conocimiento local:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Presencia operativa en más de 90 países</li>
            <li>Red de asociados locales verificados en destinos específicos</li>
            <li>Equipos que conocen las particularidades culturales y geográficas de cada región</li>
            <li>Evaluaciones de riesgo específicas por país y ciudad</li>
            <li>Capacidad de gestionar servicios transfronterizos complejos</li>
          </ul>
          <p className="mt-2">Para viajes internacionales, proporcionamos un informe previo detallado sobre la situación de seguridad del destino y adaptamos nuestro servicio según las normativas y desafíos locales, garantizando una experiencia fluida sin comprometer la seguridad.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section con imagen a ancho completo */}
      <div className="flex flex-col w-full">
        {/* Title Bar */}
        <div className="title-bar relative">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-black">
              Servicios de seguridad ejecutiva discreta
            </h1>
          </div>
        </div>

        {/* Image Container */}
        <div className="hero-container relative">
          {/* Background Image */}
          <div className="full-size-background">
            <Image
              src="/images/security.png"
              alt="Chófer profesional abriendo la puerta de un vehículo de seguridad ejecutiva"
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

      {/* Moments Banner */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Seguridad ejecutiva sin comprometer la elegancia</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Proporcionamos protección de alto nivel con absoluta discreción. Nuestros servicios combinan la máxima seguridad con la sofisticación esperada en el transporte ejecutivo de primer nivel.
          </p>
        </div>
      </div>

      {/* Download Section */}
      <DownloadSection />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Security Vehicles Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Flota de seguridad exclusiva
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
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
                        src={securityVehicles[activeServiceClass].image} 
                        alt={securityVehicles[activeServiceClass].title} 
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
                        {securityVehicles.map((_, index) => (
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
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{securityVehicles[activeServiceClass].title}</h3>
                      <p className="text-gray-700 text-sm mb-4">{securityVehicles[activeServiceClass].description}</p>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{securityVehicles[activeServiceClass].capacity}</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{securityVehicles[activeServiceClass].security}</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{securityVehicles[activeServiceClass].availability}</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* Selector de páginas numerado */}
                      <div className="flex justify-center mt-6 space-x-1">
                        {securityVehicles.map((_, index) => (
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

        {/* Security Levels Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Niveles de protección personalizados
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>

          {/* Selector de niveles de seguridad */}
          <div className="flex flex-wrap justify-center mb-12">
            {Object.entries(securityLevels).map(([key, level]) => (
              <button
                key={key}
                className={`flex items-center px-6 py-3 m-2 rounded-full transition-all ${
                  activeSecurityLevel === key
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveSecurityLevel(key)}
              >
                <span className="mr-2">{level.icon}</span>
                <span className="font-medium">{level.title}</span>
              </button>
            ))}
          </div>

          {/* Contenido del nivel de seguridad seleccionado */}
          {Object.entries(securityLevels).map(([key, level]) => (
            <div
              key={key}
              className={`transition-opacity duration-300 ${
                activeSecurityLevel === key ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      {level.icon}
                      <h3 className="text-2xl font-bold text-gray-900 ml-3">{level.title}</h3>
                    </div>
                    
                    <ul className="space-y-3">
                      {level.points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <Star className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={`https://source.unsplash.com/random/800x600/?${key === "standard" ? "executive+car" : key === "enhanced" ? "security+vehicle" : key === "executive" ? "bodyguard+discrete" : "convoy+security"}`}
                    alt={`Nivel de seguridad: ${level.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
                    <h3 className="text-xl font-bold mb-2">{level.title}</h3>
                    <p className="text-sm opacity-90">Seguridad adaptada a sus necesidades específicas</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            La confianza de nuestros clientes
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Preguntas frecuentes sobre seguridad ejecutiva
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
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SecurityServices; 