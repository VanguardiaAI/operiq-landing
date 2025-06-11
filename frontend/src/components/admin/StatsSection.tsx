import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  AlertCircle, 
  Star, 
  Users, 
  Car,
  DollarSign,
  Clock,
  Map,
  BarChart2,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Datos de ejemplo para las visualizaciones
const monthlyRevenueData = [
  { name: "Ene", revenue: 15000, gastos: 8000, beneficio: 7000 },
  { name: "Feb", revenue: 18000, gastos: 9500, beneficio: 8500 },
  { name: "Mar", revenue: 17000, gastos: 9000, beneficio: 8000 },
  { name: "Abr", revenue: 21000, gastos: 10000, beneficio: 11000 },
  { name: "May", revenue: 24000, gastos: 11000, beneficio: 13000 },
  { name: "Jun", revenue: 32000, gastos: 14000, beneficio: 18000 },
  { name: "Jul", revenue: 38000, gastos: 15000, beneficio: 23000 },
  { name: "Ago", revenue: 36000, gastos: 15500, beneficio: 20500 },
  { name: "Sep", revenue: 31000, gastos: 14000, beneficio: 17000 },
  { name: "Oct", revenue: 28000, gastos: 13000, beneficio: 15000 },
  { name: "Nov", revenue: 25000, gastos: 12000, beneficio: 13000 },
  { name: "Dic", revenue: 33000, gastos: 14500, beneficio: 18500 }
];

const bookingsByType = [
  { name: "Aeropuerto", value: 45, color: "#FF6B6B" },
  { name: "Urbano", value: 25, color: "#4ECDC4" },
  { name: "Por Horas", value: 15, color: "#FFD166" },
  { name: "Eventos", value: 10, color: "#06D6A0" },
  { name: "Corporativo", value: 5, color: "#118AB2" }
];

const vehicleUsage = [
  { name: "Sedan Lujo", value: 35, color: "#4ECDC4" },
  { name: "SUV Premium", value: 25, color: "#FF9F1C" },
  { name: "Limusina", value: 15, color: "#FF6B6B" },
  { name: "Van Ejecutiva", value: 10, color: "#06D6A0" },
  { name: "Minibus VIP", value: 5, color: "#118AB2" }
];

const dailyBookings = [
  { name: "Lun", value: 25 },
  { name: "Mar", value: 30 },
  { name: "Mié", value: 28 },
  { name: "Jue", value: 35 },
  { name: "Vie", value: 40 },
  { name: "Sáb", value: 55 },
  { name: "Dom", value: 45 }
];

const clientSegmentation = [
  { name: "VIP", value: 30, color: "#FF6B6B" },
  { name: "Empresas", value: 35, color: "#4ECDC4" },
  { name: "Turismo", value: 20, color: "#FFD166" },
  { name: "Eventos", value: 15, color: "#06D6A0" }
];

const routePopularity = [
  { name: "Aeropuerto-Centro", value: 40, color: "#06D6A0" },
  { name: "Costa-Ciudad", value: 25, color: "#118AB2" },
  { name: "Hoteles-Restaurantes", value: 15, color: "#FF6B6B" },
  { name: "Eventos Especiales", value: 12, color: "#FFD166" },
  { name: "Recorrido Turístico", value: 8, color: "#4ECDC4" }
];

const driverPerformance = [
  { name: "Carlos R.", rating: 4.9, bookings: 45 },
  { name: "Laura M.", rating: 4.8, bookings: 38 },
  { name: "Javier L.", rating: 4.9, bookings: 42 },
  { name: "Sofía G.", rating: 4.7, bookings: 35 },
  { name: "Miguel P.", rating: 4.6, bookings: 32 }
];

// Función para formatear valores a formato de precio
const formatPrice = (value: number) => `${value.toLocaleString('es-ES')}€`;

// Componente para mostrar barras horizontales
const HorizontalBar = ({ value, maxValue, color }: { value: number; maxValue: number; color: string }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="h-2.5 rounded-full" 
        style={{ width: `${percentage}%`, backgroundColor: color }}
      ></div>
    </div>
  );
};

