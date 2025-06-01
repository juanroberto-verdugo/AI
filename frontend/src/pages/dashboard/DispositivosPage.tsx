import React, { useState, useEffect, useCallback } from 'react';
import { Dispositivo, obtenerDispositivos, crearDispositivo, actualizarDispositivo, eliminarDispositivo, CreateDispositivoData, UpdateDispositivoData } from '@/services/dispositivoService';
import DispositivoForm from '@/components/dispositivos/DispositivoForm';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // Para obtener información del usuario si es necesario

const DispositivosPage: React.FC = () => {
  const { authState } = useAuth(); // Ejemplo de cómo podrías usar el contexto aquí
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para el formulario (modal/panel)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDispositivo, setEditingDispositivo] = useState<Dispositivo | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Estado para el modal de confirmación de borrado
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingDispositivoId, setDeletingDispositivoId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cargarDispositivos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerDispositivos();
      setDispositivos(data);
    } catch (err: any) {
      console.error("Error al cargar dispositivos:", err);
      setError(err.response?.data?.message || err.message || 'Error al cargar dispositivos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) { // Solo cargar si está autenticado
        cargarDispositivos();
    }
  }, [cargarDispositivos, authState.isAuthenticated]);

  // Manejadores para el formulario
  const handleOpenCreateForm = () => {
    setEditingDispositivo(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (dispositivo: Dispositivo) => {
    setEditingDispositivo(dispositivo);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingDispositivo(null);
  };

  const handleFormSubmit = async (data: CreateDispositivoData | UpdateDispositivoData) => {
    setIsSubmittingForm(true);
    setError(null);
    try {
      if (editingDispositivo) {
        await actualizarDispositivo(editingDispositivo.id, data as UpdateDispositivoData);
      } else {
        await crearDispositivo(data as CreateDispositivoData);
      }
      setIsFormOpen(false);
      setEditingDispositivo(null);
      cargarDispositivos(); // Recargar lista
    } catch (err: any) {
      console.error("Error al guardar dispositivo:", err);
      setError(err.response?.data?.message || err.message || 'Error al guardar el dispositivo.');
      // Mantener el formulario abierto en caso de error para que el usuario pueda corregir
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Manejadores para el borrado
  const handleOpenDeleteConfirm = (id: number) => {
    setDeletingDispositivoId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsConfirmDeleteOpen(false);
    setDeletingDispositivoId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDispositivoId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await eliminarDispositivo(deletingDispositivoId);
      handleCloseDeleteConfirm();
      cargarDispositivos(); // Recargar lista
    } catch (err: any) {
      console.error("Error al eliminar dispositivo:", err);
      setError(err.response?.data?.message || err.message || 'Error al eliminar el dispositivo.');
      // Mantener el modal abierto en caso de error
    } finally {
      setIsDeleting(false);
    }
  };

  if (!authState.isAuthenticated) { // Protección básica a nivel de página
    return <p className="text-center mt-10">Debes estar autenticado para ver esta página.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Dispositivos</h1>
        <Button onClick={handleOpenCreateForm}>Añadir Dispositivo</Button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

      {/* Formulario Modal/Panel (simulado con renderizado condicional) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-0 rounded-lg shadow-xl max-w-lg w-full">
             {/* El DispositivoForm ya tiene su propio padding y estilo de card */}
            <DispositivoForm
              initialData={editingDispositivo}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={isSubmittingForm}
              submitButtonText={editingDispositivo ? 'Actualizar Dispositivo' : 'Crear Dispositivo'}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        itemName={dispositivos.find(d => d.id === deletingDispositivoId)?.nombre_dispositivo || 'el dispositivo'}
        isDeleting={isDeleting}
      />

      {isLoading ? (
        <p>Cargando dispositivos...</p>
      ) : dispositivos.length === 0 && !error ? (
        <p>No hay dispositivos registrados para tu empresa.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clave Identificador</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dispositivos.map((dispositivo) => (
                <tr key={dispositivo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dispositivo.nombre_dispositivo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dispositivo.clave_identificador}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dispositivo.nombre_area || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dispositivo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {dispositivo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditForm(dispositivo)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteConfirm(dispositivo.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DispositivosPage;
