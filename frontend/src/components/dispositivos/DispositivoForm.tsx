import React, { useState, useEffect } from 'react';
import { Dispositivo, CreateDispositivoData, UpdateDispositivoData } from '@/services/dispositivoService'; // Usando alias @
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; // Asumiré un placeholder simple si no existe

interface DispositivoFormProps {
  initialData?: Dispositivo | null; // Dispositivo existente para edición, o null/undefined para creación
  onSubmit: (data: CreateDispositivoData | UpdateDispositivoData) => Promise<void>;
  onCancel: () => void; // Para cerrar el formulario/modal
  isSubmitting?: boolean;
  submitButtonText?: string;
}

const DispositivoForm: React.FC<DispositivoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Guardar Dispositivo',
}) => {
  const [nombre_dispositivo, setNombreDispositivo] = useState('');
  const [clave_identificador, setClaveIdentificador] = useState('');
  const [nombre_area, setNombreArea] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (initialData) {
      setNombreDispositivo(initialData.nombre_dispositivo || '');
      setClaveIdentificador(initialData.clave_identificador || '');
      setNombreArea(initialData.nombre_area || '');
      setActivo(initialData.activo === undefined ? true : initialData.activo);
    } else {
      // Resetear para el modo creación
      setNombreDispositivo('');
      setClaveIdentificador('');
      setNombreArea('');
      setActivo(true);
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nombre_dispositivo.trim() || !clave_identificador.trim()) {
      alert('Nombre del dispositivo y Clave Identificadora son obligatorios.');
      return;
    }
    const dataPayload: CreateDispositivoData | UpdateDispositivoData = {
      nombre_dispositivo,
      clave_identificador,
      nombre_area: nombre_area.trim() === '' ? undefined : nombre_area, // Enviar undefined si está vacío para que no se guarde como string vacío
      activo,
    };
    onSubmit(dataPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      <div>
        <Label htmlFor="nombre_dispositivo">Nombre del Dispositivo <span className="text-red-500">*</span></Label>
        <Input
          id="nombre_dispositivo"
          value={nombre_dispositivo}
          onChange={(e) => setNombreDispositivo(e.target.value)}
          disabled={isSubmitting}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="clave_identificador">Clave Identificadora (ej. Topic MQTT) <span className="text-red-500">*</span></Label>
        <Input
          id="clave_identificador"
          value={clave_identificador}
          onChange={(e) => setClaveIdentificador(e.target.value)}
          disabled={isSubmitting}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="nombre_area">Nombre del Área</Label>
        <Input
          id="nombre_area"
          value={nombre_area}
          onChange={(e) => setNombreArea(e.target.value)}
          disabled={isSubmitting}
          className="mt-1"
        />
      </div>
      <div className="flex items-center space-x-2">
        {/* Asumiendo que tenemos un componente Checkbox placeholder o real */}
        {/* Si no, esto podría ser un <input type="checkbox"> estándar */}
        <Checkbox
            id="activo"
            checked={activo}
            onCheckedChange={(checked) => setActivo(checked as boolean)}
            disabled={isSubmitting}
        />
        <Label htmlFor="activo" className="font-normal">Activo</Label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default DispositivoForm;
