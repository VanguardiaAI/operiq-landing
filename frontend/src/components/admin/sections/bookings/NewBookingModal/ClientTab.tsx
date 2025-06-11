import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type ClientTabProps = {
  newBookingFormData: any;
  validationErrors: any;
  handleFormChange: (section: string, field: string, value: any) => void;
  handleSearchClient: (query: string) => void;
  handleSelectClient: (client: any) => void;
  clientSearchResults: any[];
  isSearchingClient: boolean;
  handleNextTab: (currentTab: 'client' | 'service' | 'details') => void;
};

const ClientTab = ({
  newBookingFormData,
  validationErrors,
  handleFormChange,
  handleSearchClient,
  handleSelectClient,
  clientSearchResults,
  isSearchingClient,
  handleNextTab
}: ClientTabProps) => {
  return (
    <div className="mt-4">
      <div className="bg-gray-50 rounded-md p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Buscar cliente existente</h3>
        <div className="relative">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Buscar por nombre o email..."
              onChange={(e) => handleSearchClient(e.target.value)}
            />
            {isSearchingClient && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        
          {clientSearchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
              {clientSearchResults.map(client => (
                <div 
                  key={client.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{client.email}</span> • <span>{client.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">Busca primero si el cliente ya existe en el sistema</p>
      </div>
    
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border ${validationErrors['client.name'] ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
              value={newBookingFormData.client.name}
              onChange={(e) => handleFormChange('client', 'name', e.target.value)}
              placeholder="Ingrese el nombre del cliente"
            />
            {validationErrors['client.name'] && (
              <p className="text-red-500 text-xs mt-1">{validationErrors['client.name']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className={`w-full px-3 py-2 border ${validationErrors['client.email'] ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
              value={newBookingFormData.client.email}
              onChange={(e) => handleFormChange('client', 'email', e.target.value)}
              placeholder="Ingrese el email del cliente"
            />
            {validationErrors['client.email'] && (
              <p className="text-red-500 text-xs mt-1">{validationErrors['client.email']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              className={`w-full px-3 py-2 border ${validationErrors['client.phone'] ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
              value={newBookingFormData.client.phone}
              onChange={(e) => handleFormChange('client', 'phone', e.target.value)}
              placeholder="Ingrese el teléfono del cliente"
            />
            {validationErrors['client.phone'] && (
              <p className="text-red-500 text-xs mt-1">{validationErrors['client.phone']}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          className="bg-red-600 hover:bg-red-700 text-sm"
          onClick={() => handleNextTab('client')}
        >
          Siguiente: Servicio
        </Button>
      </div>
    </div>
  );
};

export default ClientTab; 