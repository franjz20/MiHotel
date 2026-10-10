import Link from "next/link";
import FormRegistro from "@/components/FormRegistro";

export default function RegistroPage() {
  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
        <FormRegistro endpoint="/auth/registro" />
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
