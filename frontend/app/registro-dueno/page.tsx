import Link from "next/link";
import FormRegistro from "@/components/FormRegistro";

export default function RegistroDuenoPage() {
  return (
    <div className="max-w-md mx-auto mt-14 mb-16 px-4">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-white mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold">Publicá tu alojamiento</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registrate como dueño y cargá tu hotel, hostel o cabaña en minutos.
          </p>
        </div>
        <FormRegistro endpoint="/auth/registro-dueno" textoBoton="Crear cuenta de dueño" />
        <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm text-center text-gray-600">
          <p>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Ingresá
            </Link>
          </p>
          <p>
            ¿Querés reservar como huésped?{" "}
            <Link href="/registro" className="text-blue-600 font-medium hover:underline">
              Registro de cliente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
