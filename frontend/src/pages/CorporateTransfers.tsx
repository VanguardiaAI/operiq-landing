import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Image from "@/components/ui/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking-form";
import DownloadSection from "@/components/download-section";
import { ChevronDown, ChevronUp, ShieldCheck, Clock, Building, Users, Briefcase, Award, ChevronLeft, ChevronRight, CheckCircle, Star } from "lucide-react";

const CorporateTransfers = () => {
  // Estado para controlar qué clase de servicio está seleccionada
  const [activeServiceClass, setActiveServiceClass] = useState<number>(0);

  // Estado para controlar qué FAQ está abierta
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Estado para controlar qué beneficio está seleccionado
  const [activeBenefitIndex, setActiveBenefitIndex] = useState<string>("time");

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

  // Datos de clases de servicio para corporativos
  const serviceClasses = [
    {
      id: 1,
      title: "Ejecutivo Premium",
      description: "Mercedes E-Class, BMW Serie 5, Audi A6, o similar",
      capacity: "Capacidad para 3 personas",
      luggage: "Espacio para 2 maletas de cabina y 2 maletines ejecutivos",
      availability: "Disponible en todas las ciudades principales",
      image: "/images/e-class-limo.png",
    },
    {
      id: 2,
      title: "Lujo Corporativo",
      description: "Mercedes S-Class, BMW Serie 7, Audi A8, o similar",
      capacity: "Capacidad para 3 personas",
      luggage: "Espacio para 2 maletas estándar y 2 maletines ejecutivos",
      availability: "Disponible en principales centros financieros",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Lujo+Corporativo",
    },
    {
      id: 3,
      title: "SUV Ejecutiva",
      description: "Mercedes GLE, BMW X5, Range Rover, o similar",
      capacity: "Capacidad para 4 personas",
      luggage: "Espacio para 3 maletas estándar y equipaje de mano",
      availability: "Ideal para equipos pequeños con necesidad de mayor espacio",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=SUV+Ejecutiva",
    },
    {
      id: 4,
      title: "Movilidad Grupal",
      description: "Mercedes V-Class, Mercedes Sprinter VIP, o similar",
      capacity: "Capacidad para 6-14 personas",
      luggage: "Amplio espacio para equipaje de todo el equipo",
      availability: "Perfecta para delegaciones y equipos completos",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Movilidad+Grupal",
    },
    {
      id: 5,
      title: "Seguridad Reforzada",
      description: "Mercedes Clase S Guard, BMW Serie 7 Security, o similar",
      capacity: "Capacidad para 3 personas",
      luggage: "Espacio para 2 maletas con compartimentos seguros",
      availability: "Disponible para ejecutivos con necesidades de seguridad elevadas",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Seguridad+Reforzada",
    },
    {
      id: 6,
      title: "Eléctrico Ejecutivo",
      description: "Tesla Model S, Mercedes EQS, BMW i7, o similar",
      capacity: "Capacidad para 3 personas",
      luggage: "Espacio para 2 maletas estándar y equipaje de mano",
      availability: "Opción sostenible para empresas comprometidas con el medio ambiente",
      image: "https://via.placeholder.com/600x350/ccc/fff?text=Eléctrico+Ejecutivo",
    },
  ];

  // Datos para los beneficios corporativos
  const corporateBenefits = {
    time: {
      title: "Optimización del tiempo",
      icon: <Clock className="h-8 w-8 text-red-500" />,
      points: [
        "Servicio puntual garantizado para nunca perder una reunión",
        "Monitoreo constante del tráfico para seleccionar las rutas más eficientes",
        "Tiempo de espera flexible adaptado a su agenda empresarial",
        "Coordinación perfecta con vuelos, trenes y otros medios de transporte",
        "Planificación y gestión centralizada de todos los desplazamientos"
      ]
    },
    security: {
      title: "Seguridad y confidencialidad",
      icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
      points: [
        "Conductores verificados con experiencia en transporte ejecutivo",
        "Vehículos con mantenimiento premium y sistemas de seguridad avanzados",
        "Confidencialidad garantizada en todas las comunicaciones",
        "Acuerdos de confidencialidad disponibles para servicios sensibles",
        "Opciones de vehículos blindados para necesidades especiales"
      ]
    },
    image: {
      title: "Imagen corporativa",
      icon: <Building className="h-8 w-8 text-red-500" />,
      points: [
        "Flota impecable que refleja la excelencia de su empresa",
        "Chóferes profesionales con vestimenta formal o corporativa",
        "Posibilidad de personalizar el servicio con su imagen de marca",
        "Recepción VIP para clientes e invitados especiales",
        "Servicio uniforme en todas las ciudades para una experiencia consistente"
      ]
    },
    management: {
      title: "Gestión centralizada",
      icon: <Briefcase className="h-8 w-8 text-red-500" />,
      points: [
        "Portal corporativo exclusivo para gestionar reservas",
        "Facturación unificada adaptada a sus procesos internos",
        "Informes detallados de uso y costes por departamento",
        "Asignación de centros de coste y proyectos",
        "Integración con sistemas de viajes corporativos existentes"
      ]
    }
  };

  // Testimonios de clientes corporativos
  const testimonials = [
    {
      name: "María González",
      position: "Directora de Operaciones, Global Enterprises",
      text: "Operiq ha transformado nuestra logística ejecutiva. Su servicio es consistente, puntual y verdaderamente premium. Los directivos ahora pueden prepararse para reuniones en el trayecto, aprovechando al máximo cada minuto. Su plataforma de gestión nos permite un control completo sobre gastos y asignaciones.",
      stars: 5,
    },
    {
      name: "Carlos Mendoza",
      position: "CFO, Tech Innovations Inc.",
      text: "Como empresa con operaciones en 8 países, necesitábamos un servicio de transporte que mantuviera el mismo estándar de calidad en todas nuestras ubicaciones. Operiq no solo cumplió esa expectativa sino que la superó. Su sistema centralizado de facturación ha simplificado enormemente nuestra administración.",
      stars: 5,
    },
    {
      name: "Ana Ramírez",
      position: "Directora de Eventos, Premium Consultants",
      text: "Organizamos más de 50 eventos corporativos al año y la logística de traslados siempre era un dolor de cabeza hasta que encontramos Operiq. Su capacidad para gestionar múltiples recogidas y traslados simultáneos es impresionante. Los asistentes siempre destacan el nivel de servicio como un diferencial de nuestros eventos.",
      stars: 5,
    },
  ];

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Cómo puedo establecer una cuenta corporativa?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Establecer una cuenta corporativa con nosotros es un proceso sencillo diseñado para adaptarse a sus necesidades empresariales:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contacte con nuestro departamento de ventas corporativas a través del formulario en esta página</li>
            <li>Un gestor de cuentas le será asignado para entender sus requisitos específicos</li>
            <li>Configuramos su portal corporativo personalizado y configuramos los permisos de usuarios</li>
            <li>Establecemos los acuerdos de nivel de servicio (SLAs) y términos comerciales</li>
            <li>Proporcionamos formación para administradores y usuarios del sistema</li>
          </ul>
          <p className="mt-2">Todo el proceso puede completarse en menos de una semana, permitiéndole comenzar a disfrutar de nuestros servicios VIP rápidamente.</p>
        </div>
      ),
    },
    {
      question: "¿Qué opciones de facturación ofrecen para empresas?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Ofrecemos soluciones de facturación flexibles diseñadas para adaptarse a los procesos financieros de su empresa:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Facturación consolidada mensual:</strong> Un único documento con todos los servicios del período</li>
            <li><strong>Facturación por departamento:</strong> Separación de gastos por unidades de negocio o centros de coste</li>
            <li><strong>Facturación por proyecto:</strong> Asignación de gastos a proyectos específicos</li>
            <li><strong>Integración con sistemas ERP:</strong> Compatibilidad con SAP, Oracle y otros sistemas empresariales</li>
            <li><strong>Múltiples divisas:</strong> Facturación en la moneda de su elección</li>
          </ul>
          <p className="mt-2">Todas nuestras facturas incluyen informes detallados de uso que facilitan la auditoría y control de gastos.</p>
        </div>
      ),
    },
    {
      question: "¿Cómo gestionan los cambios de última hora en la agenda?",
      answer: (
        <p className="text-gray-600">
          Entendemos que los horarios empresariales pueden cambiar rápidamente. Nuestro servicio corporativo está diseñado con la flexibilidad como prioridad. A través de nuestra aplicación o portal corporativo, puede realizar cambios en las reservas hasta 30 minutos antes del servicio sin cargos adicionales. Para cambios más inmediatos, contamos con un equipo de coordinación disponible 24/7 que se encargará de reorganizar su servicio minimizando cualquier impacto. Además, nuestros chóferes están capacitados para adaptarse a modificaciones en el itinerario durante el servicio, pudiendo extender el tiempo, añadir paradas adicionales o cambiar el destino según sea necesario.
        </p>
      ),
    },
    {
      question: "¿Ofrecen servicios internacionales para ejecutivos que viajan con frecuencia?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Sí, nuestro servicio corporativo tiene alcance global, ideal para ejecutivos con agenda internacional:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Presencia en más de 300 ciudades en 80 países</li>
            <li>Mismo estándar de calidad y procedimientos en todas las ubicaciones</li>
            <li>Reserva centralizada para todos los destinos</li>
            <li>Chóferes con conocimiento local y dominio de idiomas</li>
            <li>Coordinación entre diferentes zonas horarias</li>
          </ul>
          <p className="mt-2">Además, ofrecemos paquetes corporativos globales con tarifas preferentes para empresas con alto volumen de viajes internacionales, garantizando que sus ejecutivos reciban el mismo nivel de servicio en cualquier parte del mundo.</p>
        </div>
      ),
    },
    {
      question: "¿Qué medidas de seguridad implementan para ejecutivos de alto nivel?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Para ejecutivos con requisitos especiales de seguridad, ofrecemos un programa reforzado que incluye:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chóferes con formación en conducción defensiva y evasiva</li>
            <li>Vehículos blindados de diferentes niveles según necesidades</li>
            <li>Planificación avanzada de rutas con alternativas pre-establecidas</li>
            <li>Protocolos de comunicación seguros entre el centro de operaciones y el vehículo</li>
            <li>Posibilidad de incorporar personal de seguridad adicional</li>
            <li>Confidencialidad total sobre itinerarios, pasajeros e información sensible</li>
          </ul>
          <p className="mt-2">Todos estos servicios se implementan de manera discreta, manteniendo la apariencia de un servicio premium estándar para no llamar atención innecesaria.</p>
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
              Traslados corporativos VIP
            </h1>
          </div>
        </div>

        {/* Image Container */}
        <div className="hero-container relative">
          {/* Background Image */}
          <div className="full-size-background">
            <Image
              src="https://images.unsplash.com/photo-1600320254374-ce2d293c324e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80"
              alt="Ejecutivo entrando a un vehículo de lujo con chófer"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Transporte ejecutivo que refleja la excelencia de su empresa</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Diseñado exclusivamente para el ámbito corporativo, nuestro servicio de transporte ejecutivo combina eficiencia, discreción y confort para satisfacer las exigencias del mundo empresarial actual.
          </p>
        </div>
      </div>

      {/* Download Section */}
      <DownloadSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Service Classes Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Nuestra flota corporativa
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

        {/* Corporate Benefits Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Beneficios para su empresa
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>

          {/* Selector de beneficios */}
          <div className="flex flex-wrap justify-center mb-12">
            {Object.entries(corporateBenefits).map(([key, benefit]) => (
              <button
                key={key}
                className={`flex items-center px-6 py-3 m-2 rounded-full transition-all ${
                  activeBenefitIndex === key
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveBenefitIndex(key)}
              >
                <span className="mr-2">{benefit.icon}</span>
                <span className="font-medium">{benefit.title}</span>
              </button>
            ))}
          </div>

          {/* Contenido del beneficio seleccionado */}
          {Object.entries(corporateBenefits).map(([key, benefit]) => (
            <div
              key={key}
              className={`transition-opacity duration-300 ${
                activeBenefitIndex === key ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-6">
                      {benefit.icon}
                      <h3 className="text-2xl font-bold text-gray-900 ml-3">{benefit.title}</h3>
                    </div>
                    
                    <ul className="space-y-3">
                      {benefit.points.map((point, index) => (
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
                    src={`https://source.unsplash.com/random/800x600/?${key === "time" ? "business+time" : key === "security" ? "executive+security" : key === "image" ? "corporate+image" : "business+management"}`}
                    alt={`Beneficio: ${benefit.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm opacity-90">Soluciones diseñadas para las necesidades empresariales</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Information Sections */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Servicio diseñado para el mundo corporativo
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Entendemos que el tiempo es el activo más valioso en el entorno empresarial. Nuestro servicio corporativo está diseñado para maximizar la productividad y eficiencia de sus ejecutivos, permitiéndoles trabajar durante los desplazamientos en un entorno confortable y discreto.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Con una flota premium y chóferes altamente capacitados, garantizamos que cada trayecto sea una extensión de su oficina: puntual, profesional y con todos los recursos necesarios para continuar con su agenda.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-3">Soluciones a medida</h3>
                <p className="text-gray-600">
                  Desde servicios puntuales para reuniones importantes hasta programas completos de movilidad corporativa, adaptamos nuestros servicios a las necesidades específicas de cada empresa, independientemente de su tamaño o sector.
                </p>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Ejecutivo trabajando dentro de un vehículo premium mientras viaja" 
                className="w-full h-auto rounded-xl shadow-lg object-cover mb-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1563072275633-da6d8f48489f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Ejecutivos saliendo de una reunión y siendo recibidos por su chófer" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Global Service Section */}
        <section className="mb-20 bg-gray-50 p-8 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1591135790261-379e8938ac75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Mapa mundial con conexiones indicando servicio global" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Cobertura global, servicio local
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Con presencia en más de 300 ciudades en 80 países, ofrecemos a sus ejecutivos la tranquilidad de contar con el mismo estándar de excelencia en cualquier parte del mundo. Nuestros chóferes locales combinan el conocimiento del terreno con los más altos estándares internacionales.
              </p>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-xl text-gray-900 mb-3">Ventajas globales</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Gestión centralizada con facturación en su moneda</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Tarifas corporativas aplicables en todos los destinos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Soporte 24/7 en múltiples idiomas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
            Lo que dicen nuestros clientes corporativos
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
            Preguntas frecuentes sobre traslados corporativos
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
                Eleve la experiencia de movilidad de su empresa
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Nuestro equipo de cuentas corporativas está listo para diseñar un programa de transporte ejecutivo que se adapte perfectamente a las necesidades de su organización.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
                  Solicitar una demostración
                </button>
                <button className="bg-transparent border border-white hover:bg-white hover:text-gray-900 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
                  Contactar con ventas
                </button>
              </div>
            </div>
            <div className="relative min-h-[300px] md:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Equipo directivo en una reunión de negocios" 
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

export default CorporateTransfers; 