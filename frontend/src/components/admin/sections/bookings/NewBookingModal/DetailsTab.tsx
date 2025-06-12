import { Button } from "@/components/ui/button";

type DetailsTabProps = {
  newBookingFormData: any;
  handleFormChange: (section: string, field: string, value: any) => void;
  setActiveTab: (tab: 'client' | 'service' | 'details' | 'payment') => void;
  handleNextTab: (currentTab: 'client' | 'service' | 'details') => void;
};

const DetailsTab = ({
  newBookingFormData,
  handleFormChange,
  setActiveTab,
  handleNextTab
}: DetailsTabProps) => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de pasajeros</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={newBookingFormData.details.passengers}
            onChange={(e) => handleFormChange('details', 'passengers', parseInt(e.target.value))}
            placeholder="Número de pasajeros"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipaje (piezas)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={newBookingFormData.details.luggage}
            onChange={(e) => handleFormChange('details', 'luggage', parseInt(e.target.value))}
            placeholder="Cantidad de equipaje"
            min="0"
          />
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Preferencias de vehículo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={newBookingFormData.details.vehicleCategory as any}
              onChange={(e) => handleFormChange('details', 'vehicleCategory' as any, e.target.value)}
            >
              <option value="">Sin preferencia</option>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first_class">First Class</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="business_van">Business Van</option>
              <option value="armored">Blindado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={newBookingFormData.details.vehicleColor as any}
              onChange={(e) => handleFormChange('details', 'vehicleColor' as any, e.target.value)}
            >
              <option value="">Sin preferencia</option>
              <option value="black">Negro</option>
              <option value="white">Blanco</option>
              <option value="silver">Plateado</option>
              <option value="gray">Gris</option>
              <option value="blue">Azul</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Características adicionales</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="inline-flex items-center text-sm">
              <input 
                type="checkbox" 
                className="form-checkbox text-gray-600 rounded"
                checked={(newBookingFormData.details.features as any)?.includes('wifi')}
                onChange={(e) => {
                  const features = [...((newBookingFormData.details.features as any) || [])];
                  if (e.target.checked) {
                    features.push('wifi');
                  } else {
                    const index = features.indexOf('wifi');
                    if (index > -1) features.splice(index, 1);
                  }
                  handleFormChange('details', 'features' as any, features);
                }}
              />
              <span className="ml-2">WiFi</span>
            </label>
            <label className="inline-flex items-center text-sm">
              <input 
                type="checkbox" 
                className="form-checkbox text-gray-600 rounded"
                checked={(newBookingFormData.details.features as any)?.includes('child_seat')}
                onChange={(e) => {
                  const features = [...((newBookingFormData.details.features as any) || [])];
                  if (e.target.checked) {
                    features.push('child_seat');
                  } else {
                    const index = features.indexOf('child_seat');
                    if (index > -1) features.splice(index, 1);
                  }
                  handleFormChange('details', 'features' as any, features);
                }}
              />
              <span className="ml-2">Asiento infantil</span>
            </label>
            <label className="inline-flex items-center text-sm">
              <input 
                type="checkbox" 
                className="form-checkbox text-gray-600 rounded"
                checked={(newBookingFormData.details.features as any)?.includes('premium_audio')}
                onChange={(e) => {
                  const features = [...((newBookingFormData.details.features as any) || [])];
                  if (e.target.checked) {
                    features.push('premium_audio');
                  } else {
                    const index = features.indexOf('premium_audio');
                    if (index > -1) features.splice(index, 1);
                  }
                  handleFormChange('details', 'features' as any, features);
                }}
              />
              <span className="ml-2">Audio premium</span>
            </label>
            <label className="inline-flex items-center text-sm">
              <input 
                type="checkbox" 
                className="form-checkbox text-gray-600 rounded"
                checked={(newBookingFormData.details.features as any)?.includes('climate_control')}
                onChange={(e) => {
                  const features = [...((newBookingFormData.details.features as any) || [])];
                  if (e.target.checked) {
                    features.push('climate_control');
                  } else {
                    const index = features.indexOf('climate_control');
                    if (index > -1) features.splice(index, 1);
                  }
                  handleFormChange('details', 'features' as any, features);
                }}
              />
              <span className="ml-2">Control de clima</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Notas y peticiones especiales</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas especiales</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={newBookingFormData.details.specialNotes}
            onChange={(e) => handleFormChange('details', 'specialNotes', e.target.value)}
            placeholder="Instrucciones especiales, peticiones o información adicional"
            rows={4}
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={() => setActiveTab('service')}
          className="text-sm"
        >
          Anterior: Servicio
        </Button>
        <Button 
          className="bg-black hover:bg-gray-800 text-sm"
          onClick={() => handleNextTab('details')}
        >
          Siguiente: Pago
        </Button>
      </div>
    </div>
  );
};

export default DetailsTab; 