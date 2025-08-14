import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SupportChat from '../components/SupportChat';
import { useTranslation } from 'react-i18next';
import '../styles/privyde.css';

const OurServices: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCarSlide, setCurrentCarSlide] = useState(0);
  const [clickedBenefit, setClickedBenefit] = useState<number | null>(null);

  // Services data with translations
  const services = [
    {
      id: 1,
      title: t('services.longDistance.title').toUpperCase(),
      subtitle: t('services.longDistance.subtitle'),
      description: t('services.longDistance.description'),
      features: t('services.longDistance.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.longDistance.footer'),
      image: "/images/our_services/servicio_coche_de_larga_distancia.webp"
    },
    {
      id: 2,
      title: t('services.airport.title').toUpperCase(),
      subtitle: t('services.airport.subtitle'),
      description: t('services.airport.description'),
      features: t('services.airport.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.airport.footer'),
      image: "/images/our_services/Traslados en Aeropuertos.webp"
    },
    {
      id: 3,
      title: t('services.hourly.title').toUpperCase(),
      subtitle: t('services.hourly.subtitle'),
      description: t('services.hourly.description'),
      features: t('services.hourly.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.hourly.footer'),
      image: "/images/our_services/Alquiler de choferes por horas.webp"
    },
    {
      id: 4,
      title: t('services.events.title').toUpperCase(),
      subtitle: t('services.events.subtitle'),
      description: t('services.events.description'),
      features: t('services.events.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.events.footer'),
      image: "/images/our_services/Eventos Especiales.webp"
    },
    {
      id: 5,
      title: t('services.corporate.title').toUpperCase(),
      subtitle: t('services.corporate.subtitle'),
      description: t('services.corporate.description'),
      features: t('services.corporate.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.corporate.footer'),
      image: "/images/our_services/Traslados Corporativos VIP.webp"
    },
    {
      id: 6,
      title: t('services.security.title').toUpperCase(),
      subtitle: t('services.security.subtitle'),
      description: t('services.security.description'),
      features: t('services.security.features', { returnObjects: true }) as Array<{title?: string; text: string}>,
      footer: t('services.security.footer'),
      image: "/images/our_services/Seguridad Ejecutiva.webp"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  const currentService = services[currentSlide];

  return (
    <div className="min-h-screen bg-black">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #262626;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #525252;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #737373;
        }
        
        /* Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #525252 #262626;
        }
      `}} />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src="/images/our_services/nuestros_servicios_hero.webp"
            alt="Nuestros Servicios"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - adjusted for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-[50%] md:via-transparent to-black" />
          {/* Extra bottom gradient for deeper black */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full flex items-end pb-8 md:pb-16">
          <div className="container mx-auto px-6 md:px-0 md:ml-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider uppercase text-center md:text-left" style={{ fontFamily: 'CONTHRAX-SB' }}>
              {t('services.hero.title').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index === 0 && <br />}
                </React.Fragment>
              ))}
            </h1>
          </div>
        </div>
      </section>

      {/* Services Slider Section - Mobile */}
      <section className="md:hidden bg-black pt-2">
        <div className="container mx-auto px-6 pb-12">
          <div className="relative">
            {/* Container wrapper for proper spacing */}
            {/* Single unified layout for all services */}
            <div className="relative pt-32">
              {/* Slider Image - Positioned to overlap */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-48 sm:w-56 md:w-64 z-20">
                <img
                  src={currentService.image}
                  alt={currentService.title}
                  className="w-full h-auto object-contain rounded-lg shadow-xl"
                />
              </div>

              {/* Content Container */}
              <div className="bg-neutral-800/90 rounded-lg p-4 pt-16 text-white text-left overflow-hidden">
                <h2 className="text-sm sm:text-base font-bold mb-2 uppercase tracking-wide text-center line-clamp-2" style={{ fontFamily: 'CONTHRAX-SB' }}>
                  {currentService.title}
                </h2>
                
                <p className="text-xs sm:text-sm font-semibold mb-2 text-gray-100 text-left line-clamp-2">
                  {currentService.subtitle}
                </p>
                
                <p className="text-xs text-gray-300 mb-3 leading-relaxed text-left line-clamp-3">
                  {currentService.description}
                </p>
                
                <ul className="space-y-1 mb-3 text-left list-disc pl-4 max-h-32 overflow-y-auto">
                  {currentService.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-300 leading-relaxed text-left">
                      {'title' in feature && feature.title && <span className="font-semibold text-white">{feature.title} </span>}
                      {feature.text}
                    </li>
                  ))}
                </ul>
                
                <p className="text-xs text-gray-400 italic text-left line-clamp-2">
                  {currentService.footer}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 px-2">
              <button
                onClick={prevSlide}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white w-6' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Desktop */}
      <section className="hidden md:block bg-black py-16">
        <div className="space-y-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`relative bg-neutral-800/90 overflow-visible ${
                index % 2 === 0 ? 'mr-20' : 'ml-20'
              }`}
              style={{ height: '400px' }}
            >
              <div className="flex flex-row items-center h-full">
                {index % 2 !== 0 && (
                  /* Image for services 2, 4, 6 - positioned on the left */
                  <div className="absolute left-0 -translate-x-[20%] top-1/2 -translate-y-1/2" style={{ width: '300px' }}>
                    <div className="relative" style={{ margin: '0.5cm 0' }}>
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`${index % 2 === 0 ? 'w-[75%]' : 'w-[65%]'} py-8 lg:py-10 ${index % 2 === 0 ? 'pl-16 lg:pl-24 pr-12 lg:pr-16' : 'pl-60 lg:pl-72 pr-8'} text-left overflow-hidden flex flex-col justify-center h-full`}>
                  <h2 className="text-base lg:text-xl font-bold mb-2 lg:mb-3 text-white uppercase tracking-normal text-left line-clamp-2" style={{ fontFamily: 'CONTHRAX-SB' }}>
                    {service.title}
                  </h2>
                  
                  <p className="text-sm lg:text-base font-semibold mb-2 text-gray-100 text-left line-clamp-2">
                    {service.subtitle}
                  </p>
                  
                  <p className="text-xs text-gray-300 mb-2 lg:mb-3 leading-relaxed text-left line-clamp-3">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-0.5 lg:space-y-1 mb-2 lg:mb-4 text-left max-h-32 lg:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 list-disc pl-4">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-xs text-gray-300 leading-relaxed text-left">
                        {'title' in feature && feature.title && <span className="font-bold text-white">{feature.title} </span>}
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-xs text-gray-400 italic text-left line-clamp-2">
                    {service.footer}
                  </p>
                </div>
                
                {index % 2 === 0 && (
                  /* Image for services 1, 3, 5 - positioned on the right */
                  <div className="absolute right-0 translate-x-[20%] top-1/2 -translate-y-1/2" style={{ width: '300px' }}>
                    <div className="relative" style={{ margin: '0.5cm 0' }}>
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Elige tu auto Section */}
      <section className="relative">
        {/* Image section - half black, half white */}
        <div className="relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-black h-1/2" />
          <div className="absolute inset-0 bg-white h-1/2 top-1/2" />
            
            {/* Image container */}
            <div className="relative h-full flex items-center justify-center">
              <img
                src="/images/benefits/Inicio-Beneficios.webp"
                alt="Elige tu auto"
                className="relative z-10 w-11/12 md:w-4/5 max-w-6xl h-3/4 object-cover rounded-lg shadow-2xl"
              />
              
              {/* Title overlay */}
              <div className="absolute inset-0 flex items-end justify-center z-20 pb-20 md:pb-24">
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-bold text-white uppercase tracking-wider text-center px-4" style={{ fontFamily: 'CONTHRAX-SB' }}>
                  Beneficios de elegir Privyde
                </h2>
              </div>
            </div>
          </div>

          {/* Icons section */}
          <div className="py-16 md:py-20 bg-white">
            <div className="container mx-auto px-6 md:px-12">
            {/* Icons container - Desktop */}
            <div className="hidden md:flex justify-center items-center gap-4 md:gap-8 mb-12">
                {/* Protection Icon */}
                <div className="relative group">
                <img 
                  src="/images/benefits/Iconos_Mesa de trabajo 1.svg" 
                  alt="Protección integral"
                  className="w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform hover:scale-110"
                />
                {/* Hover dialog */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black text-white p-3 rounded-lg shadow-xl w-64">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{t('services.chooseYourCar.fleet.title')}</h4>
                    <p className="text-xs leading-relaxed">{t('services.chooseYourCar.fleet.description')}</p>
                  </div>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>

              {/* Personalized attention Icon */}
              <div className="relative group">
                <img 
                  src="/images/benefits/Iconos-02.svg" 
                  alt="Atención personalizada"
                  className="w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform hover:scale-110"
                />
                {/* Hover dialog */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black text-white p-3 rounded-lg shadow-xl w-64">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{t('services.chooseYourCar.variety.title')}</h4>
                    <p className="text-xs leading-relaxed">{t('services.chooseYourCar.variety.description')}</p>
                  </div>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>

              {/* Premium fleet Icon */}
              <div className="relative group">
                <img 
                  src="/images/benefits/Iconos-03.svg" 
                  alt="Flota premium"
                  className="w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform hover:scale-110"
                />
                {/* Hover dialog */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black text-white p-3 rounded-lg shadow-xl w-64">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{t('services.chooseYourCar.quality.title')}</h4>
                    <p className="text-xs leading-relaxed">{t('services.chooseYourCar.quality.description')}</p>
                  </div>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>

              {/* Technology Icon */}
              <div className="relative group">
                <img 
                  src="/images/benefits/Iconos-04.svg" 
                  alt="Tecnología intuitiva"
                  className="w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform hover:scale-110"
                />
                {/* Hover dialog */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black text-white p-3 rounded-lg shadow-xl w-64">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{t('services.chooseYourCar.booking.title')}</h4>
                    <p className="text-xs leading-relaxed">{t('services.chooseYourCar.booking.description')}</p>
                  </div>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>

              {/* International Icon */}
              <div className="relative group">
                <img 
                  src="/images/benefits/Iconos-05.svg" 
                  alt="Presencia internacional"
                  className="w-20 h-20 md:w-24 md:h-24 cursor-pointer transition-transform hover:scale-110"
                />
                {/* Hover dialog */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black text-white p-3 rounded-lg shadow-xl w-64">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">{t('services.chooseYourCar.worldwide.title')}</h4>
                    <p className="text-xs leading-relaxed">{t('services.chooseYourCar.worldwide.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Icons container - Mobile (vertical with click reveal) */}
            <div className="md:hidden space-y-8 mb-12">
              {/* Icon 1 - Protection */}
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setClickedBenefit(clickedBenefit === 0 ? null : 0)}
                  className="focus:outline-none"
                >
                  <img 
                    src="/images/benefits/Iconos_Mesa de trabajo 1.svg" 
                    alt="Protección integral"
                    className="w-40 h-40 mb-4 cursor-pointer transition-transform active:scale-95"
                  />
                </button>
                {/* Dialog that appears on click */}
                <div className={`transition-all duration-500 ${
                  clickedBenefit === 0 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="mt-2 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg shadow-xl w-72 mx-auto mt-1">
                      <h4 className="font-semibold mb-2 text-base">{t('services.chooseYourCar.fleet.title')}</h4>
                      <p className="text-sm leading-relaxed">{t('services.chooseYourCar.fleet.description')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon 2 - Personalized attention */}
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setClickedBenefit(clickedBenefit === 1 ? null : 1)}
                  className="focus:outline-none"
                >
                  <img 
                    src="/images/benefits/Iconos-02.svg" 
                    alt="Atención personalizada"
                    className="w-40 h-40 mb-4 cursor-pointer transition-transform active:scale-95"
                  />
                </button>
                {/* Dialog that appears on click */}
                <div className={`transition-all duration-500 ${
                  clickedBenefit === 1 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="mt-2 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg shadow-xl w-72 mx-auto mt-1">
                      <h4 className="font-semibold mb-2 text-base">{t('services.chooseYourCar.variety.title')}</h4>
                      <p className="text-sm leading-relaxed">{t('services.chooseYourCar.variety.description')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon 3 - Premium fleet */}
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setClickedBenefit(clickedBenefit === 2 ? null : 2)}
                  className="focus:outline-none"
                >
                  <img 
                    src="/images/benefits/Iconos-03.svg" 
                    alt="Flota premium"
                    className="w-40 h-40 mb-4 cursor-pointer transition-transform active:scale-95"
                  />
                </button>
                {/* Dialog that appears on click */}
                <div className={`transition-all duration-500 ${
                  clickedBenefit === 2 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="mt-2 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg shadow-xl w-72 mx-auto mt-1">
                      <h4 className="font-semibold mb-2 text-base">{t('services.chooseYourCar.quality.title')}</h4>
                      <p className="text-sm leading-relaxed">{t('services.chooseYourCar.quality.description')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon 4 - Technology */}
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setClickedBenefit(clickedBenefit === 3 ? null : 3)}
                  className="focus:outline-none"
                >
                  <img 
                    src="/images/benefits/Iconos-04.svg" 
                    alt="Tecnología intuitiva"
                    className="w-40 h-40 mb-4 cursor-pointer transition-transform active:scale-95"
                  />
                </button>
                {/* Dialog that appears on click */}
                <div className={`transition-all duration-500 ${
                  clickedBenefit === 3 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="mt-2 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg shadow-xl w-72 mx-auto mt-1">
                      <h4 className="font-semibold mb-2 text-base">{t('services.chooseYourCar.booking.title')}</h4>
                      <p className="text-sm leading-relaxed">{t('services.chooseYourCar.booking.description')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon 5 - International */}
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setClickedBenefit(clickedBenefit === 4 ? null : 4)}
                  className="focus:outline-none"
                >
                  <img 
                    src="/images/benefits/Iconos-05.svg" 
                    alt="Presencia internacional"
                    className="w-40 h-40 mb-4 cursor-pointer transition-transform active:scale-95"
                  />
                </button>
                {/* Dialog that appears on click */}
                <div className={`transition-all duration-500 ${
                  clickedBenefit === 4 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  <div className="mt-2 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-black"></div>
                    </div>
                    <div className="bg-black text-white p-4 rounded-lg shadow-xl w-72 mx-auto mt-1">
                      <h4 className="font-semibold mb-2 text-base">{t('services.chooseYourCar.worldwide.title')}</h4>
                      <p className="text-sm leading-relaxed">{t('services.chooseYourCar.worldwide.description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Descubre nuestras clases de servicio Section */}
      <div className="bg-black">
        <section className="relative">
          {/* Image section - half white, half black */}
          <div className="relative h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-white h-1/2" />
            <div className="absolute inset-0 bg-black h-1/2 top-1/2" />
            
            {/* Image container */}
            <div className="relative h-full flex items-center justify-center">
              <img
                src="/images/our_services/nuestras_clases_de_servicio.webp"
                alt="Descubre nuestras clases de servicio"
                className="relative z-10 w-11/12 md:w-4/5 max-w-6xl h-3/4 object-cover rounded-lg shadow-2xl"
              />
              
              {/* Title overlay */}
              <div className="absolute inset-0 flex items-end justify-center z-20 pb-16 md:pb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wider text-center px-4" style={{ fontFamily: 'CONTHRAX-SB' }}>
                  {t('services.serviceClasses.title').split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index === 0 && <br />}
                    </React.Fragment>
                  ))}
                </h2>
              </div>
            </div>
          </div>

          {/* Car Classes Slider Section */}
          <div className="py-16 md:py-24">
            <div className="container mx-auto px-6 md:px-12">
              <div className="relative">
              {/* Car Slider */}
              <div className="relative overflow-hidden pt-24 md:pt-32 max-w-2xl mx-auto">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentCarSlide * 100}%)` }}>
                  {/* Business Class */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="relative">
                      {/* Car Image - Positioned absolutely to overlay */}
                      <div className="absolute -top-20 md:-top-28 left-1/2 transform -translate-x-1/2 w-4/5 z-20">
                        <img
                          src="/images/our_services/bussines.webp"
                          alt="Business Class"
                          className="w-full h-40 md:h-56 object-contain"
                        />
                      </div>
                      
                      {/* White Container for text only */}
                      <div className="bg-white rounded-xl p-6 md:p-8 pt-24 md:pt-32">
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-center uppercase tracking-wide" style={{ fontFamily: 'CONTHRAX-SB' }}>
                          {t('services.serviceClasses.businessClass.title')}
                        </h3>
                        <p className="text-center text-gray-600 mb-4 text-xs md:text-sm font-medium">
                          {t('services.serviceClasses.businessClass.description')}
                        </p>
                        <div className="space-y-2">
                          {(t('services.serviceClasses.businessClass.features', { returnObjects: true }) as string[]).map((feature, index) => (
                            <div key={index} className="flex items-start text-xs text-gray-600 text-left">
                              <span className="mr-2 mt-0.5">•</span>
                              <span className="leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* First Class */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="relative">
                      {/* Car Image - Positioned absolutely to overlay */}
                      <div className="absolute -top-20 md:-top-28 left-1/2 transform -translate-x-1/2 w-4/5 z-20">
                        <img
                          src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&h=400&fit=crop"
                          alt="First Class"
                          className="w-full h-40 md:h-56 object-contain"
                        />
                      </div>
                      
                      {/* White Container for text only */}
                      <div className="bg-white rounded-xl p-6 md:p-8 pt-24 md:pt-32">
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-center uppercase tracking-wide" style={{ fontFamily: 'CONTHRAX-SB' }}>
                          {t('services.serviceClasses.firstClass.title')}
                        </h3>
                        <p className="text-center text-gray-600 mb-4 text-xs md:text-sm font-medium">
                          {t('services.serviceClasses.firstClass.description')}
                        </p>
                        <div className="space-y-2">
                          {(t('services.serviceClasses.firstClass.features', { returnObjects: true }) as string[]).map((feature, index) => (
                            <div key={index} className="flex items-start text-xs text-gray-600 text-left">
                              <span className="mr-2 mt-0.5">•</span>
                              <span className="leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUV Class */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="relative">
                      {/* Car Image - Positioned absolutely to overlay */}
                      <div className="absolute -top-20 md:-top-28 left-1/2 transform -translate-x-1/2 w-4/5 z-20">
                        <img
                          src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=400&fit=crop"
                          alt="SUV Class"
                          className="w-full h-40 md:h-56 object-contain"
                        />
                      </div>
                      
                      {/* White Container for text only */}
                      <div className="bg-white rounded-xl p-6 md:p-8 pt-24 md:pt-32">
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-center uppercase tracking-wide" style={{ fontFamily: 'CONTHRAX-SB' }}>
                          {t('services.serviceClasses.suvClass.title')}
                        </h3>
                        <p className="text-center text-gray-600 mb-4 text-xs md:text-sm font-medium">
                          {t('services.serviceClasses.suvClass.description')}
                        </p>
                        <div className="space-y-2">
                          {(t('services.serviceClasses.suvClass.features', { returnObjects: true }) as string[]).map((feature, index) => (
                            <div key={index} className="flex items-start text-xs text-gray-600 text-left">
                              <span className="mr-2 mt-0.5">•</span>
                              <span className="leading-relaxed">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentCarSlide((prev) => (prev - 1 + 3) % 3)}
                className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setCurrentCarSlide((prev) => (prev + 1) % 3)}
                className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-8 space-x-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentCarSlide ? 'bg-white w-6' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16 md:mt-24">
              <h3 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider mb-8" style={{ fontFamily: 'CONTHRAX-SB' }}>
                {t('services.cta.title')}
              </h3>
              
              {/* Download App Section */}
              <div className="mb-8">
                <p className="text-xl text-white mb-6">
                  {t('services.cta.downloadApp')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <img
                      src="/appstore.png"
                      alt="Download on the App Store"
                      className="h-12 md:h-14"
                    />
                  </a>
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <img
                      src="/googleplay.png"
                      alt="Get it on Google Play"
                      className="h-12 md:h-14"
                    />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>

      {/* Phone Mockup Overlap - Positioned for Footer */}
      <div className="relative hidden lg:block">
        <div className="absolute right-0 bottom-0 transform translate-y-2/3 z-30">
          <div className="relative w-[700px] xl:w-[800px] 2xl:w-[900px]">
            <div className="relative">
              <img
                src="/images/smartphone_14_pro_31.webp"
                alt="Privyde App"
                className="w-full h-auto"
              />
              {/* White gradient overlay for bottom-left corner */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Radial gradient for corner */}
                <div 
                  className="absolute -bottom-20 -left-20 w-96 h-96"
                  style={{
                    background: 'radial-gradient(circle at center, white 0%, rgba(255,255,255,0.9) 15%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                  }}
                ></div>
                {/* Linear gradient for bottom edge */}
                <div 
                  className="absolute bottom-0 left-0 w-2/3 h-40"
                  style={{
                    background: 'linear-gradient(to top, white 0%, rgba(255,255,255,0.8) 30%, transparent 100%)',
                    transform: 'translateY(50%)'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Support Chat */}
      <SupportChat />
    </div>
  );
};

export default OurServices;