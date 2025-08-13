import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";

interface BookingsFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

interface BookingStats {
  total: number;
  active: number;
  history: number;
  today: number;
  incidents: number;
  by_status: {
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
}

const BookingsFilters = ({ selectedStatus, onStatusChange }: BookingsFiltersProps) => {
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    active: 0,
    history: 0,
    today: 0,
    incidents: 0,
    by_status: {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    }
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const statsData = await bookingService.getBookingStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading booking stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6" data-oid="qom9xlm">
      <div
        className="bg-white rounded-xl shadow-sm p-4 lg:flex-1"
        data-oid="sdyam.6"
      >
        <h3
          className="text-sm font-medium text-gray-500 mb-3"
          data-oid="60nboks"
        >
          Filtros
        </h3>
        <div className="flex flex-wrap gap-2" data-oid="4crfcjs">
          <div className="w-full sm:w-auto" data-oid="rmlssf9">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              data-oid="784s:.o"
            >
              <option value="" data-oid="z1j_fz2">
                Todos los estados
              </option>
              <option value="pending" data-oid="ifog0wl">
                Pendientes
              </option>
              <option value="confirmed" data-oid="bsa83x.">
                Confirmados
              </option>
              <option value="in_progress" data-oid="vvx.qgu">
                En progreso
              </option>
              <option value="completed" data-oid="j.6zbah">
                Completados
              </option>
              <option value="cancelled" data-oid="e00.ka4">
                Cancelados
              </option>
              <option value="no_show" data-oid="tt.m_6o">
                No presentados
              </option>
            </select>
          </div>
          <div className="w-full sm:w-auto" data-oid="iqum:n1">
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Fecha desde"
              data-oid="e6rk78m"
            />
          </div>
          <div className="w-full sm:w-auto" data-oid="_:_yziv">
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Fecha hasta"
              data-oid="7x7lcqe"
            />
          </div>
          <Button variant="outline" size="sm" data-oid="-y16pn0">
            Aplicar filtros
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:flex-1"
        data-oid="o2yy0t2"
      >
        <div className="bg-white rounded-xl shadow-sm p-4" data-oid="7r987z0">
          <h3 className="text-xs text-gray-500" data-oid="1x39v9s">
            Hoy
          </h3>
          <p className="text-2xl font-semibold mt-1" data-oid="n_jn8al">
            {isLoadingStats ? '...' : stats.today}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4" data-oid="pwjxhoh">
          <h3 className="text-xs text-gray-500" data-oid="5u.c5q0">
            Pendientes
          </h3>
          <p
            className="text-2xl font-semibold mt-1 text-amber-600"
            data-oid="4-3i_f."
          >
            {isLoadingStats ? '...' : stats.by_status.pending}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4" data-oid="ip2cyoq">
          <h3 className="text-xs text-gray-500" data-oid="vxj4eq-">
            En progreso
          </h3>
          <p
            className="text-2xl font-semibold mt-1 text-gray-600"
            data-oid="7g282a_"
          >
            {isLoadingStats ? '...' : stats.by_status.in_progress}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4" data-oid="66bfv3p">
          <h3 className="text-xs text-gray-500" data-oid="gmrbtgd">
            Incidencias
          </h3>
          <p
            className="text-2xl font-semibold mt-1 text-gray-600"
            data-oid="pdp4rul"
          >
            {isLoadingStats ? '...' : stats.incidents}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingsFilters;
