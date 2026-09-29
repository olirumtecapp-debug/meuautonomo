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
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogIn,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COOKIE_NAME } from "@shared/const";

export function setSessionToken(token: string) {
  try {
    localStorage.setItem("manus-token", token);
    sessionStorage.setItem("manus-token", token);
    sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${token}`);
    document.cookie = `${COOKIE_NAME}=${token}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch (e) {
    console.warn("[Auth] Failed to set session token in storage", e);
  }
}

export function clearSessionToken() {
  try {
    localStorage.removeItem("manus-token");
    sessionStorage.removeItem("manus-token");
    sessionStorage.removeItem("manus-cookie");
    localStorage.removeItem("manus-runtime-user-info");
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch (e) {
    console.warn("[Auth] Failed to clear session token", e);
  }
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "register" | "login";
}

export function AuthModal({ open, onOpenChange, defaultTab = "register" }: AuthModalProps) {
  const [tab, setTab] = useState<"register" | "login">(defaultTab);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulário de Cadastro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const utils = trpc.useUtils();

  const handleTabChange = (newTab: "register" | "login") => {
    setTab(newTab);
    setErrorMessage(null);
  };

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
      utils.auth.me.setData(undefined, data.user);
      toast.success("Conta criada com sucesso! Redirecionando para seu espaço...");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      const msg = err.message || "Não foi possível criar sua conta. Verifique os dados.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
      utils.auth.me.setData(undefined, data.user);
      toast.success("Login realizado com sucesso! Redirecionando...");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      const msg = err.message || "E-mail ou senha incorretos. Verifique e tente novamente.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName || trimmedName.length < 2) {
      const msg = "Informe seu nome completo ou profissional (mínimo 2 caracteres).";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      const msg = "Informe um e-mail válido.";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (regPassword.length < 6) {
      const msg = "A senha deve ter pelo menos 6 caracteres.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    registerMutation.mutate({
      name: trimmedName,
      email: trimmedEmail,
      password: regPassword,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = loginEmail.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      const msg = "Informe seu e-mail cadastrado.";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (!loginPassword) {
      const msg = "Informe sua senha de acesso.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    loginMutation.mutate({
      email: trimmedEmail,
      password: loginPassword,
    });
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) {
          setErrorMessage(null);
          onOpenChange(val);
        }
      }}
    >
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
            onClick={() => handleTabChange("register")}
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
            onClick={() => handleTabChange("login")}
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

        {/* Mensagem de Erro Inline Clara e Visível */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

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
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
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
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
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
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
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
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
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
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
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
      </DialogContent>
    </Dialog>
  );
}
