import Link from "next/link";
import FormRegistro from "@/components/FormRegistro";

export default function RegistroDuenoPage() {
  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Publicá tu alojamiento
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Registrate como dueño para cargar tu hotel, hostel o cabaña.
        </p>
        <FormRegistro endpoint="/auth/registro-dueno" />
        <p className="text-sm text-center mt-4 text-gray-600">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
