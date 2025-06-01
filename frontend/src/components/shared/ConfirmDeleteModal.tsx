import React from 'react';
import { Button } from '@/components/ui/button'; // Usando alias @
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string; // Nombre del ítem a eliminar para mostrar en el mensaje
  isDeleting?: boolean; // Para deshabilitar botones mientras se elimina
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'este elemento',
  isDeleting = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Contenedor del Modal */}
      <Card className="w-full max-w-md transform transition-all">
        <CardHeader>
          <CardTitle>Confirmar Eliminación</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            ¿Estás seguro de que deseas eliminar {itemName}? Esta acción no se puede deshacer.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmDeleteModal;
