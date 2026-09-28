import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Users,
  FileText,
  DollarSign,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Megaphone,
  MessageSquare,
  Video,
  Building2,
  Target,
  Clock,
  Smartphone,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

import { SimulatorTour } from "@/components/SimulatorTour";

export default function AdminPage() {
  const [email, setEmail] = useState("admin@meuautonomo.com.br");
  const [password, setPassword] = useState("admin@123456");
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "marketing" | "simulator">("simulator");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedScript(id);
    toast.success("Roteiro copiado para a área de transferência!");
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const meQuery = trpc.auth.me.useQuery();
  const metricsQuery = trpc.admin.getMetrics.useQuery(undefined, {
    enabled: meQuery.data?.role === "admin",
    retry: false,
  });
  const usersQuery = trpc.admin.listUsers.useQuery(undefined, {
    enabled: meQuery.data?.role === "admin",
    retry: false,
  });

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("Autenticado como administrador com sucesso!");
      meQuery.refetch();
      metricsQuery.refetch();
      usersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Credenciais incorretas.");
    },
  });

  const resetMutation = trpc.admin.resetDatabase.useMutation({
    onSuccess: () => {
      toast.success("Banco de dados reiniciado com sucesso! Todos os dados de teste foram limpos.");
      setShowResetModal(false);
      setResetConfirmInput("");
      metricsQuery.refetch();
      usersQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao zerar o banco.");
    },
  });

  const toggleDemoMutation = trpc.admin.setDemoMode.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.demoMode
          ? "Modo Demonstração ATIVADO (contas de teste visíveis no login)."
          : "Modo Demonstração DESATIVADO (sistema blindado para produção)."
      );
      metricsQuery.refetch();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.info("Sessão administrativa encerrada.");
      meQuery.refetch();
    },
  });

  const isAdmin = meQuery.data?.role === "admin";

  const money = (cents = 0) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // TELA DE LOGIN ADMINISTRATIVO
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f1] p-4 sm:p-6">
        <Card className="w-full max-w-md rounded-[28px] border-0 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(19,42,39,0.08)]">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#173a34]">Painel Administrativo</h1>
            <p className="mt-1 text-xs text-[#71867f]">
              Área restrita para controle de testes e gestão do MeuAutônomo
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate({ email, password });
            }}
            className="space-y-4"
          >
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-[#38584f]">
                E-mail do Administrador
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-[#38584f]">
                Senha de Acesso
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
              />
            </div>

            <div className="rounded-xl border border-dashed border-[#dce5dc] bg-[#f8faf6] p-3 text-xs text-[#6e857e]">
              <p className="font-semibold text-[#284b42]">Credenciais padrão de teste:</p>
              <p className="mt-0.5">E-mail: <code>admin@meuautonomo.com.br</code></p>
              <p>Senha: <code>admin@123456</code></p>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="h-11 w-full rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              {loginMutation.isPending ? "Validando..." : "Entrar no Painel Admin"}
            </Button>

            <div className="pt-2 text-center">
              <Link href="/app" className="inline-flex items-center text-xs font-semibold text-[#71867f] hover:text-[#173a34]">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Voltar para o aplicativo
              </Link>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const metrics = metricsQuery.data;

  // PAINEL ADMINISTRATIVO AUTENTICADO
  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      {/* HEADER DO ADMIN */}
      <header className="border-b border-[#dce5dc] bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/app">
              <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto object-contain cursor-pointer" />
            </Link>
            <span className="rounded-full bg-[#173a34] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#d9f56a]">
              Admin Master
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="outline" className="h-9 rounded-xl border-[#dce5dc] text-xs font-semibold text-[#38584f]">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Ir para Meu Espaço
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              className="h-9 rounded-xl text-xs text-rose-600 hover:bg-rose-50"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* TÍTULO E NAVEGAÇÃO DE ABAS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#173a34]">
              Painel de Controle e Gestão
            </h1>
            <p className="mt-1 text-sm text-[#71867f]">
              Monitore métricas de teste, zere dados quando necessário e consulte o roteiro de vendas da plataforma.
            </p>
          </div>

          {/* TOGGLE MODO DEMO */}
          {metrics && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#dce5dc] bg-white p-3 shadow-xs">
              <div className="text-left">
                <span className="block text-xs font-bold text-[#173a34]">
                  Modo Demonstração / Testes
                </span>
                <span className="text-[11px] text-[#71867f]">
                  {metrics.demoMode ? "Ativo (contas de teste visíveis)" : "Desativado (blindado para produção)"}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleDemoMutation.mutate({ enabled: !metrics.demoMode })}
                disabled={toggleDemoMutation.isPending}
                className={
                  metrics.demoMode
                    ? "rounded-xl border-[#d9f56a] bg-[#f4fadc] text-[#556b10]"
                    : "rounded-xl border-[#dce5dc] text-[#71867f]"
                }
              >
                {metrics.demoMode ? (
                  <>
                    <ToggleRight className="mr-1 h-4 w-4 text-[#8aa500]" /> Ativo
                  </>
                ) : (
                  <>
                    <ToggleLeft className="mr-1 h-4 w-4" /> Inativo
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="flex flex-wrap border-b border-[#dce5dc] gap-2 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "simulator"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#8aa500]" />
            <span>Simulador Visual dos Fluxos</span>
            <span className="rounded-full bg-[#d9f56a] px-2 py-0.5 text-[10px] font-bold text-[#173a34]">
              Interativo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "overview"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Visão Geral & Métricas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marketing")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition -mb-[2px] ${
              activeTab === "marketing"
                ? "border-[#173a34] text-[#173a34] bg-white rounded-t-2xl shadow-xs"
                : "border-transparent text-[#71867f] hover:text-[#173a34]"
            }`}
          >
            <Megaphone className="h-4 w-4 text-[#8aa500]" />
            <span>Plano de Vendas</span>
            <span className="rounded-full bg-[#eef5d2] px-2 py-0.5 text-[10px] font-bold text-[#556b10]">
              Estratégia
            </span>
          </button>

          <Link href="/demo">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#173a34] hover:bg-[#d9f56a]/30 rounded-t-2xl transition border-b-2 border-transparent -mb-[2px]"
            >
              <Video className="h-4 w-4 text-emerald-700" />
              <span>Vídeo / Reels de Vantagens</span>
              <span className="rounded-full bg-[#173a34] px-2 py-0.5 text-[10px] font-bold text-[#d9f56a]">
                Novo
              </span>
            </button>
          </Link>
        </div>

        {/* CONTEÚDO DA ABA 1: VISÃO GERAL & TESTES */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* MÉTRICAS GERAIS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Profissionais</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.profilesCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.usersCount} contas cadastradas` : "Carregando..."}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Orçamentos</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e1effa] text-[#23638e]">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.quotesCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.acceptedQuotesCount} propostas aceitas` : "Carregando..."}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Total Orçado</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#e3f5e3] text-[#2c7a45]">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? money(metrics.totalQuotedCents) : "..."}
                </div>
                <p className="mt-1 text-xs text-[#2c7a45] font-semibold">
                  {metrics ? `${money(metrics.acceptedQuotedCents)} em propostas aprovadas` : ""}
                </p>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#82948e] uppercase">Atendimentos</span>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4d7] text-[#906815]">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-[#173a34]">
                  {metrics ? metrics.appointmentsCount : "..."}
                </div>
                <p className="mt-1 text-xs text-[#71867f]">
                  {metrics ? `${metrics.clientsCount} clientes no sistema` : ""}
                </p>
              </Card>
            </div>

            {/* ÁREA CRÍTICA: ZERAR DADOS PARA NOVOS TESTES */}
            <Card className="rounded-[24px] border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-950">
                      Zerar e Reiniciar Banco de Testes
                    </h3>
                    <p className="mt-1 max-w-xl text-xs sm:text-sm text-rose-800/80 leading-relaxed">
                      Apaga todos os clientes, propostas, atendimentos, serviços criados e despesas registradas durante seus testes, restaurando o sistema para um estado limpo de primeiro uso.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="shrink-0 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Zerar dados de teste
                </Button>
              </div>
            </Card>

            {/* LISTAGEM DE USUÁRIOS E PERFIS */}
            <Card className="rounded-[24px] border-0 bg-white shadow-[0_10px_35px_rgba(19,42,39,0.05)] overflow-hidden">
              <CardHeader className="border-b border-[#edf1eb] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#173a34]">
                      Contas e Profissionais Cadastrados
                    </CardTitle>
                    <p className="mt-1 text-xs text-[#71867f]">
                      Usuários criados no banco de dados e seus respectivos espaços públicos.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-lg border-[#dce5dc]">
                    {usersQuery.data?.length || 0} registros
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f7f9f5] border-b border-[#edf1eb] text-[#5c756d] font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Nome / Profissão</th>
                        <th className="px-6 py-3.5">E-mail</th>
                        <th className="px-6 py-3.5">Localização</th>
                        <th className="px-6 py-3.5">Perfil Público</th>
                        <th className="px-6 py-3.5">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1eb] text-[#38584f]">
                      {usersQuery.data && usersQuery.data.length > 0 ? (
                        usersQuery.data.map((u) => (
                          <tr key={u.id} className="hover:bg-[#fbfcf9] transition">
                            <td className="px-6 py-4 font-semibold text-[#173a34]">
                              {u.profileName || u.name}
                              {u.profession && (
                                <span className="block text-[11px] font-normal text-[#71867f]">
                                  {u.profession}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">{u.city || "—"}</td>
                            <td className="px-6 py-4">
                              {u.slug ? (
                                <a
                                  href={`/p/${u.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-[#7a961f] hover:underline"
                                >
                                  /p/{u.slug}
                                </a>
                              ) : (
                                <span className="text-[#a4b5ad]">Sem espaço</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-[#71867f]">
                              {new Date(u.lastSignedIn).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#82948e]">
                            Nenhum usuário encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: PLANO DE PROPAGANDA & VENDAS */}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            {/* CARD IMPORTANTE: MODELO DE NEGÓCIO E NÃO-INTERMEDIAÇÃO */}
            <div className="rounded-[24px] border border-[#b8dfc4] bg-[#f0f9f3] p-6 text-[#173a34] shadow-xs">
              <div className="flex items-center gap-3 font-bold text-base text-[#173a34] mb-2">
                <ShieldCheck className="h-6 w-6 text-[#2e6e4a]" />
                <span>Pilar Fundamental: Como o MeuAutônomo Lucra (E Como NÃO Cobra Nada de Serviços)</span>
              </div>
              <p className="text-sm leading-6 text-[#2f5546]">
                Para que o profissional autônomo confie e use o sistema com entusiasmo, <strong>a plataforma nunca cobra porcentagem ou comissão sobre o serviço dele</strong> e <strong>não retém o dinheiro pago pelos clientes</strong>.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl bg-white p-3.5 border border-[#cbe4d4] shadow-xs">
                  <strong className="block text-[#173a34] text-sm mb-1">💰 Pagamento dos Serviços (100% Direto):</strong>
                  O cliente final acerta direto com o profissional (na máquina física de cartão do prestador, em dinheiro ou transferência/PIX). Sem intermediação bancária obrigatória nem retenção de saldo.
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-[#cbe4d4] shadow-xs">
                  <strong className="block text-[#173a34] text-sm mb-1">📈 Como a Plataforma Fatura (SaaS Mensal):</strong>
                  Monetização por assinatura de software: versão Gratuita para o autônomo começar a usar, e <strong>Plano PRO por apenas R$ 24,90/mês</strong> para orçamentos ilimitados, fotos e relatórios.
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: VISÃO DE MERCADO */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)] lg:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#6b820a]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#173a34]">Tamanho da Oportunidade no Brasil</h3>
                    <p className="text-xs text-[#71867f]">Mercado gigantesco e subatendido pela tecnologia</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[#4c6960] leading-relaxed">
                  <p>
                    No Brasil existem mais de <strong>15 milhões de MEIs</strong> e mais de <strong>25 milhões de trabalhadores autônomos ou informais</strong>.
                  </p>
                  <p>
                    A esmagadora maioria ainda trabalha no <strong>caderninho de papel</strong>, mensagens perdidas no WhatsApp e papéis de orçamento rabiscados, o que gera calotes, esquecimento de cobranças e impressão de amadorismo.
                  </p>
                  <div className="mt-4 rounded-xl border border-[#dce5dc] bg-[#fbfcf9] p-4 font-medium text-xs text-[#173a34]">
                    🎯 <strong>A Proposta Única de Valor (Slogan):</strong><br />
                    <em>"O aplicativo mais simples e direto do Brasil para o trabalhador autônomo organizar sua agenda, enviar orçamentos profissionais pelo WhatsApp e receber direto — sem burocracia e sem o cliente precisar baixar nada."</em>
                  </div>
                </div>
              </Card>

              {/* CARD PRECIFICAÇÃO PRO */}
              <Card className="rounded-[24px] border-2 border-[#d9f56a] bg-gradient-to-b from-[#f8fbe9] to-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-[#173a34] text-[#d9f56a] text-[11px] font-bold">Plano PRO Recomendado</Badge>
                  <Sparkles className="h-5 w-5 text-[#8aa500]" />
                </div>
                <div className="mt-2 text-3xl font-black text-[#173a34]">
                  R$ 24,90 <span className="text-sm font-normal text-[#71867f]">/ mês</span>
                </div>
                <p className="text-xs text-[#526d64] mt-1 font-medium">
                  Ou R$ 199,00/ano no PIX (equivale a R$ 16,58/mês)
                </p>
                <div className="mt-4 space-y-2 text-xs text-[#38584f]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Orçamentos e propostas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Emissão ilimitada de Recibos Digitais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Fotos de antes/depois nos orçamentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
                    <span>Relatório financeiro de lucro mensal</span>
                  </div>
                </div>
                <p className="mt-4 rounded-xl bg-white p-3 text-[11px] text-[#5c756d] border border-[#e1ecc8]">
                  💡 <strong>Por que este preço?</strong> Menos que uma pizza. Se o profissional fechar 1 orçamento a mais no mês por passar confiança, a ferramenta já se pagou com sobras.
                </p>
              </Card>
            </div>

            {/* SEÇÃO 2: AS 4 PERSONAS E GANCHOS */}
            <div>
              <h3 className="text-lg font-bold text-[#173a34] mb-3">
                Públicos-Alvo Prioritários & Ganchos de Venda
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🔨</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Obras & Reparos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Eletricista, Encanador, Pintor, Marceneiro, Ar Condicionado</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Perde propostas por demora ou passa impressão de amadorismo; cliente chora desconto.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Envie propostas com cara de empresa grande em 1 minuto direto no WhatsApp."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">💅</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Beleza & Estética</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Manicure, Cabeleireira, Lash Designer, Maquiadora</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Clientes furando horários e desorganização da agenda no WhatsApp misturada com a vida pessoal.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Tenha seu cartão virtual com catálogo e agendamento direto na bio do Instagram."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">📱</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Reparos Rápidos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Conserto de Celular, Eletrodomésticos, Informática</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Aprovação de peças, registro formal de garantia e necessidade de sinal de entrada.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Orçamento aprovado pelo cliente com aceite registrado e opção de chave PIX direta."</em>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🧹</span>
                    <h4 className="mt-2 font-bold text-sm text-[#173a34]">Serviços & Eventos</h4>
                    <p className="text-xs text-[#71867f] mt-0.5">Diarista, Personal Organizer, Buffet/Doceria, Fotógrafo</p>
                    <p className="mt-3 text-xs text-[#38584f]"><strong>Principal Dor:</strong> Falta de controle financeiro do mês, recibos manuais improvisados e esquecimentos.</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-xs font-semibold text-[#173a34]">
                    💬 <em>"Emita recibos digitais em 1 clique e saiba exatamente quanto sobrou no final do mês."</em>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: OS 4 CANAIS DE AQUISIÇÃO */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <h3 className="text-lg font-bold text-[#173a34] mb-1">
                Os 4 Canais Práticos de Divulgação
              </h3>
              <p className="text-xs text-[#71867f] mb-6">
                Estratégias de baixo custo com foco em presença onde o profissional autônomo já circula todos os dias.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Building2 className="h-5 w-5 text-[#2e6e4a]" />
                    <span>Canal 1: Parcerias Físicas B2B (Custo Quase Zero)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Eletricistas e encanadores vão toda semana à loja de materiais de construção. Manicures vão a distribuidores de cosméticos.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li>Colocar display de balcão com QR Code: <em>"Pare de mandar orçamento em papel de pão. Teste o MeuAutônomo grátis."</em></li>
                    <li>Oferecer comissão simbólica ou brinde para os balconistas indicarem o app para quem compra no balcão.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Video className="h-5 w-5 text-[#8aa500]" />
                    <span>Canal 2: Vídeos Curtos de Humor (TikTok / Reels)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Vídeos curtos de identificação da rotina do autônomo viralizam organicamente sem gastar com anúncios.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li><strong>Roteiro Humor:</strong> Profissional procurando caderno no porta-luvas bagunçado: <em>"Quem nunca perdeu R$ 300 porque esqueceu de cobrar o cliente?"</em> Mostra gerando o recibo em 2 segundos.</li>
                    <li><strong>Roteiro Autoridade:</strong> <em>"Como cobrar mais pelo seu serviço sem o cliente pedir desconto?"</em> Mostra a página do orçamento digital profissional.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <Smartphone className="h-5 w-5 text-[#1b75bb]" />
                    <span>Canal 3: Meta Ads Hiperlocal (Instagram & Facebook)</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Campanhas locais com orçamento acessível (R$ 15 a R$ 30 por dia).
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li><strong>Público:</strong> Homens e Mulheres de 22 a 55 anos na sua região, com interesses em MEI, Ferramentas, Pequenos Negócios, Salão de Beleza.</li>
                    <li><strong>Formato:</strong> Vídeo gravado no próprio celular (estilo autêntico UGC, sem parecer propaganda corporativa).</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center gap-3 font-bold text-[#173a34] mb-2">
                    <MessageSquare className="h-5 w-5 text-[#173a34]" />
                    <span>Canal 4: Grupos Regionais & WhatsApp</span>
                  </div>
                  <p className="text-xs text-[#4c6960] leading-relaxed">
                    Apresentar o <strong>Cartão Digital Gratuito</strong> como um presente nas comunidades de bairro e associações comerciais.
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#38584f] list-disc pl-4">
                    <li>O trabalhador adora receber um link profissional com o próprio nome (<code>/p/seunome</code>) para colocar na bio.</li>
                    <li>Uma vez dentro da plataforma, ele descobre naturalmente os orçamentos e a agenda.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: SCRIPTS DE WHATSAPP COM COPIAR COM 1 CLIQUE */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#173a34]">
                    Scripts Prontos para Abordagem no WhatsApp
                  </h3>
                  <p className="text-xs text-[#71867f]">
                    Copie com 1 clique e envie para novos profissionais cadastrados ou contatos da sua lista.
                  </p>
                </div>
                <Badge className="bg-[#173a34] text-white">Copiar em 1 Clique</Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* SCRIPT 1 */}
                <div className="rounded-2xl border border-[#dce5dc] bg-[#f8faf6] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs font-bold text-[#173a34] uppercase tracking-wider">
                        Script 1: Boas-Vindas & Ativação do Cartão
                      </strong>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `Olá [Nome], tudo bem? Aqui é da equipe do MeuAutônomo!\n\nVi que você acabou de criar seu espaço para atender como [Profissão].\n\nSeu cartão digital já está pronto no link: meuautonomo.com.br/p/[slug]\n\nVocê já pode colocar esse link no seu WhatsApp ou Instagram. Se precisar de ajuda para cadastrar seu primeiro serviço ou enviar um orçamento de teste, estou por aqui!`,
                            "script1"
                          )
                        }
                        className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#173a34]"
                      >
                        {copiedScript === "script1" ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5 text-[#8aa500]" /> Copiar Script
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-white p-4 font-mono text-xs leading-5 text-[#38584f] border border-[#e8ece7] whitespace-pre-wrap">
{`Olá [Nome], tudo bem? Aqui é da equipe do MeuAutônomo!

Vi que você acabou de criar seu espaço para atender como [Profissão].

Seu cartão digital já está pronto no link:
👉 meuautonomo.com.br/p/[slug]

Você já pode colocar esse link no seu WhatsApp ou Instagram. Se precisar de ajuda para cadastrar seu primeiro serviço ou enviar um orçamento de teste, estou por aqui!`}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#71867f]">
                    💡 Use assim que um profissional fizer o cadastro para acelerar a primeira proposta.
                  </p>
                </div>

                {/* SCRIPT 2 */}
                <div className="rounded-2xl border border-[#dce5dc] bg-[#f8faf6] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs font-bold text-[#173a34] uppercase tracking-wider">
                        Script 2: Oferta do Plano PRO (Upgrade)
                      </strong>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `Parabéns [Nome]! Você já gerou 3 propostas pelo MeuAutônomo e seus clientes estão adorando a agilidade.\n\nLiberamos para você um cupom de 30 dias com desconto no Plano PRO (orçamentos ilimitados, fotos de trabalhos e relatórios financeiros por apenas R$ 19,90 no primeiro mês).\n\nQuer ativar para experimentar no seu próximo serviço?`,
                            "script2"
                          )
                        }
                        className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#173a34]"
                      >
                        {copiedScript === "script2" ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5 text-[#8aa500]" /> Copiar Script
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-white p-4 font-mono text-xs leading-5 text-[#38584f] border border-[#e8ece7] whitespace-pre-wrap">
{`Parabéns [Nome]! Você já gerou 3 propostas pelo MeuAutônomo e seus clientes estão adorando a agilidade.

Liberamos para você um cupom de 30 dias com desconto no Plano PRO (orçamentos ilimitados, fotos de trabalhos e relatórios financeiros por apenas R$ 19,90 no primeiro mês).

Quer ativar para experimentar no seu próximo serviço?`}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#71867f]">
                    💡 Dispare quando o profissional criar a 3ª ou 4ª proposta gratuita. Taxa de conversão estimada em 15% a 25%.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: CRONOGRAMA DE 60 DIAS */}
            <div className="rounded-[24px] border-0 bg-white p-6 shadow-[0_8px_30px_rgba(19,42,39,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-[#2e6e4a]" />
                <h3 className="text-lg font-bold text-[#173a34]">
                  Plano de Ação para os Primeiros 60 Dias
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#8aa500]">Fase 1</span>
                    <Badge variant="outline" className="border-[#8aa500] text-[#556b10] text-[10px]">Dias 1 a 15</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Piloto & Validação</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Cadastrar 10 a 20 profissionais conhecidos (eletricista que conserta sua casa, manicure, etc.).</li>
                    <li>Acompanhar o envio do 1º orçamento real.</li>
                    <li>Utilizar o botão <em>"Zerar dados"</em> no painel admin para reiniciar testes sempre que necessário.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#23638e]">Fase 2</span>
                    <Badge variant="outline" className="border-[#23638e] text-[#23638e] text-[10px]">Dias 16 a 30</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Lançamento Orgânico</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Gravar e postar 3 vídeos por semana no Reels e TikTok mostrando o fluxo: Cartão -&gt; Orçamento -&gt; Aceite -&gt; Recibo.</li>
                    <li>Deixar displays de balcão com QR Code em 3 lojas parceiras de materiais ou beleza.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs uppercase text-[#2c7a45]">Fase 3</span>
                    <Badge variant="outline" className="border-[#2c7a45] text-[#2c7a45] text-[10px]">Dias 31 a 60</Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#173a34] mb-2">Escala & Primeiros Pagantes</h4>
                  <ul className="space-y-1.5 text-xs text-[#526d64] list-disc pl-4">
                    <li>Iniciar anúncios Meta Ads locais (R$ 20/dia).</li>
                    <li>Ativar checkout de assinatura PRO por R$ 24,90/mês.</li>
                    <li><strong>Meta inicial:</strong> 100 usuários ativos e 15 a 20 assinantes PRO recorrentes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: SIMULADOR VISUAL DE EXPERIÊNCIA */}
        {activeTab === "simulator" && <SimulatorTour />}
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE RESET SEGURO */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md rounded-[28px] border-0 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-950">Confirmar Reset Geral</h3>
                <p className="text-xs text-rose-700">Esta ação é irreversível.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5c756d] leading-relaxed">
              Todos os registros gerados nos testes (orçamentos, clientes, agenda, faturamento) serão apagados para deixar o banco 100% zerado.
            </p>

            <div>
              <Label className="mb-1 block text-xs font-semibold text-[#38584f]">
                Digite a palavra <strong className="text-rose-600">ZERAR</strong> para confirmar:
              </Label>
              <Input
                type="text"
                placeholder="ZERAR"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value.toUpperCase())}
                className="h-10 rounded-xl border-[#dce5dc] font-bold tracking-widest text-center"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput("");
                }}
                className="rounded-xl border-[#dce5dc]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={resetConfirmInput !== "ZERAR" || resetMutation.isPending}
                onClick={() => resetMutation.mutate()}
                className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {resetMutation.isPending ? "Zerando..." : "Sim, zerar dados"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
