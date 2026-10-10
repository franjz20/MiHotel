"use client";

import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { Alojamiento } from "@/lib/types";
import FormAlojamiento, {
  AlojamientoFormData,
  toRequest,
} from "@/components/FormAlojamiento";

export default function NuevoAlojamientoPage() {
  const router = useRouter();

  async function crear(data: AlojamientoFormData) {
    const alojamiento = await post<Alojamiento>("/alojamientos", toRequest(data));
    router.push(`/panel/alojamiento/${alojamiento.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Nuevo alojamiento</h1>
        <FormAlojamiento onSubmit={crear} textoBoton="Crear alojamiento" />
        <p className="text-xs text-gray-500 mt-4">
          El alojamiento quedará en estado PENDIENTE hasta que un administrador lo
          apruebe.
        </p>
      </div>
    </div>
  );
}
