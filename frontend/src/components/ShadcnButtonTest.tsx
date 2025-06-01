import React from 'react';
import { Button } from '@/components/ui/button'; // Usa el alias @
import { cn } from '@/lib/utils'; // Usa el alias @

const ShadcnButtonTest: React.FC = () => {
  return (
    <div className="p-4 m-4 border border-dashed border-gray-300 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-600">
        Test de Componentes Shadcn/ui y Tailwind CSS
      </h2>
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-700">
          Este es un componente de prueba para verificar que Tailwind CSS y los componentes
          de shadcn/ui (como el botón de abajo) estén funcionando correctamente.
        </p>

        <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl">
          Botón Primario (shadcn/ui)
        </Button>

        <Button variant="secondary" className="w-full max-w-xs">
          Botón Secundario (shadcn/ui)
        </Button>

        <Button variant="destructive" size="sm">
          Botón Peligro (shadcn/ui)
        </Button>

        <Button variant="outline" disabled>
          Botón Contorno Deshabilitado (shadcn/ui)
        </Button>

        <div className={cn(
          "p-3 rounded-md text-white",
          "bg-green-500 hover:bg-green-600",
          "transition-all duration-300 ease-in-out",
          "text-center cursor-pointer"
        )}>
          Div con clases de Tailwind y función `cn`
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          Si ves estilos aplicados a estos elementos, la configuración es correcta.
        </p>
      </div>
    </div>
  );
};

export default ShadcnButtonTest;
