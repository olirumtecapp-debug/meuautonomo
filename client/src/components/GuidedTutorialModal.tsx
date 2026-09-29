import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  UserRound,
  BriefcaseBusiness,
  UserCheck,
  FileText,
  CalendarDays,
  CircleDollarSign,
  Receipt,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Building2,
  Lightbulb,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { useLocation } from "wouter";

interface GuidedTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "passos" | "estudio" | "dicas";
}

export function GuidedTutorialModal({
  open,
  onOpenChange,
  defaultTab = "passos",
}: GuidedTutorialModalProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "perfil",
      number: "1",
      title: "Seu Cartão Digital & Link Profissional",
      badge: "Comece Aqui",
      icon: UserRound,
      color: "bg-[#eef5d2] text-[#819815]",
      headline: "Seu ponto de encontro na internet",
      description:
        "O MeuAutônomo gera um link público exclusivo para você (ex: seu link /p/seu-nome). É como um cartão de visitas digital interativo que você coloca na bio do Instagram, no WhatsApp ou envia direto para quem pedir seu contato.",
      details: [
        "O cliente NÃO precisa baixar nenhum aplicativo e NÃO precisa criar conta para ver seus serviços.",
        "Ele visualiza suas especialidades, fotos, informações e pode fazer um pedido de atendimento direto pelo navegador.",
        "Todas as solicitações caem organizadas na sua aba 'Solicitações' para você responder em 1 clique.",
      ],
      actionLabel: "Ver Meu Cartão Digital",
      actionPath: "/cartao",
    },
    {
      id: "servicos",
      number: "2",
      title: "Catálogo de Serviços com Preços Prontos",
      badge: "Catálogo Rápido",
      icon: BriefcaseBusiness,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      headline: "Monte seu cardápio de atendimentos em segundos",
      description:
        "Cadastre os serviços que você oferece com tempo de duração, valor e modalidade (no seu local, a domicílio ou online). Para facilitar, criamos um Catálogo Inteligente com serviços pré-cadastrados!",
      details: [
        "Se você faz unhas: selecione Alongamento Fibra de Vidro, Esmaltação em Gel, Banho de Gel ou Spa dos Pés em 1 clique.",
        "Se faz sobrancelhas: Design com Henna, Mapeamento, Micropigmentação e Lash Lifting já vêm sugeridos.",
        "Seus serviços cadastrados alimentam automaticamente a Agenda, os Orçamentos e seu Cartão Público.",
      ],
      actionLabel: "Configurar Meus Serviços",
      actionPath: "/servicos",
    },
    {
      id: "equipe",
      number: "3",
      title: "Módulo Equipe & Estúdio (Salão-Parceiro)",
      badge: "Para Quem Tem Equipe",
      icon: UserCheck,
      color: "bg-[#f1f7dd] text-[#28564d]",
      headline: "Gerencie outros profissionais na mesma empresa",
      description:
        "Tem uma loja, salão, estúdio ou clínica com mais profissionais autônomos trabalhando juntos? Com base na Lei do Salão-Parceiro (Lei 13.352), você cadastra cada parceiro(a) e o sistema faz toda a gestão financeira.",
      details: [
        "Divisão Automática: Defina a comissão de cada um (ex: 50% para Manicure, 60% para Sobrancelha). Atendimentos na agenda e receitas dividem o repasse na hora.",
        "Agenda Simultânea: Várias profissionais podem atender clientes no mesmo horário sem conflito, com seleção do profissional responsável tanto na criação quanto na edição.",
        "1-Clique no WhatsApp: Envie o extrato de repasse formatado com faturamento, comissão calculada e a chave PIX do parceiro.",
      ],
      actionLabel: "Conhecer Módulo Equipe",
      actionPath: "/equipe",
    },
    {
      id: "orcamentos",
      number: "4",
      title: "Orçamentos Formais com Envio no WhatsApp",
      badge: "Feche Mais Vendas",
      icon: FileText,
      color: "bg-[#fff1d9] text-[#a27320]",
      headline: "Propostas profissionais que transmitem autoridade",
      description:
        "Chega de mandar apenas valores soltos em mensagens de texto. No MeuAutônomo você monta uma proposta com itens detalhados, desconto e condições de pagamento em menos de 1 minuto.",
      details: [
        "Rascunho ou Publicado: Salve propostas em rascunho para trabalhar com calma, ou marque 'Enviar agora' para gerar o link público.",
        "Envio em 1 clique: O botão verde 'Enviar WhatsApp' já monta a mensagem com o link seguro para o cliente aprovar ou pedir ajustes.",
        "Quando o cliente aprova, você pode transformar o orçamento em um atendimento na agenda com 1 toque.",
      ],
      actionLabel: "Criar um Orçamento",
      actionPath: "/orcamentos",
    },
    {
      id: "agenda",
      number: "5",
      title: "Agenda de Atendimentos Inteligente",
      badge: "Organização Total",
      icon: CalendarDays,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      headline: "Seus horários sob controle, sem esquecimentos",
      description:
        "Visualize seus compromissos no modo Dia, Semana ou Mês. Cada atendimento guarda o cliente, serviço, valor, horário e endereço.",
      details: [
        "Acompanhe o status: Agendado, Confirmado, Em Andamento, Concluído ou Cancelado.",
        "Sincronização com Relatórios: Atendimentos confirmados e concluídos alimentam automaticamente seu faturamento e gráficos.",
        "Associação de Parceiros: Defina qual parceiro(a) realizou o atendimento tanto na criação quanto na edição para apuração da comissão.",
      ],
      actionLabel: "Acessar Minha Agenda",
      actionPath: "/agenda",
    },
    {
      id: "financeiro",
      number: "6",
      title: "Financeiro Descomplicado & Recibos em PDF",
      badge: "Dinheiro Sob Controle",
      icon: CircleDollarSign,
      color: "bg-[#e3f3e8] text-[#3e885c]",
      headline: "Saiba exatamente quanto ganhou e emita comprovantes",
      description:
        "Tudo o que você recebe vai direto para a sua conta (via PIX, dinheiro ou cartão). O MeuAutônomo NÃO cobra taxas sobre suas vendas e NÃO segura seu dinheiro.",
      details: [
        "Registre receitas e despesas para ver seu lucro líquido real do mês em gráficos claros.",
        "1-Clique Recibo em PDF: Emita comprovante de quitação com validade formal para clientes, empresas ou condomínios.",
        "Envie o recibo direto no WhatsApp do cliente após finalizar o atendimento.",
      ],
      actionLabel: "Ver Painel Financeiro",
      actionPath: "/financeiro",
    },
    {
      id: "meu-dia",
      number: "7",
      title: "Rotina Diária com 'Meu Dia'",
      badge: "Produtividade Máxima",
      icon: Sparkles,
      color: "bg-[#f4f8ed] text-[#718600]",
      headline: "Abra pela manhã e saiba tudo o que precisa fazer",
      description:
        "A tela 'Meu Dia' foi pensada para quando você está na correria do trabalho. Ela filtra apenas o que importa hoje, sem distrações.",
      details: [
        "Veja seus atendimentos de hoje em ordem de horário e quanto vai faturar no dia.",
        "Confira o que precisa de atenção: novas mensagens de clientes e orçamentos aguardando resposta.",
        "Instale o MeuAutônomo como aplicativo no seu celular (Android ou iPhone) para acessar com 1 toque na tela inicial.",
      ],
      actionLabel: "Ver Tela Meu Dia",
      actionPath: "/meu-dia",
    },
  ];

  const handleGoTo = (path: string) => {
    onOpenChange(false);
    setLocation(path);
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[28px] p-0 sm:max-w-2xl border-0 shadow-[0_20px_60px_rgba(19,42,39,0.18)]">
        {/* Top Header */}
        <div className="bg-[#173a34] p-6 text-white sm:p-7 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#d9f56a]/10 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d9f56a]">
                <BookOpen className="h-4 w-4" /> Guia Prático do Usuário
              </span>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-white/80">
                Aprenda em 3 minutos
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Como Funciona o MeuAutônomo?
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Criado sob medida para autônomos, estúdios e pequenos negócios atenderem melhor, fecharem mais orçamentos e controlarem o dinheiro.
            </p>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-[#edf2ec] p-1 text-xs">
              <TabsTrigger value="passos" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#173a34] font-semibold">
                🚀 Tour Passo a Passo
              </TabsTrigger>
              <TabsTrigger value="estudio" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#173a34] font-semibold">
                🏢 Estúdio & Equipe
              </TabsTrigger>
              <TabsTrigger value="dicas" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#173a34] font-semibold">
                💡 Dúvidas & Dicas
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: TOUR PASSO A PASSO (CARROSSEL INTERATIVO) */}
            <TabsContent value="passos" className="mt-5 space-y-4">
              {/* Stepper Navigation Pills */}
              <div className="flex items-center justify-between gap-1 border-b border-[#edf1eb] pb-3">
                <span className="text-xs font-bold text-[#82948e]">
                  Passo {currentStep + 1} de {steps.length}
                </span>
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {steps.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        currentStep === idx
                          ? "bg-[#173a34] text-white shadow-xs"
                          : "bg-[#edf2ec] text-[#637a72] hover:bg-[#dce5dc]"
                      }`}
                      title={s.title}
                    >
                      {s.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Card */}
              <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8aa500]">
                        Passo {step.number}
                      </span>
                      <Badge className="bg-[#edf2ec] text-[#4d6642] text-[10px] border-0">
                        {step.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[#173a34] mt-0.5">{step.title}</h3>
                    <p className="text-xs font-semibold text-[#526d64] mt-0.5">{step.headline}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#5b736b]">
                  {step.description}
                </p>

                <div className="mt-4 space-y-2 rounded-xl bg-white p-3.5 border border-[#edf1eb]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#82948e]">
                    Como funciona na prática:
                  </p>
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-[#4d6642]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#8aa500] mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1eb] pt-4">
                  <Button
                    onClick={() => handleGoTo(step.actionPath)}
                    className="h-10 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-semibold cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                      className="h-9 rounded-xl border-[#dce5dc] bg-white text-xs cursor-pointer"
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentStep === steps.length - 1}
                      onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                      className="h-9 rounded-xl border-[#dce5dc] bg-white text-xs cursor-pointer"
                    >
                      Próximo <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: GUIA SALÃO & ESTÚDIO PARCEIRO */}
            <TabsContent value="estudio" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[#cbe4d1] bg-[#f0f8f2] p-4 text-xs text-[#284b42] leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-sm text-[#1b4333] mb-1">
                  <Building2 className="h-4 w-4 text-[#2d7d54]" />
                  <span>Para Donas de Estúdio de Estética, Esmalterias e Salões</span>
                </div>
                Se você trabalha com outras manicures, lash designers, esteticistas ou cabeleireiros no mesmo espaço físico, o MeuAutônomo resolve a divisão financeira com segurança jurídica pela <strong>Lei nº 13.352 (Lei do Salão-Parceiro)</strong>.
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dce5dc] bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm mb-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#eef5d2] text-[#819815] font-bold text-xs">1</div>
                    <span>Cadastre as Parceiras</span>
                  </div>
                  <p className="text-xs text-[#6d837c] leading-5">
                    Na aba <strong>Equipe / Parceiros</strong>, cadastre cada profissional informando nome, especialidade, chave PIX e a porcentagem de comissão combinada (ex: 50% ou 60%).
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm mb-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#eef5d2] text-[#819815] font-bold text-xs">2</div>
                    <span>Agendamentos Livres</span>
                  </div>
                  <p className="text-xs text-[#6d837c] leading-5">
                    Várias profissionais podem ter atendimentos marcados <strong>no mesmo horário</strong>. O sistema não bloqueia a agenda se forem parceiras diferentes.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm mb-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#eef5d2] text-[#819815] font-bold text-xs">3</div>
                    <span>Cálculo Automático</span>
                  </div>
                  <p className="text-xs text-[#6d837c] leading-5">
                    Ao registrar cada pagamento, o sistema calcula na hora: quanto é repasse da parceira e quanto é o lucro líquido do estúdio. Sem calculadora nem planilha manual.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm mb-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#eef5d2] text-[#819815] font-bold text-xs">4</div>
                    <span>Extrato WhatsApp em 1 Clique</span>
                  </div>
                  <p className="text-xs text-[#6d837c] leading-5">
                    No fim do dia, semana ou mês, clique em <strong>'Enviar Extrato no WhatsApp'</strong>. A mensagem vai com total faturado, comissão a pagar e a chave PIX pronta para conferência.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleGoTo("/equipe")}
                  className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-semibold cursor-pointer"
                >
                  <UserCheck className="mr-2 h-4 w-4" /> Acessar Módulo Equipe Agora
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: DICAS DE OURO E PERGUNTAS FREQUENTES */}
            <TabsContent value="dicas" className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[#edf1eb] bg-[#fbfcf9] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                  <Lightbulb className="h-4 w-4 text-[#8aa500]" />
                  <span>O dinheiro passa pelo MeuAutônomo? Há taxas?</span>
                </div>
                <p className="text-xs text-[#526d64] leading-5">
                  <strong>NÃO!</strong> O MeuAutônomo não faz intermediação bancária e <strong>não cobra nenhuma taxa sobre suas vendas</strong>. Todo pagamento é feito diretamente pelo cliente para a sua chave PIX, maquininha ou dinheiro em mãos.
                </p>
              </div>

              <div className="rounded-2xl border border-[#edf1eb] bg-[#fbfcf9] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                  <Smartphone className="h-4 w-4 text-[#8aa500]" />
                  <span>Como instalar como aplicativo no celular?</span>
                </div>
                <p className="text-xs text-[#526d64] leading-5">
                  Clique no botão <strong>'Instalar App'</strong> no canto superior da tela. No iPhone, basta tocar em 'Compartilhar' no Safari e escolher 'Adicionar à Tela de Início'. No Android/Chrome, basta tocar em 'Instalar Aplicativo'.
                </p>
              </div>

              <div className="rounded-2xl border border-[#edf1eb] bg-[#fbfcf9] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                  <Share2 className="h-4 w-4 text-[#8aa500]" />
                  <span>Como divulgar meu trabalho para atrair clientes?</span>
                </div>
                <p className="text-xs text-[#526d64] leading-5">
                  Vá na aba <strong>Meu Cartão</strong>, copie o link público e coloque na bio do Instagram ou envie quando alguém perguntar seus preços no WhatsApp. Os clientes veem seus serviços com fotos e podem solicitar atendimento sem precisar instalar nada.
                </p>
              </div>

              <div className="rounded-2xl border border-[#edf1eb] bg-[#fbfcf9] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#173a34] text-sm">
                  <Receipt className="h-4 w-4 text-[#8aa500]" />
                  <span>Como emitir comprovante para condomínio ou empresa?</span>
                </div>
                <p className="text-xs text-[#526d64] leading-5">
                  Na aba <strong>Orçamentos</strong>, quando a proposta for aceita, clique no botão <strong>'Gerar Recibo'</strong>. Você pode imprimir direto em folha A4 limpa ou salvar em PDF para enviar no WhatsApp.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-[#edf1eb] bg-[#f9fbf8] px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-[#82948e]">
            Você pode reabrir este guia a qualquer momento pelo botão <strong>🎓 Guia</strong> no topo.
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-semibold cursor-pointer"
          >
            Entendi, vamos começar!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
