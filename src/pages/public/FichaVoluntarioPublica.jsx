import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';

export default function FichaVoluntarioPublica() {
  const { rut } = useParams();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <Card title={`Ficha Pública del Voluntario (${rut})`}>
        <p className="text-sm text-slate-600">
          Aquí se mostrarán las certificaciones vigentes y estado de
          acreditación del voluntario consultado mediante su RUT.
        </p>
      </Card>
    </div>
  );
}
