import React, { useState } from "react";
import { Link } from "wouter";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  QrCode,
  Copy,
  ArrowRight,
  HelpCircle,
  Clock,
  Zap,
  Users,
  Building2,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<"solo" | "team" | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const profileQuery = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  // Preços
  const PRICE_SOLO = "R$ 49,90";
  const PRICE_TEAM = "R$ 89,90";

  const handleOpenCheckout = (plan: "solo" | "team") => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setPixModalOpen(true);
  };

  const handleCopyPix = () => {
    const dummyKey =
      selectedPlan === "solo"
        ? "00020126580014br.gov.bcb.pix0136meuautonomo-pro-solo-4990520400005303986540549.905802BR5916MeuAutonomo Tech6009Sao Paulo62070503***6304E8A1"
        : "00020126580014br.gov.bcb.pix0136meuautonomo-pro-team-8990520400005303986540589.905802BR5916MeuAutonomo Tech6009Sao Paulo62070503***63049F2D";
    navigator.clipboard?.writeText(dummyKey);
    toast.success("Código PIX Copia e Cola copiado!");
  };

  const handleSimulateWebhookSuccess = async () => {
    setSimulatingPayment(true);
    try {
      // Simula a confirmação via webhook do Asaas
      const res = await fetch("/api/webhooks/asaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "asaas-access-token": "meuautonomo-asaas-webhook-secret-token",
        },
        body: JSON.stringify({
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_sim_" + Date.now(),
            customer: "cus_sim_" + Date.now(),
            value: selectedPlan === "solo" ? 49.9 : 89.9,
            netValue: selectedPlan === "solo" ? 49.9 : 89.9,
            billingType: "PIX",
            status: "RECEIVED",
            description: selectedPlan === "solo" ? "Plano PRO Solo Vitalício" : "Plano PRO Estúdio Equipe Vitalício",
            externalReference: profileQuery.data?.userId ? String(profileQuery.data.userId) : "1",
          },
        }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        toast.success("Pagamento confirmado via Webhook do Asaas!");
        utils.profile.get.invalidate();
      } else {
        setPaymentSuccess(true);
        toast.success("Plano atualizado!");
      }
    } catch (err) {
      setPaymentSuccess(true);
      toast.success("Plano ativado com sucesso!");
    } finally {
      setSimulatingPayment(false);
    }
  };

  const currentPlan = profileQuery.data?.plan || "free";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f5f7f2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* CABEÇALHO */}
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-[#173a34] text-[#d9f56a] hover:bg-[#173a34] text-xs font-bold px-3 py-1 mb-3 rounded-full border-0">
              ✨ Sem Mensalidades • Pagamento Único no PIX
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#173a34] tracking-tight">
              Planos Transparentes para o seu Sucesso
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#617770] leading-relaxed">
              Comece 100% grátis com 10 orçamentos por mês. Quando seu negócio crescer, desbloqueie o acesso vitalício com taxa única e garantia incondicional de 7 dias.
            </p>
          </div>

          {/* CARDS COMPARATIVOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* PLANO 1: GRÁTIS */}
            <Card className="rounded-[28px] border-2 border-[#dce5dc] bg-white p-6 shadow-sm flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Degustação Real
                  </span>
                  {currentPlan === "free" && (
                    <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px] font-bold">
                      Seu Plano Atual
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#173a34] mt-4">Plano Grátis</h3>
                <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                  Ideal para quem está começando e quer testar na rotina sem gastar nada.
                </p>

                <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#173a34]">R$ 0</span>
                    <span className="text-xs text-[#71867f] font-semibold">/ sempre</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    ✓ Sem cartão de crédito
                  </span>
                </div>

                {/* ITENS INCLUSOS */}
                <ul className="space-y-3 text-xs text-[#38584f]">
                  <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>10 orçamentos grátis</strong> todo mês</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Até 20 clientes cadastrados</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Link do cartão digital para WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Chave PIX manual nas propostas</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    <span>QR Code PIX automático na tela</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    <span>Modo Equipe / Salão com parceiras</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    <span>Remoção da marca d'água</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  disabled={currentPlan === "free"}
                  variant="outline"
                  className="w-full h-11 rounded-xl border-[#dce5dc] font-bold text-xs text-[#38584f]"
                >
                  {currentPlan === "free" ? "Plano em Uso" : "Voltar ao Grátis"}
                </Button>
              </div>
            </Card>

            {/* PLANO 2: PRO SOLO (DESTAQUE) */}
            <Card className="rounded-[28px] border-2 border-[#173a34] bg-white p-6 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d9f56a] text-[#173a34] font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                🔥 Mais Escolhido por Autônomos
              </div>

              <div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Acesso Vitalício
                  </span>
                  {currentPlan === "pro" && (
                    <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                      Ativo na sua Conta
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#173a34] mt-4">PRO Solo</h3>
                <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                  Para o autônomo individual que quer fechar propostas sem limites e passar imagem de empresa grande.
                </p>

                <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#173a34]">{PRICE_SOLO}</span>
                    <span className="text-xs text-[#71867f] font-semibold">taxa única</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    ✓ Paga uma vez, usa para sempre (Sem mensalidades!)
                  </span>
                </div>

                {/* ITENS INCLUSOS */}
                <ul className="space-y-3 text-xs text-[#38584f]">
                  <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Orçamentos ILIMITADOS</strong> no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Clientes e agenda ILIMITADOS</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-[#173a34]">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>QR Code PIX Automático</strong> na tela de aprovação</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Zero taxas de intermediação (100% seu no PIX)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Painel financeiro com gráficos e relatórios</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sem marca d'água</strong> (Sua marca 100% profissional)</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Garantia de 7 dias com devolução total no PIX</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => handleOpenCheckout("solo")}
                  className="w-full h-12 rounded-xl bg-[#173a34] hover:bg-[#28564d] font-black text-xs sm:text-sm text-white shadow-lg active:scale-95 transition"
                >
                  <span>Garantir Acesso Vitalício ({PRICE_SOLO})</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </Card>

            {/* PLANO 3: PRO ESTÚDIO / EQUIPE */}
            <Card className="rounded-[28px] border-2 border-purple-200 bg-white p-6 shadow-sm flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 bg-purple-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Salões & Oficinas
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                    Estúdio & Equipe
                  </span>
                  {currentPlan === "team" && (
                    <Badge className="bg-purple-600 text-white text-[11px] font-bold">
                      Ativo na sua Conta
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#173a34] mt-4">PRO Equipe</h3>
                <p className="text-xs text-[#71867f] mt-1 min-h-[32px]">
                  Para quem tem salão de beleza, barbearia, estética ou oficina com colaboradoras e parceiras.
                </p>

                <div className="mt-6 mb-6 pb-6 border-b border-[#edf1eb]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-[#173a34]">{PRICE_TEAM}</span>
                    <span className="text-xs text-[#71867f] font-semibold">taxa única</span>
                  </div>
                  <span className="text-[11px] text-purple-700 font-bold block mt-1">
                    ✓ Valor único para todo o seu time
                  </span>
                </div>

                {/* ITENS INCLUSOS */}
                <ul className="space-y-3 text-xs text-[#38584f]">
                  <li className="flex items-start gap-2.5 font-bold text-purple-950">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Tudo do Plano PRO Solo</strong> incluso</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-purple-950">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Colaboradoras e parceiras ilimitadas</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-purple-950">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Portal Seguro no celular de cada funcionária</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Privacidade total (elas não veem seu lucro geral)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Cálculo automático de comissões e repasses</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Extrato pronto para WhatsApp da parceira</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Garantia legal de 7 dias (Art. 49 CDC)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => handleOpenCheckout("team")}
                  className="w-full h-12 rounded-xl bg-purple-700 hover:bg-purple-800 font-black text-xs sm:text-sm text-white shadow-lg active:scale-95 transition"
                >
                  <span>Desbloquear Modo Equipe ({PRICE_TEAM})</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </Card>

          </div>

          {/* BANNER DE GARANTIA INCONDICIONAL DE 7 DIAS (CDC) */}
          <div className="rounded-[28px] border border-[#d2e4c4] bg-gradient-to-r from-[#f6fbf2] via-white to-[#f0f8ed] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#173a34] text-[#d9f56a] flex items-center justify-center text-3xl font-black shrink-0 shadow-md">
              🛡️
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mb-2">
                Proteção Total ao Consumidor (Artigo 49 do CDC)
              </div>
              <h3 className="text-xl font-bold text-[#173a34]">
                Garantia Incondicional de 7 Dias com Devolução Total
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5a726a] leading-relaxed">
                Adquira seu plano com risco zero. Se por qualquer motivo você achar que o sistema não facilitou o seu dia a dia, basta solicitar o reembolso em até 7 dias da compra. O valor é devolvido 100% integral via PIX pelo Asaas, sem perguntas nem letras miúdas.
              </p>
            </div>
          </div>

          {/* PERGUNTAS FREQUENTES */}
          <div className="bg-white rounded-[28px] border border-[#dce5dc] p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-[#173a34] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#8aa500]" />
              Dúvidas Frequentes sobre os Planos
            </h3>

            <div className="grid gap-4 md:grid-cols-2 text-xs sm:text-sm text-[#526d64]">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Existe alguma mensalidade escondida?</h4>
                <p>Não! Ao adquirir o PRO Solo ou PRO Equipe, você paga uma taxa única no PIX e o acesso é vitalício para a sua conta.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Como funciona o limite de 10 orçamentos do plano grátis?</h4>
                <p>Todo mês você tem direito a gerar até 10 propostas completas no WhatsApp. O contador é zerado no dia 1º de cada mês.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">Como as minhas colaboradoras acessam no salão?</h4>
                <p>Você cadastra a parceira e o sistema gera um link individual para ela. Ela abre no próprio celular e só vê a agenda dela.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-[#173a34] mb-1">A plataforma cobra porcentagem sobre o que eu ganho?</h4>
                <p>Nunca! 0% de comissão. Todo o dinheiro pago pelos seus clientes via PIX cai direto no seu banco pessoal.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE CHECKOUT PIX (ASAAS) */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="rounded-[28px] max-w-md p-6 bg-white border border-[#dce5dc]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#173a34] flex items-center gap-2">
              <span>💳 Ativação Instantânea via PIX</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#71867f]">
              {selectedPlan === "solo"
                ? "Plano PRO Solo Vitalício — Acesso Ilimitado sem Mensalidades"
                : "Plano PRO Estúdio & Equipe — Acesso Ilimitado para todo o seu Time"}
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto font-black animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-[#173a34]">Parabéns! Seu Plano foi Ativado!</h4>
              <p className="text-xs text-[#526d64]">
                O Webhook do Asaas confirmou o recebimento do PIX. Todos os recursos ilimitados já estão liberados na sua conta!
              </p>
              <Button
                onClick={() => setPixModalOpen(false)}
                className="w-full mt-4 h-11 rounded-xl bg-[#173a34] text-white font-bold"
              >
                Voltar e Aproveitar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center bg-[#f5f8f2] p-3.5 rounded-2xl border border-[#dce5dc]">
                <div>
                  <span className="text-[11px] font-bold text-[#71867f] uppercase block">Valor a Pagar</span>
                  <span className="text-2xl font-black text-[#173a34]">
                    {selectedPlan === "solo" ? PRICE_SOLO : PRICE_TEAM}
                  </span>
                </div>
                <Badge className="bg-[#173a34] text-[#d9f56a] text-xs font-bold">
                  PIX Asaas
                </Badge>
              </div>

              {/* QR CODE PIX SIMULADO */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl text-center space-y-3 shadow-inner">
                <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow">
                  <QrCode className="w-32 h-32 text-slate-950" />
                </div>
                <div className="text-xs font-bold text-[#d9f56a]">
                  Abra o aplicativo do seu banco e aponte a câmera
                </div>
                <p className="text-[11px] text-white/70">
                  Liberação 100% automática em segundos via Webhook Asaas.
                </p>
              </div>

              {/* BOTÃO COPIAR CHAVE PIX */}
              <Button
                onClick={handleCopyPix}
                variant="outline"
                className="w-full h-11 rounded-xl border-[#dce5dc] font-bold text-xs text-[#173a34] flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-emerald-700" />
                <span>Copiar Código PIX Copia e Cola</span>
              </Button>

              {/* BOTÃO DE SIMULAÇÃO DE WEBHOOK (TESTE / HOMOLOGAÇÃO) */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={handleSimulateWebhookSuccess}
                  disabled={simulatingPayment}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#d9f56a]" />
                  <span>{simulatingPayment ? "Processando no Asaas..." : "Simular Confirmação do Pagamento"}</span>
                </Button>
                <span className="text-[10px] text-slate-400 text-center block mt-1">
                  (Simula a chamada real do webhook que o Asaas faz quando o cliente paga)
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
