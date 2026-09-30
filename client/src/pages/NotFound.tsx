import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleSupport = () => {
    window.open("https://wa.me/5511985052148?text=Ol%C3%A1%20Murilo%2C%20estou%20precisando%20de%20ajuda%20no%20MeuAut%C3%B4nomo", "_blank");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f7f2] p-4">
      <Card className="w-full max-w-lg shadow-xl border border-[#dce5dc] bg-white rounded-3xl overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-[#173a34] via-[#23534b] to-[#d9f56a]" />
        <CardContent className="pt-10 pb-10 px-6 sm:px-8 text-center space-y-6">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="MeuAutônomo"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">
              Erro 404
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#173a34]">
              Página Não Encontrada
            </h1>
            <p className="text-sm text-[#5a726a] leading-relaxed max-w-sm mx-auto">
              O link que você tentou acessar não existe, foi alterado ou você não tem permissão para visualizar este conteúdo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-[#173a34] hover:bg-[#28564d] text-white font-bold h-12 px-6 rounded-2xl transition-all shadow-md"
            >
              <Home className="w-4 h-4 mr-2 text-[#d9f56a]" />
              Voltar ao Início
            </Button>
            <Button
              onClick={handleSupport}
              variant="outline"
              className="border-[#cbd8cc] text-[#173a34] hover:bg-[#f5f8f2] font-bold h-12 px-6 rounded-2xl"
            >
              <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
              Falar no WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
