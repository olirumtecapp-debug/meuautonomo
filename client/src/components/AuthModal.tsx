import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Lock, LogIn, Sparkles, User, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "register" | "login";
}

export function AuthModal({ open, onOpenChange, defaultTab = "register" }: AuthModalProps) {
  const [tab, setTab] = useState<"register" | "login">(defaultTab);

  // Formulário de Cadastro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      try {
        if (data.sessionToken) {
          sessionStorage.setItem("manus-cookie", data.sessionToken);
        }
      } catch (e) {}
      toast.success("Conta criada com sucesso! Bem-vindo ao MeuAutônomo.");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível criar sua conta.");
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      try {
        if (data.sessionToken) {
          sessionStorage.setItem("manus-cookie", data.sessionToken);
        }
      } catch (e) {}
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      toast.error(err.message || "E-mail ou senha incorretos.");
    },
  });

  const quickLoginMutation = trpc.auth.quickLogin.useMutation({
    onSuccess: (data) => {
      try {
        if (data.sessionToken) {
          sessionStorage.setItem("manus-cookie", data.sessionToken);
        }
      } catch (e) {}
      toast.success(`Acessando espaço de ${data.user?.name || "teste"}...`);
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      toast.error(err.message || "Erro no acesso rápido.");
    },
  });

  const usersQuery = trpc.auth.listUsers.useQuery(undefined, {
    enabled: open,
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return toast.error("Informe seu nome completo ou profissional.");
    if (!regEmail.trim()) return toast.error("Informe seu e-mail.");
    if (regPassword.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");

    registerMutation.mutate({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return toast.error("Informe seu e-mail.");
    if (!loginPassword) return toast.error("Informe sua senha.");

    loginMutation.mutate({
      email: loginEmail.trim(),
      password: loginPassword,
    });
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending || quickLoginMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-lg overflow-y-auto rounded-[28px] border-0 bg-white p-6 shadow-[0_25px_70px_rgba(19,42,39,0.18)] sm:p-8">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto object-contain" />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f7dd] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6e8313]">
              <Sparkles className="h-3 w-3 text-[#8aa500]" /> Acesso
            </div>
          </div>
          <DialogTitle className="mt-4 text-2xl font-bold tracking-tight text-[#173a34] sm:text-3xl">
            {tab === "register" ? "Crie sua conta profissional" : "Acesse seu espaço"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#627b72]">
            {tab === "register"
              ? "Cadastre-se para começar a organizar atendimentos, clientes e orçamentos."
              : "Entre com seu e-mail e senha cadastrados para acessar seu painel."}
          </DialogDescription>
        </DialogHeader>

        {/* Abas Alternáveis */}
        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#f5f7f2] p-1.5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setTab("register")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 transition",
              tab === "register"
                ? "bg-[#173a34] text-white shadow-sm"
                : "text-[#5b736b] hover:text-[#173a34]"
            )}
          >
            <UserPlus className="h-4 w-4" /> Criar Conta
          </button>
          <button
            type="button"
            onClick={() => setTab("login")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 transition",
              tab === "login"
                ? "bg-[#173a34] text-white shadow-sm"
                : "text-[#5b736b] hover:text-[#173a34]"
            )}
          >
            <LogIn className="h-4 w-4" /> Entrar
          </button>
        </div>

        {/* Formulário: Criar Conta */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Como quer ser chamado(a)?
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex.: Carlos Ferreira ou Silva Eletricista"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Seu E-mail
              </Label>
              <Input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="seuemail@exemplo.com.br"
                className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm focus:border-[#173a34]"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Crie uma Senha
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#f1f7dd] p-3 text-xs text-[#52694e]">
              <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 text-[#8aa500]" />
              Ao criar a conta, você configurará sua profissão, serviços e horários no assistente guiado.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#173a34] text-base font-bold text-white hover:bg-[#28564d]"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando sua conta...
                </>
              ) : (
                <>
                  Criar minha conta e começar <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Formulário: Entrar */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Seu E-mail
              </Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seuemail@exemplo.com.br"
                className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm focus:border-[#173a34]"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Sua Senha
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#173a34] text-base font-bold text-white hover:bg-[#28564d]"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  Entrar no meu espaço <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Seção de Contas de Teste / Demonstração Rápida */}
        {usersQuery.data && usersQuery.data.length > 0 && (
          <div className="mt-6 border-t border-[#e2ece4] pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
              Contas cadastradas no ambiente de teste:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {usersQuery.data.map((u) => (
                <button
                  key={u.openId}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => quickLoginMutation.mutate({ openId: u.openId })}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dce5dc] bg-[#f5f7f2] px-3 py-2 text-xs font-semibold text-[#173a34] transition hover:border-[#173a34] hover:bg-white"
                >
                  <Users className="h-3.5 w-3.5 text-[#8aa500]" />
                  <span>{u.name}</span>
                  <span className="text-[10px] text-[#869b93]">({u.email})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#edf1eb] text-center">
          <a
            href="/admin"
            className="text-[11px] font-medium text-[#8ea098] hover:text-[#173a34] inline-flex items-center gap-1 transition"
          >
            <Lock className="h-3 w-3 text-[#8aa500]" /> Painel de Administração & Reset de Testes
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