// Componente para mostrar barras verticales
const VerticalBar = ({ value, maxValue, color, label }: { value: number; maxValue: number; color: string; label: string }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="flex flex-col items-center">
      <div className="flex-1 w-16 bg-gray-100 rounded-t-lg relative h-[150px] flex items-end">
        <div 
          className="w-full rounded-t-lg" 
          style={{ height: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <div className="text-xs mt-1 text-gray-600">{label}</div>
    </div>
  );
};

// Componente para mostrar un segmento de donut chart
interface DonutSegmentProps {
  percentage: number;
  color: string;
  offset: number;
  name?: string;
  value?: number;
}

const DonutSegment: React.FC<DonutSegmentProps> = ({ percentage, color, offset }) => {
  const strokeWidth = 20;
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
  
  return (
    <circle
      cx={50}
      cy={50}
      r={radius}
      fill="transparent"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeDashoffset={-offset}
      transform="rotate(-90 50 50)"
    />
  );
};

// Componente para mostrar un gráfico tipo donut
const DonutChart: React.FC<{ data: any[]; width?: number; height?: number; }> = ({ 
  data, 
  width = 200, 
  height = 200 
}) => {
  let total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={width} height={height} viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const segment = (
            <DonutSegment 
              key={index}
              percentage={percentage}
              color={item.color}
              offset={offset}
              name={item.name}
              value={item.value}
            />
          );
          offset += (percentage * 2 * Math.PI * (50 - 20 / 2)) / 100;
          return segment;
        })}
        <circle cx={50} cy={50} r={30} fill="white" />
      </svg>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs">{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Principal StatsSection
class StatsSection extends React.Component {
  // Estado del componente
  state = {
    timeRange: "month"
  };

