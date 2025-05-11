import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const TravelAgencies = () => {
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

  // Datos de las preguntas frecuentes
  const faqData = [
    {
      question: "¿Pueden las agencias de viajes ganar comisiones a través de Operiq?",
      answer: (
        <p className="text-gray-600">
          Sí, las agencias de viajes pueden ganar comisiones por viajes reservados a través de su agencia con Operiq. Se puede ganar más comisiones. Hable con nuestro equipo para obtener más información.
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
      question: "¿Qué vehículos usa Operiq?",
      answer: (
        <p className="text-gray-600">
          Operiq ofrece varios servicios según la lista de vehículos aprobados de la ciudad. Estos pueden incluir: • Business Class: Mercedes-Benz E-Class, BMW Serie 5, Cadillac XTS o similar • Business Van/SUV: Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac Escalade, Toyota Alphard o similar • First Class: Mercedes-Benz S-Class, BMW Serie 7, Audi A8 o similar • Electric Class (disponible en ciudades seleccionadas): Jaguar I-PACE, Tesla Model S, Tesla Model X o similar • Sprinter Class (disponible en ciudades seleccionadas): Mercedes-Benz Sprinter o similar Otros tipos de vehículos pueden ser aprobados para diferentes ciudades si cumplen con el estándar de Operiq.
        </p>
      ),
    },
    {
      question: "¿Con cuánta antelación puedo reservar un viaje?",
      answer: (
        <p className="text-gray-600">
          Puede reservar viajes con meses de antelación o tan pronto como 60 minutos antes de que lo necesite. Recomendamos reservar con la mayor antelación posible. Operiq cuenta con la política de cancelación más flexible del sector, ya que los pasajeros pueden cancelar viajes de forma gratuita hasta una hora antes de la hora de recogida. También puede realizar cambios en su reserva hasta 60 minutos antes de la hora de recogida.
        </p>
      ),
    },
    {
      question: "¿Cómo contribuye Operiq a las opciones de viaje sostenibles?",
      answer: (
        <p className="text-gray-600">
          Operiq contribuye a los viajes sostenibles al ofrecer opciones de vehículos eléctricos, incorporar vehículos eléctricos en nuestra oferta de Business Class en muchas más ciudades y trabajar activamente para compensar su huella de carbono.
        </p>
      ),
    },
    {
      question: "¿Cómo son los precios de Operiq frente a los proveedores tradicionales?",
      answer: (
        <p className="text-gray-600">
          El modelo de precios competitivo de Operiq es más transparente en comparación con los proveedores tradicionales, lo que garantiza una buena relación calidad-precio sin comprometer la calidad del servicio.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Full-Width Image */}
      <div className="relative bg-white overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
        <img 
          src="/images/couple-approaching-car.jpg" 
          alt="Una pareja con equipaje ondulante sonríe mientras caminan hacia un Mercedes-Benz Eqs" 
          className="w-full h-[600px] object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Servicios globales de chófer para <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">agencias de viajes</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content with Centered Max Width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Introduction Section */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 relative">
            Mejore sus servicios de agencia de viajes
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Proporcione a sus clientes una experiencia de viaje excepcional con nuestro servicio de chófer global. Desde traslados al aeropuerto hasta viajes de negocios, ofrecemos un servicio de alta calidad que complementa su oferta de servicios de viaje.
              </p>
              <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                Contáctenos hoy
              </button>
            </div>
            <div>
              <img 
                src="/images/business-eqs-phone.jpg" 
                alt="Invitado en asiento trasero de EQS hablando por teléfono con resplandor solar" 
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Awards Section */}
        <section className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 relative">
            Calidad galardonada
            <span className="block w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-4"></span>
          </h2>
          <p className="text-center text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
            Ganaron el premio a la "Mejor compañía global de servicios de chófer" en los Premios Magellan y el premio a la "Mejor en la carretera" en los Premios Travolution.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-md hover:border-gray-300">
              <img 
                src="/images/award-lux-leaders.png" 
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
        
        {/* Features Grid Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <img 
                src="/images/business-conference-travel.jpg" 
                alt="B4B Conference/Event Travel Nature Man and Woman" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Facilidad de reserva</h3>
              <p className="text-gray-600 leading-relaxed">
                Priorice el deber de cuidado de sus clientes con nuestros chóferes rigurosamente capacitados y protocolos de higiene.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <img 
                src="/images/female-chauffeur-mercedes-nyc.jpg" 
                alt="B4B Hero Female Chauffeur and Mercedes by New York Skyline" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Global pero local</h3>
              <p className="text-gray-600 leading-relaxed">
                Ofrezca un servicio coherente a nivel mundial con un toque local que garantice comodidad y conveniencia a través de las fronteras.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <img 
                src="/images/cars-sunset.jpg" 
                alt="B4B - Cars Tesla and Mercedes sedan and van next to each other at sunset" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Viajar con compensación de carbono</h3>
              <p className="text-gray-600 leading-relaxed">
                Avances hacia el turismo sostenible al proporcionar la opción de viaje ecológica de los vehículos eléctricos en ciudades seleccionadas.
              </p>
            </div>
          </div>
        </section>
        
        {/* Transform Clients' Travel Section */}
        <section className="mb-32 bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-2xl text-center shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Transforme los viajes de sus clientes</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Asóciese con Operiq y mejore las ofertas de viajes de su agencia.
          </p>
          <button className="select-button h-12 px-8 py-3 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-6">
            Cree su cuenta
          </button>
        </section>
        
        {/* Testimonial Section */}
        <section className="mb-32">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl mb-10 max-w-4xl mx-auto shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md">
            <blockquote className="italic text-xl text-gray-700 mb-4 relative">
              <span className="text-5xl text-red-400 absolute -top-6 -left-2">"</span>
              We especially value the speed of booking and cost efficiency. We always include Operiq in our corporate pitches to new and existing clients. All-around a very, very important supplier to us here.
              <span className="text-5xl text-red-400 absolute -bottom-10 -right-2">"</span>
            </blockquote>
            <p className="text-right font-medium mt-2 text-gray-800">David Strange, Corporate Director, EFR Travel Group</p>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="mb-32">
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
        
        {/* Final Photo Section */}
        <section className="mb-32">
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
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TravelAgencies; 