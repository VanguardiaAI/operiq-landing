import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Image from "@/components/ui/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/booking-form";
import DownloadSection from "@/components/download-section";
import { ChevronDown, ChevronUp, Clock, Map, Shield, DollarSign, Wifi, CalendarCheck, Star } from "lucide-react";

const HourlyHire = () => {
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
      question: "¿Cómo reservo un chófer por horas?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Solo tienes que reservar tu chófer por horas arriba o en nuestra aplicación:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Selecciona el lugar de recogida.</li>
            <li>Elige la duración, el día y la hora de inicio.</li>
            <li>Elige una clase de vehículo que se adapte a tus necesidades.</li>
            <li>Proporciona información adicional, como el itinerario, en el campo «Notas para el chófer».</li>
            <li>¡Completa tu reserva y disfruta de tu chófer privado!</li>
          </ol>
        </div>
      ),
    },
    {
      question: "¿Cómo puedo crear un itinerario para el trayecto por horas?",
      answer: (
        <p className="text-gray-600">
          Aunque no es necesario revelar tu itinerario con antelación, puedes agregarlo en el campo «Notas para el chófer».
        </p>
      ),
    },
    {
      question: "¿Cuándo recibiré los datos de contacto del chófer?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">El nombre y el número de teléfono del chófer se enviarán al pasajero una hora antes de la recogida por correo electrónico y SMS. Este mensaje también contiene la marca, el modelo y el número de matrícula del vehículo. Si has realizado una reserva para otra persona, esta información se enviará a la dirección de correo electrónico y al número de teléfono proporcionados en el proceso de reserva.</p>
          <p>Una hora antes de un viaje, los pasajeros también pueden iniciar un chat con su chófer en nuestra aplicación.</p>
        </div>
      ),
    },
    {
      question: "¿Cómo me comunico con el chófer entre paradas?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Para mayor facilidad, recomendamos descargar la aplicación y utilizar la función de chat.</p>
          <p>Alternativamente, puedes ponerte en contacto con el chófer a través del número de teléfono que te enviaremos una hora antes de la recogida por correo electrónico y SMS.</p>
        </div>
      ),
    },
    {
      question: "¿El chófer habla inglés?",
      answer: (
        <p className="text-gray-600">
          Los chóferes de Operiq hablan inglés básico, así como el idioma local del país en el que se realiza el viaje.
        </p>
      ),
    },
    {
      question: "¿Puede el chófer recogerme en una ciudad y dejarme en otra?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Sí, esto es posible.</p>
          <p className="mb-2">Sin embargo, si tu reserva por hora termina en una ciudad diferente a aquella en la que comenzaste, se aplicará un cargo por devolución del vehículo. Esto tiene en cuenta el tiempo y la distancia que el chófer debe recorrer para volver al lugar original. Si planeas viajar entre ciudades, te recomendamos reservar un viaje de ciudad a ciudad.</p>
          <p>Si necesitas un chófer durante varios días, ponte en contacto con el servicio de atención al cliente a través de chat o correo electrónico en service@operiq.com.</p>
        </div>
      ),
    },
    {
      question: "¿Durante cuántas horas puedo reservar un chófer por horas?",
      answer: (
        <p className="text-gray-600">
          Puedes reservar un chófer el número de horas que quieras, con una reserva mínima de 2 horas y máxima de 24 horas.
        </p>
      ),
    },
    {
      question: "¿Puedo ampliar el número de horas que he reservado?",
      answer: (
        <p className="text-gray-600">
          Sí, si necesitas al chófer durante algún tiempo más, hazlo saber. Si se acepta, se cobrará ese tiempo adicional directamente a tu cuenta.
        </p>
      ),
    },
    {
      question: "What if the number of booked hours changes and the booking is unexpectedly extended or shortened?",
      answer: (
        <div className="text-gray-600">
          <p className="mb-2">Unexpected events can happen.</p>
          <p>If the number of booked hours is extended, extra time is charged in half hour increments. If the number of booked hours is shortened, unfortunately, no reimbursement applies. Please see section 5.2 of our T&C's.</p>
        </div>
      ),
    },
    {
      question: "¿Puedo añadir plazas para niños a la reserva?",
      answer: (
        <p className="text-gray-600">
          Sí, esto es posible. Añade las plazas infantiles necesarias en el campo «Notas para el chófer»; haremos lo posible por organizar las plazas infantiles de antemano.
        </p>
      ),
    },
  ];

  // Testimonios de clientes
  const testimonials = [
    {
      country: "Estados Unidos",
      text: "I had a driver for four hours, and he went above and beyond—helping with my bags when I went shopping, taking photos, and stopping at all the places I wanted to see. It made the whole experience so enjoyable and seamless.",
      stars: 5,
      source: "iOS app store"
    },
    {
      country: "Portugal",
      text: "The chauffeurs are not mere drivers but highly trained professionals, making every journey a delight. Whether you're off to a crucial meeting or heading to the airport, Operiq ensures you arrive relaxed and on time.",
      stars: 5,
      source: "iOS app store"
    },
    {
      country: "Canadá",
      text: "Operiq… the app all travelers need to know about! I am delighted by this app and the service it provides. Hourly or point-to-point service at the touch of a button. Haven't found a place where it doesn't work yet.",
      stars: 5,
      source: "iOS app store"
    }
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
              Alquiler de chófer por horas y por días
            </h1>
          </div>
        </div>

        {/* Image Container */}
        <div className="hero-container relative">
          {/* Background Image */}
          <div className="full-size-background">
            <Image
              src="/images/chauffeur-per-hours.png"
              alt="El chófer mantiene abierta la puerta del coche para el invitado que se acerca al vehículo."
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

      {/* Freedom Banner */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Disfruta de la libertad absoluta</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nuestro servicio de chófer por horas o un día completo te proporciona un transporte a medida seguro, fiable y sostenible.
          </p>
        </div>
      </div>

      {/* Download Section */}
      <DownloadSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-6xl">
        {/* Service Description */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Servicio de chófer por hora</h2>
              <p className="text-lg text-gray-600 mb-8">
                Dile adiós a cambiar de medio de transporte cuando necesites realizar viajes con varias paradas. Ya no tendrás que esperar diferentes taxis en diferentes lugares, subir al transporte público abarrotado o buscar aparcamiento para tu coche de alquiler.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <CalendarCheck className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Establece el itinerario</h3>
                    <p className="text-gray-600">Tú decides dónde y cuándo ir, sabiendo que tu chófer siempre estará listo cuando quieras.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <Clock className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ahorra tiempo</h3>
                    <p className="text-gray-600">Recupera tiempo dejándote y recogiéndote en la puerta en cada parada de tu viaje.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Disfruta de tu tranquilidad</h3>
                    <p className="text-gray-600">Viaja cómodamente en un vehículo premium, donde puedes dejar tus objetos personales durante el viaje.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <DollarSign className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Tarifas competitivas</h3>
                    <p className="text-gray-600">Tu reserva incluye 20 km de viaje por cada hora reservada, así como todos los impuestos y peajes.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <Star className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fiabilidad</h3>
                    <p className="text-gray-600">Nuestros chóferes están capacitados para cumplir con los más altos estándares de calidad y privacidad.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Sostenibilidad</h3>
                    <p className="text-gray-600">Ten la seguridad de que cada viaje se compensa con emisiones de carbono, sin costes adicionales ni necesidad de suscripción.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-50 p-2 rounded-full mt-1 mr-4">
                    <Wifi className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Wi-Fi disponible</h3>
                    <p className="text-gray-600">Ya sea en viaje de negocios o de placer, puedes aprovechar al máximo tu tiempo en el asiento trasero.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <img 
                src="/images/graphic-comparision.png" 
                alt="By-the-hour comparison graphic" 
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* For all your trips */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/white-suite.png" 
                alt="A Operiq chauffeur opens the door for his guest who steps out in a white suit."
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Para todos tus viajes</h2>
              <p className="text-lg text-gray-600 mb-8">
                Conveniente, cómodo y flexible. Nuestro servicio de chófer por horas está diseñado para aquellas ocasiones en las que quieres que te aguarde un chófer.
              </p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Viajes de negocios</h3>
                  <p className="text-gray-600">
                    Aprovecha al máximo tus citas de negocios. No hay necesidad de preocuparse por la logística, los tiempos de espera o las prisas de ir de un lugar a otro cuando se tiene un día lleno de reuniones, una presentación itinerante, etc.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Actividades de ocio</h3>
                  <p className="text-gray-600">
                    Hacer turismo, ir de compras, disfrutar de una cena elegante. Es fácil alternar entre todos tus compromisos gracias a un servicio de chófer privado por horas.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Eventos</h3>
                  <p className="text-gray-600">
                    El espectáculo no termina hasta que tú lo digas. Para grandes partidos, estrenos, galas, conciertos y mucho más, ten tu coche esperando y no tendrás que competir con cientos de personas para poder ir a casa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global reach */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Alcance global</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Con chóferes profesionales en cientos de ciudades de más de 50 países, puedes hacer reservas por horas para todos tus viajes. Dondequiera que vayas, puedes esperar la misma experiencia de primera calidad.
            </p>
          </div>
          
          <div className="flex justify-center mb-12">
            <img 
              src="/images/futuristic-city-choffer.jpeg" 
              alt="A map showing the many countries where Operiq in available."
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-500 text-sm">{testimonial.source}</span>
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">{testimonial.country}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 relative">
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

        {/* App Download Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/woman-in-a-suit-walking.jpeg" 
                alt="A woman in a suit walking away from her Operiq ride."
                className="w-full h-auto rounded-xl shadow-lg object-cover"
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Descargue la aplicación
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Reserve, cambie o cancele fácilmente los viajes sobre la marcha. Piense en ello como tener la tranquilidad al alcance de la mano.
              </p>
              
              <div className="flex justify-center md:justify-start">
                <img 
                  src="/images/app-screen.png" 
                  alt="Pantalla de inicio de la aplicación Operiq"
                  className="max-w-xs h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HourlyHire; 