  // Manejador para cambiar el período de tiempo
  handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ timeRange: e.target.value });
  };

  render() {
    // Encontrar el valor máximo para las barras
    const maxVehicleUsage = Math.max(...vehicleUsage.map(item => item.value));
    const maxRouteValue = Math.max(...routePopularity.map(item => item.value));
    const maxBookingValue = Math.max(...dailyBookings.map(item => item.value));
    const maxDriverBookings = Math.max(...driverPerformance.map(item => item.bookings));

    return (
      <div className="space-y-6">
        {/* Header y controles */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estadísticas y Análisis</h1>
            <p className="text-sm text-gray-500 mt-1">Monitoriza y analiza el rendimiento de tu negocio</p>
          </div>
          <div className="flex space-x-2">
            <select 
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={this.state.timeRange}
              onChange={this.handleTimeRangeChange}
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
              <option value="all">Todo el tiempo</option>
            </select>
            <Button variant="outline" size="sm" className="flex items-center">
              <Calendar size={16} className="mr-2" />
              Personalizar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              <BarChart2 size={16} className="mr-2" />
              Generar Informe
            </Button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500 uppercase">Ingresos Totales</div>
                <DollarSign size={18} className="text-red-500" />
              </div>
              <div className="text-3xl font-bold mt-2">268.450€</div>
              <div className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" /> 
                15% respecto al período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500 uppercase">Reservas Completadas</div>
                <Clock size={18} className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold mt-2">1.245</div>
              <div className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" /> 
                8% respecto al período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500 uppercase">Satisfacción Media</div>
                <Star size={18} className="text-amber-500" />
              </div>
              <div className="text-3xl font-bold mt-2">4.8/5</div>
              <div className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp size={14} className="mr-1" /> 
                0.2 respecto al período anterior
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-500 uppercase">Incidencias</div>
                <AlertCircle size={18} className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold mt-2">2.3%</div>
              <div className="text-xs text-green-500 mt-1 flex items-center">
                <ArrowDown size={14} className="mr-1" /> 
                0.5% menos que el período anterior
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ingresos mensuales y reservas por tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign size={18} className="mr-2 text-red-500" />
                Ingresos y Beneficios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] overflow-x-auto">
                <div className="flex items-end space-x-2 h-full pt-8 pb-10">
                  {monthlyRevenueData.map((month, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative h-[200px] w-16 flex flex-col justify-end">
                        {/* Barra de ingresos */}
                        <div 
                          className="w-8 bg-red-500 opacity-80 rounded-t-sm mx-auto"
                          style={{ 
                            height: `${(month.revenue / 40000) * 100}%`,
                          }}
                        ></div>
                        
                        {/* Barra de beneficios (superpuesta) */}
                        <div 
                          className="w-8 bg-teal-500 opacity-80 rounded-t-sm mx-auto absolute bottom-0"
                          style={{ 
                            height: `${(month.beneficio / 40000) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs mt-2 text-gray-600">{month.name}</div>
                    </div>
                  ))}
                </div>

                {/* Leyenda */}
                <div className="flex justify-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 opacity-80 mr-1"></div>
                    <span className="text-xs">Ingresos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-teal-500 opacity-80 mr-1"></div>
                    <span className="text-xs">Beneficio</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {/* Reservas por tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car size={18} className="mr-2 text-blue-500" />
                  Reservas por Tipo de Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart data={bookingsByType} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uso de vehículos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car size={18} className="mr-2 text-purple-500" />
                Uso de Vehículos por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleUsage.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.value}%</span>
                    </div>
                    <HorizontalBar value={item.value} maxValue={maxVehicleUsage} color={item.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reservas diarias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar size={18} className="mr-2 text-amber-500" />
                Reservas por Día de la Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end h-[210px] pt-5">
                {dailyBookings.map((day, index) => (
                  <VerticalBar
                    key={index}
                    value={day.value}
                    maxValue={maxBookingValue}
                    color="#FF9F1C"
                    label={day.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Segmentación de clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={18} className="mr-2 text-indigo-500" />
                Segmentación de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={clientSegmentation} />
            </CardContent>
          </Card>
        </div>

        {/* Métricas específicas del sector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rutas más populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map size={18} className="mr-2 text-green-500" />
                Rutas Más Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routePopularity.map((route, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{route.name}</span>
                      <span className="text-sm text-gray-500">{route.value}%</span>
                    </div>
                    <HorizontalBar value={route.value} maxValue={maxRouteValue} color={route.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rendimiento de conductores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users size={18} className="mr-2 text-red-500" />
                Rendimiento de Conductores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {driverPerformance.map((driver, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="text-sm font-medium">{driver.name}</span>
                        <div className="flex items-center mt-1">
                          <Star size={14} className="text-amber-500 fill-current" />
                          <span className="text-xs ml-1">{driver.rating}</span>
                          <span className="text-xs ml-3 text-gray-500">{driver.bookings} viajes</span>
                        </div>
                      </div>
                    </div>
                    <HorizontalBar 
                      value={driver.bookings} 
                      maxValue={maxDriverBookings} 
                      color="#118AB2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-xs text-gray-500 uppercase">Clientes Premium</div>
              <div className="text-3xl font-bold mt-2">68</div>
              <div className="text-xs text-green-500 mt-1">↑ 12% respecto al mes anterior</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-xs text-gray-500 uppercase">Ocupación Flota</div>
              <div className="text-3xl font-bold mt-2">78%</div>
              <div className="text-xs text-green-500 mt-1">↑ 5% respecto al mes anterior</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-xs text-gray-500 uppercase">Tiempo medio espera</div>
              <div className="text-3xl font-bold mt-2">4.2 min</div>
              <div className="text-xs text-green-500 mt-1">↓ 0.8 min respecto al mes anterior</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-xs text-gray-500 uppercase">Valor medio reserva</div>
              <div className="text-3xl font-bold mt-2">185€</div>
              <div className="text-xs text-green-500 mt-1">↑ 12€ respecto al mes anterior</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default StatsSection; 