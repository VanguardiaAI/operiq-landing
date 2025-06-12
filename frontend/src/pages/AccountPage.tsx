import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Edit, X } from "lucide-react";

// Definir el tipo para los modales
type ModalField = 'name' | 'email' | 'phone' | 'company' | 'address' | 'password' | 'marketing' | 'notifications' | null;

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalField>(null);
  
  // Estados para los formularios de edición
  const [nameForm, setNameForm] = useState({
    title: user?.profile?.title || '',
    first_name: user?.profile?.first_name || '',
    last_name: user?.profile?.last_name || '',
  });
  
  const [phoneForm, setPhoneForm] = useState({
    country_code: user?.profile?.country_code || '',
    phone: user?.profile?.phone || '',
  });
  
  const [companyForm, setCompanyForm] = useState({
    company: user?.profile?.company || '',
  });
  
  const [addressForm, setAddressForm] = useState({
    address: user?.profile?.address || '',
  });
  
  // Estado para mostrar mensajes de éxito o error
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Función para abrir modal
  const openModal = (field: ModalField) => {
    setActiveModal(field);
    setSaveMessage(null);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setActiveModal(null);
    setSaveMessage(null);
  };

  // Función para manejar cambios en el formulario de nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en el formulario de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPhoneForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en el formulario de empresa
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyForm({
      company: e.target.value
    });
  };

  // Función para manejar cambios en el formulario de dirección
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddressForm({
      address: e.target.value
    });
  };

  // Función para guardar cambios del nombre
  const saveNameChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        title: nameForm.title,
        first_name: nameForm.first_name,
        last_name: nameForm.last_name
      });
      setSaveMessage({
        type: 'success',
        text: 'Nombre actualizado con éxito'
      });
      
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Error al actualizar el nombre'
      });
    }
  };

  // Función para guardar cambios del teléfono
  const savePhoneChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        country_code: phoneForm.country_code,
        phone: phoneForm.phone
      });
      setSaveMessage({
        type: 'success',
        text: 'Teléfono actualizado con éxito'
      });
      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Error al actualizar el teléfono'
      });
    }
  };

  // Función para guardar cambios de la empresa
  const saveCompanyChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        company: companyForm.company
      });
      setSaveMessage({
        type: 'success',
        text: 'Empresa actualizada con éxito'
      });
      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Error al actualizar la empresa'
      });
    }
  };

  // Función para guardar cambios de la dirección
  const saveAddressChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        address: addressForm.address
      });
      setSaveMessage({
        type: 'success',
        text: 'Dirección actualizada con éxito'
      });
      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Error al actualizar la dirección'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-white pb-16">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Cuenta</h1>
                      <p className="text-gray-600 mb-8">Gestione su información para que Privyde satisfaga sus necesidades.</p>
          
          {/* Información personal */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información personal</h2>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Nombre */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Nombre</div>
                  <div className="font-medium">{user?.profile?.title || ''} {user?.profile?.first_name || ''} {user?.profile?.last_name || ''}</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('name')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              {/* Email */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('email')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              {/* Teléfono móvil */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Teléfono móvil</div>
                  <div className="font-medium">{user?.profile?.country_code || ''}{user?.profile?.phone || ''}</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('phone')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              {/* Empresa */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Empresa</div>
                  <div className="font-medium">{user?.profile?.company || '—'}</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('company')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              {/* Dirección */}
              <div className="flex justify-between items-center p-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="font-medium">{user?.profile?.address || '—'}</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('address')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Contraseña */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contraseña</h2>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Contraseña</div>
                  <div className="font-medium">••••••••••••••</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('password')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Pago */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pago</h2>
            
            <button className="w-full border border-gray-300 rounded-md py-3 px-4 text-center flex items-center justify-center hover:bg-gray-50">
              <span className="text-gray-700 font-medium">+ Añadir nueva tarjeta</span>
            </button>
          </div>
          
          {/* Promociones */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Promociones</h2>
            <p className="text-gray-600">No hay vales disponibles en su cuenta en este momento.</p>
          </div>
          
          {/* Notificaciones */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notificaciones</h2>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Correos de marketing */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Correos electrónicos de marketing</div>
                  <div className="font-medium">On</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('marketing')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              
              {/* Notificaciones de reserva */}
              <div className="flex justify-between items-center p-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Notificaciones de reserva</div>
                  <div className="font-medium">Activado: Correo electrónico y SMS</div>
                </div>
                <button 
                  className="p-2 text-gray-600 hover:text-black"
                  onClick={() => openModal('notifications')}
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Borrar cuenta */}
          <button className="w-full border border-gray-300 rounded-md py-3 px-4 text-center mb-8 hover:bg-gray-50">
            <span className="text-gray-700 font-medium">Borrar mi cuenta</span>
          </button>
        </div>
      </main>
      
      {/* Modal de Edición */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Editar Nombre */}
            {activeModal === 'name' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Editar nombre</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={saveNameChanges} className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <select
                      name="title"
                      value={nameForm.title}
                      onChange={handleNameChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Sr">Sr.</option>
                      <option value="Sra">Sra.</option>
                      <option value="Dr">Dr.</option>
                      <option value="Dra">Dra.</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      value={nameForm.first_name}
                      onChange={handleNameChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      value={nameForm.last_name}
                      onChange={handleNameChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {saveMessage && (
                    <div className={`p-2 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {saveMessage.text}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all duration-150 ease-in-out"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Editar Email (solo informativo) */}
            {activeModal === 'email' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Correo electrónico</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    No es posible cambiar el correo electrónico asociado a tu cuenta.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Si necesitas usar una dirección diferente, deberás crear una nueva cuenta.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Editar Teléfono */}
            {activeModal === 'phone' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Editar teléfono</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={savePhoneChanges} className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de país</label>
                    <input
                      type="text"
                      name="country_code"
                      value={phoneForm.country_code}
                      onChange={handlePhoneChange}
                      placeholder="+34"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={phoneForm.phone}
                      onChange={handlePhoneChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {saveMessage && (
                    <div className={`p-2 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {saveMessage.text}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all duration-150 ease-in-out"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Editar Empresa */}
            {activeModal === 'company' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Editar empresa</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={saveCompanyChanges} className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                    <input
                      type="text"
                      value={companyForm.company}
                      onChange={handleCompanyChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {saveMessage && (
                    <div className={`p-2 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {saveMessage.text}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all duration-150 ease-in-out"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Editar Dirección */}
            {activeModal === 'address' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Editar dirección</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={saveAddressChanges} className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
                    <textarea
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {saveMessage && (
                    <div className={`p-2 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-gray-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {saveMessage.text}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all duration-150 ease-in-out"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Otros modales se pueden implementar de manera similar */}
            {activeModal === 'password' && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Cambiar contraseña</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Esta funcionalidad no está implementada en esta versión.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {(activeModal === 'marketing' || activeModal === 'notifications') && (
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold">Editar preferencias de notificaciones</h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Esta funcionalidad no está implementada en esta versión.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
} 