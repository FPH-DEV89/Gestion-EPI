import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center transform transition-all">
                <div className="bg-red-50 p-6 flex justify-center border-b border-red-100">
                    <div className="bg-white p-4 rounded-full shadow-sm ring-4 ring-red-50">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </div>
                </div>
                <div className="p-8">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase">Accès Refusé</h1>
                    <p className="text-slate-500 mb-8 font-medium">
                        Vous n'avez pas les droits nécessaires pour accéder à l'interface Manager. Contactez un Super Administrateur si vous pensez qu'il s'agit d'une erreur.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex flex-1 w-full items-center justify-center p-4 bg-brand hover:bg-brand/90 text-white rounded-xl transition-all font-bold shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Retour à l'accueil
                    </Link>
                </div>
            </div>
        </main>
    );
}
