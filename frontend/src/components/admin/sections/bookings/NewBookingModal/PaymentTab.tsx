import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { priceCalculationService } from "@/services/priceCalculationService";

type PaymentTabProps = {
  newBookingFormData: any;
  handleFormChange: (section: string, field: string, value: any) => void;
  setActiveTab: (tab: any) => void;
  handleSubmitNewBooking: () => void;
};

const PaymentTab = ({
  newBookingFormData,
  handleFormChange,
  setActiveTab,
  handleSubmitNewBooking
}: PaymentTabProps) => {
  // Comprobar si hay un precio calculado
  const hasPriceCalculated = !!newBookingFormData.payment?.priceBreakdown;
  
  // Formatear distancia y duración
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} h ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
    }
    
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6 mt-4">
      {hasPriceCalculated ? (
        <div className="border rounded-lg bg-white p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Desglose de la Tarifa
          </h3>
          
          <div className="space-y-4">
            {/* Información del viaje */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información del viaje</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Origen:</div>
                  <div className="font-medium">{newBookingFormData.service.pickup.location}</div>
                </div>
                <div>
                  <div className="text-gray-500">Destino:</div>
                  <div className="font-medium">{newBookingFormData.service.dropoff.location}</div>
                </div>
                <div>
                  <div className="text-gray-500">Tipo de servicio:</div>
                  <div className="font-medium">
                    {newBookingFormData.service.type === 'one_way' ? 'Un trayecto' : 
                     newBookingFormData.service.type === 'round_trip' ? 'Ida y vuelta' : 
                     newBookingFormData.service.type === 'hourly' ? 'Por horas' : 'Día completo'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Distancia:</div>
                  <div className="font-medium">
                    {newBookingFormData.payment.priceBreakdown.is_round_trip ? (
                      <>
                        {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)}
                        <div className="text-xs text-gray-400">
                          ({priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.one_way_distance_km || 0)} × 2)
                        </div>
                      </>
                    ) : (
                      priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Tiempo estimado:</div>
                  <div className="font-medium">
                    {formatDuration(newBookingFormData.payment.routeInfo.duration)}
                    {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                      <div className="text-xs text-gray-400">
                        (Solo ida, vuelta similar)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detalles del vehículo */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vehículo seleccionado</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Vehículo:</div>
                  <div className="font-medium">{newBookingFormData.vehicle.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Conductor:</div>
                  <div className="font-medium">{newBookingFormData.driver?.name || "Pendiente de asignar"}</div>
                </div>
              </div>
            </div>
            
            {/* Desglose de precios */}
            <div className="border p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Desglose de la tarifa</h4>
              
              {/* Mensaje especial para ida y vuelta */}
              {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400 text-sm">
                  <div className="font-medium text-blue-800 mb-1">Viaje de ida y vuelta</div>
                  <div className="text-blue-700">
                    El precio incluye tanto el trayecto de ida como el de vuelta. La distancia total calculada 
                    es de {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)}.
                  </div>
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarifa base:</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.base_fare)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Cargo por distancia
                    {newBookingFormData.payment.priceBreakdown.is_round_trip && " (ida y vuelta)"}:
                  </span>
                  <div className="text-right">
                    <div>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.distance_charge)}</div>
                    {newBookingFormData.payment.priceBreakdown.is_round_trip && (
                      <div className="text-xs text-gray-400">
                        {priceCalculationService.formatDistance(newBookingFormData.payment.priceBreakdown.total_distance_km)} total
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span>Subtotal:</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA ({newBookingFormData.payment.priceBreakdown.tax_percentage}%):</span>
                  <span>{priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.tax_amount)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-3 mt-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-red-600">
                  {priceCalculationService.formatPrice(newBookingFormData.payment.priceBreakdown.total)}
                </span>
              </div>
            </div>
            
            {/* Método de pago */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Método de pago</h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    className="form-radio text-red-600" 
                    name="payment_method"
                    checked={newBookingFormData.payment.method === 'credit_card'}
                    onChange={() => handleFormChange('payment', 'method', 'credit_card')}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-sm">Tarjeta de crédito</div>
                    <div className="text-xs text-gray-500">El cliente pagará con tarjeta de crédito al finalizar el viaje</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    className="form-radio text-red-600" 
                    name="payment_method"
                    checked={newBookingFormData.payment.method === 'cash'}
                    onChange={() => handleFormChange('payment', 'method', 'cash')}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-sm">Efectivo</div>
                    <div className="text-xs text-gray-500">El cliente pagará en efectivo al conductor</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    className="form-radio text-red-600" 
                    name="payment_method"
                    checked={newBookingFormData.payment.method === 'invoice'}
                    onChange={() => handleFormChange('payment', 'method', 'invoice')}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-sm">Facturación</div>
                    <div className="text-xs text-gray-500">Se emitirá una factura para pago posterior</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    className="form-radio text-red-600" 
                    name="payment_method" 
                    checked={newBookingFormData.payment.method === 'corporate_account'}
                    onChange={() => handleFormChange('payment', 'method', 'corporate_account')}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-sm">Cuenta corporativa</div>
                    <div className="text-xs text-gray-500">Cargo a la cuenta corporativa del cliente</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">No hay tarifa calculada</h3>
              <p className="text-amber-700 mt-1">
                No se ha calculado ninguna tarifa para este servicio. Por favor, vuelva a la pestaña de Servicio y seleccione 
                un vehículo y un destino para calcular la tarifa.
              </p>
              <Button
                variant="outline"
                className="mt-3 text-sm"
                onClick={() => setActiveTab('service')}
              >
                Volver a la selección de servicio
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setActiveTab('details')}
          className="text-sm"
        >
          Anterior: Detalles
        </Button>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-sm"
          onClick={handleSubmitNewBooking}
          disabled={!hasPriceCalculated}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Completar reserva
        </Button>
      </div>
    </div>
  );
};

export default PaymentTab; 