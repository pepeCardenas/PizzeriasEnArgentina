'use client';

import { useState, useEffect } from 'react';
import { City } from '../types';

interface SubmissionFormProps {
  cities: City[];
}

export default function SubmissionForm({ cities }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
    preferredPizzaType: '',
    howDidYouFindUs: '',
    newsletterConsent: false,
    userAgent: '',
    screenSize: '',
    timezone: '',
    referrer: '',
    ipAddress: '',
    visitTime: new Date().toISOString()
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Capture browser information on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'direct'
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar el formulario');
      }
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        message: '',
        preferredPizzaType: '',
        howDidYouFindUs: '',
        newsletterConsent: false,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct',
        ipAddress: '',
        visitTime: new Date().toISOString()
      });
    } catch (error) {
      setSubmitError('Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pizzaTypes = [
    'Pizza a la piedra',
    'Pizza al molde',
    'Fugazzeta',
    'Fugazzeta rellena',
    'Muzzarella',
    'Calabresa',
    'Napolitana',
    'Otro'
  ];

  const referralSources = [
    'Búsqueda en Google',
    'Redes sociales',
    'Recomendación',
    'Publicidad',
    'Otro'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="h-2 bg-red-500 rounded-t-lg -mt-6 -mx-6 mb-6"></div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Envíanos tu Información</h2>
      
      {submitSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>¡Gracias por tu mensaje! Hemos recibido tu información correctamente.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{submitError}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-900 font-bold mb-2 text-lg">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base"
              required
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-900 font-bold mb-2 text-lg">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base"
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-900 font-bold mb-2 text-lg">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base"
              placeholder="(Opcional) Tu número de teléfono"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-900 font-bold mb-2 text-lg">
              Ciudad
            </label>
            <div className="relative">
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base appearance-none bg-white"
              >
                <option value="">Selecciona una ciudad</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}, {city.province}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="preferredPizzaType" className="block text-gray-900 font-bold mb-2 text-lg">
              Tipo de Pizza Favorita
            </label>
            <div className="relative">
              <select
                id="preferredPizzaType"
                name="preferredPizzaType"
                value={formData.preferredPizzaType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base appearance-none bg-white"
              >
                <option value="">Selecciona un tipo</option>
                {pizzaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="howDidYouFindUs" className="block text-gray-900 font-bold mb-2 text-lg">
              ¿Cómo nos encontraste?
            </label>
            <div className="relative">
              <select
                id="howDidYouFindUs"
                name="howDidYouFindUs"
                value={formData.howDidYouFindUs}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base appearance-none bg-white"
              >
                <option value="">Selecciona una opción</option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-900 font-bold mb-2 text-lg">
              Mensaje <span className="text-red-600">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-base"
              required
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="newsletterConsent"
                checked={formData.newsletterConsent}
                onChange={handleCheckboxChange}
                className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-900 text-base">
                Quiero recibir noticias y ofertas sobre pizzerías en mi zona
              </span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-700 text-white font-bold py-3 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      )}
    </div>
  );
}
