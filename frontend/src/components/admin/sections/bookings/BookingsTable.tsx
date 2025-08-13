import { useState } from "react";
import { bookingService } from "@/services/bookingService";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type BookingsTableProps = {
  bookingsData: any[];
  handleViewBookingDetails: (booking: any) => void;
  activeTab?: 'active' | 'history';
  onTabChange?: (tab: 'active' | 'history') => void;
  stats?: {
    active: number;
    history: number;
  };
  onRefresh?: () => void;
};

const BookingsTable = ({
  bookingsData,
  handleViewBookingDetails,
  activeTab = 'active',
  onTabChange,
  stats,
  onRefresh
}: BookingsTableProps) => {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusChange = async (booking: any, newStatus: string) => {
    if (updatingStatus) return;
    
    try {
      setUpdatingStatus(booking.id);
      await bookingService.updateBookingStatus(booking.id, newStatus);
      
      toast({
        title: "Estado actualizado",
        description: `El estado de la reserva ${booking.id} ha sido actualizado a ${getStatusLabel(newStatus)}.`,
      });
      
      // Refresh the bookings list
      onRefresh?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la reserva.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: { [key: string]: string } = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      in_progress: "En progreso",
      completed: "Completado",
      cancelled: "Cancelado",
      no_show: "No show"
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "no_show":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["in_progress", "cancelled", "no_show"];
      case "in_progress":
        return ["completed", "cancelled"];
      case "completed":
        return []; // No transitions from completed
      case "cancelled":
        return ["confirmed"]; // Can reactivate if needed
      case "no_show":
        return ["confirmed"]; // Can reactivate if needed
      default:
        return [];
    }
  };
  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden"
      data-oid="28hp2ms"
    >
      <div className="px-6 py-4 border-b border-gray-200" data-oid="nboxx7g">
        <div className="flex space-x-4" data-oid="jdwfp2b">
          <button
            className={`text-sm px-3 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-gray-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange?.('active')}
            data-oid="58lw8y9"
          >
            Reservas activas ({stats?.active || 0})
          </button>
          <button
            className={`text-sm px-3 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-gray-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTabChange?.('history')}
            data-oid="gkrrfis"
          >
            Historial ({stats?.history || 0})
          </button>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="overflow-x-auto" data-oid="nz4nhlb">
        <table className="w-full" data-oid="i9ztn.y">
          <thead className="bg-gray-50" data-oid="i_dheuc">
            <tr data-oid="gxkowdf">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="2p2oyyu"
              >
                ID / Cliente
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="aox7bls"
              >
                Fecha y Hora
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="98w0ba2"
              >
                Ruta
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="ob183gs"
              >
                Tipo
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="ztblykf"
              >
                Vehículo / Conductor
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="-masy:k"
              >
                Estado
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="o:7vypf"
              >
                Precio
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                data-oid="09epseg"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200" data-oid="9zh2768">
            {bookingsData.map((booking, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${booking.hasIncident ? "bg-gray-100" : ""}`}
                data-oid="1n96pgc"
              >
                <td className="px-6 py-4 whitespace-nowrap" data-oid="27svqo7">
                  <div className="flex items-center" data-oid="35w5djt">
                    <div data-oid="s2uexm4">
                      <div
                        className="text-sm font-medium text-gray-900"
                        data-oid="lvwfdl2"
                      >
                        {booking.id}
                      </div>
                      <div className="text-sm text-gray-500" data-oid="tzmucgh">
                        {booking.clientName}
                      </div>
                    </div>
                    {booking.hasIncident && (
                      <span
                        className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-800"
                        data-oid="ru_usgc"
                      >
                        {booking.incidentType === "delay"
                          ? "Retraso"
                          : booking.incidentType === "change"
                            ? "Cambio"
                            : "Incidencia"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-oid="y:c--h5">
                  <div className="text-sm text-gray-900" data-oid="plewdl9">
                    {booking.date}
                  </div>
                </td>
                <td className="px-6 py-4" data-oid="m5t-zeg">
                  <div className="text-sm text-gray-900" data-oid="x11cvp1">
                    {booking.fromTo}
                  </div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap" data-oid="z6v0f:z">
                  <div className="text-sm text-gray-900" data-oid="_d6s:4s">
                    {booking.type === "one_way"
                      ? "Un trayecto"
                      : booking.type === "round_trip"
                        ? "Ida y vuelta"
                        : booking.type === "hourly"
                          ? "Por horas"
                          : "Día completo"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-oid="3ten9oc">
                  <div className="text-sm text-gray-900" data-oid="wse2l9n">
                    {booking.vehicle}
                  </div>
                  <div className="text-sm text-gray-500" data-oid="z.l2qgc">
                    {booking.driver}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-oid="rliar1c">
                  {getAvailableStatusTransitions(booking.status).length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                            updatingStatus === booking.id 
                              ? 'opacity-50 cursor-not-allowed' 
                              : getStatusColor(booking.status)
                          }`}
                          disabled={updatingStatus === booking.id}
                          data-oid="g94i5pj"
                        >
                          {getStatusLabel(booking.status)}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {getAvailableStatusTransitions(booking.status).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(booking, status)}
                          >
                            Cambiar a {getStatusLabel(status)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      data-oid="g94i5pj"
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" data-oid="dqvkm9w">
                  <div
                    className="text-sm font-medium text-gray-900"
                    data-oid="jcd5ehm"
                  >
                    {booking.price}
                  </div>
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  data-oid="1io9j9k"
                >
                  <button
                    onClick={() => handleViewBookingDetails(booking)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    data-oid="y:7r7u7"
                  >
                    Ver
                  </button>
                  <button
                    className="text-gray-600 hover:text-blue-900 mr-3"
                    data-oid="n3zqr1l"
                  >
                    Editar
                  </button>
                  <button
                    className="text-gray-600 hover:text-red-900"
                    data-oid="91gr41."
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default BookingsTable;
