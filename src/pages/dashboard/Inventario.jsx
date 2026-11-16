import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';

export default function Inventario() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">
            Inventario y Logística
          </h1>
          <Card title="Equipamiento Institucional">
            <p className="text-sm text-slate-600">
              Control logístico básico de equipos de rescate, radios, botiquines
              y vehículos.
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
}

