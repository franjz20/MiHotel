import Link from "next/link";
import FormRegistro from "@/components/FormRegistro";

export default function RegistroPage() {
  return (
    <div className="max-w-md mx-auto mt-14 mb-16 px-4">
      <div className="card p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Creá tu cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reservá alojamientos en Jujuy y Salta
          </p>
        </div>
        <FormRegistro endpoint="/auth/registro" />
        <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm text-center text-gray-600">
          <p>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Ingresá
            </Link>
          </p>
          <p>
            ¿Sos dueño o gerente de un alojamiento?{" "}
            <Link href="/registro-dueno" className="text-blue-600 font-medium hover:underline">
              Registrate acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
