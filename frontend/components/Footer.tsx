import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
            </svg>
            MiHotel
          </p>
          <p className="text-sm mt-2 text-slate-400">
            Encontrá y reservá alojamientos. Simple, directo y sin complicaciones.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Huéspedes</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/alojamientos" className="hover:text-white">Explorar alojamientos</Link></li>
            <li><Link href="/mis-reservas" className="hover:text-white">Mis reservas</Link></li>
            <li><Link href="/registro" className="hover:text-white">Crear cuenta</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Alojamientos</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/registro-dueno" className="hover:text-white">Publicá tu alojamiento</Link></li>
            <li><Link href="/panel" className="hover:text-white">Panel del dueño</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MiHotel — Jujuy, Argentina
      </div>
    </footer>
  );
}
