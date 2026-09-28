import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "@/components/AuthModal";
import { ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList, LogIn, Menu, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: CalendarDays, title: "Agenda que acompanha seu ritmo", text: "Organize atendimentos, horários e mudanças sem planilhas espalhadas." },
  { icon: Users, title: "Clientes em um só lugar", text: "Tenha contatos, histórico e próximos passos acessíveis quando precisar." },
  { icon: ClipboardList, title: "Pedidos que viram trabalho", text: "Receba solicitações pela sua página e responda com mais agilidade." },
  { icon: CircleDollarSign, title: "Dinheiro sem complicação", text: "Registre pagamentos e saiba o que entrou e o que ainda está pendente." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const { theme, setTheme } = useTheme();

  const openAuth = (tab: "register" | "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return <div className="min-h-screen overflow-hidden bg-[#f5f7f2] text-[#173a34]">
    <header className="relative z-20 border-b border-[#dce5dc] bg-[#f5f7f2]/90 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 flex h-20 sm:h-24 items-center justify-between">
        <a href="#top" className="flex items-center py-1"><img src="/logo.png" alt="MeuAutônomo" className="h-13 sm:h-16 w-auto object-contain" /></a>
        <nav className="hidden items-center gap-4 text-sm font-semibold text-[#5c756d] md:flex">
          <a href="#como-funciona" className="transition hover:text-[#173a34]">Como funciona</a>
          <a href="#recursos" className="transition hover:text-[#173a34]">Recursos</a>
          <label className="sr-only" htmlFor="theme-select">Tema</label>
          <select id="theme-select" value={theme} onChange={event => setTheme(event.target.value as "light" | "dark" | "system")} className="h-9 rounded-xl border border-[#dce5dc] bg-white/60 px-2 text-xs font-semibold text-[#58716b] outline-none focus:ring-2 focus:ring-[#d9f56a]">
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="system">Automático</option>
          </select>
          <Button variant="ghost" onClick={() => openAuth("login")} className="rounded-xl text-[#173a34] hover:bg-[#e4ece4]">
            <LogIn className="mr-1.5 h-4 w-4" /> Entrar
          </Button>
          <Button onClick={() => openAuth("register")} className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]">
            <UserPlus className="mr-1.5 h-4 w-4" /> Criar Conta
          </Button>
        </nav>
        <button className="rounded-xl p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div className="border-t border-[#dce5dc] bg-white p-4 md:hidden">
        <div className="grid gap-3">
          <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold">Como funciona</a>
          <a href="#recursos" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold">Recursos</a>
          <label className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[#82948e]" htmlFor="mobile-theme-select">Tema</label>
          <select id="mobile-theme-select" value={theme} onChange={event => setTheme(event.target.value as "light" | "dark" | "system")} className="h-11 rounded-xl border border-[#dce5dc] bg-white px-3 text-sm font-semibold">
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="system">Automático</option>
          </select>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={() => { setMenuOpen(false); openAuth("login"); }} className="rounded-xl border-[#cbd8cc] text-[#173a34]">
              Entrar
            </Button>
            <Button onClick={() => { setMenuOpen(false); openAuth("register"); }} className="rounded-xl bg-[#173a34] text-white">
              Criar Conta
            </Button>
          </div>
        </div>
      </div>}
    </header>
    <main id="top">
      <section className="relative">
        <div className="absolute -right-36 -top-28 h-[480px] w-[480px] rounded-full bg-[#d9f56a]/40 blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative grid items-center gap-14 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24 lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ccdc9b] bg-[#f1f7dd] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#6e8313]">
              <span className="h-2 w-2 rounded-full bg-[#9ab41d]" /> Feito para quem faz acontecer
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-[-0.055em] text-[#173a34] sm:text-6xl lg:text-7xl">
              Seu trabalho. <span className="text-[#819815]">Mais leve.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#627b72]">
              O MeuAutônomo reúne agenda, clientes, serviços, pedidos e pagamentos em um espaço simples para você trabalhar melhor.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => openAuth("register")} className="h-13 rounded-2xl bg-[#173a34] px-6 text-base text-white shadow-[0_12px_24px_rgba(19,42,39,0.16)] hover:bg-[#28564d]">
                Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={() => openAuth("login")} className="h-13 rounded-2xl border-[#cbd8cc] bg-transparent px-6 text-base text-[#416158] hover:bg-white/60">
                Já tenho conta (Entrar)
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#708880]">
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Sem planilhas</span>
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Sem burocracia</span>
              <span><CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />Do seu jeito</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -left-6 top-12 h-28 w-28 rounded-[32px] bg-[#173a34] opacity-10 blur-xl" />
            <div className="relative rotate-1 rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_25px_70px_rgba(19,42,39,0.13)] sm:p-5">
              <div className="rounded-[23px] bg-[#f5f7f2] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8aa500]">Seu espaço</p>
                    <h3 className="mt-1 text-xl font-bold text-[#173a34]">Tudo começa aqui.</h3>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9f56a] text-sm font-bold text-[#173a34]">+</div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#173a34] p-4 text-white">
                    <CalendarDays className="h-4 w-4 text-[#d9f56a]" />
                    <p className="mt-4 text-2xl font-bold">—</p>
                    <p className="mt-1 text-[11px] text-white/60">atendimentos cadastrados</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <CircleDollarSign className="h-4 w-4 text-[#8aa500]" />
                    <p className="mt-4 text-2xl font-bold text-[#173a34]">—</p>
                    <p className="mt-1 text-[11px] text-[#879b93]">receitas registradas</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#34574d]">Próximo atendimento</p>
                    <span className="rounded-full bg-[#f5f8f2] px-2 py-1 text-[10px] font-bold text-[#819815]">Ainda não há</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e]">+</div>
                    <div>
                      <p className="text-sm font-semibold text-[#284b42]">Sua agenda está livre</p>
                      <p className="text-xs text-[#82948e]">Cadastre seu primeiro atendimento</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f1f7dd] p-4 cursor-pointer hover:bg-[#eaf3d1] transition" onClick={() => openAuth("register")}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9f56a]"><Users className="h-4 w-4" /></div>
                    <p className="text-xs font-semibold text-[#526b4d]">Comece cadastrando seus dados</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#829a14]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl bg-[#173a34] px-4 py-3 text-white shadow-xl sm:block">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#d9f56a]">Tudo em um só lugar</p>
              <p className="mt-1 text-sm font-semibold">Você no controle</p>
            </div>
          </div>
        </div>
      </section>
      <section id="como-funciona" className="border-y border-[#dce5dc] bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">Menos burocracia, mais utilidade</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">Um espaço que entende o seu dia.</h2>
            <p className="mt-4 text-lg leading-8 text-[#6d837b]">Você não precisa aprender um sistema complicado. Abra, veja o que importa e continue fazendo o seu trabalho.</p>
          </div>
          <div id="recursos" className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[22px] bg-[#f5f7f2] p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(19,42,39,0.06)]">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d9f56a] text-[#173a34]"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-lg font-bold text-[#284b42]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#71867f]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="rounded-[30px] bg-[#173a34] p-7 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9f56a]">Pronto para simplificar?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Organize seu trabalho para cuidar do que realmente importa.</h2>
            <p className="mt-4 leading-7 text-white/65">Crie seu espaço, compartilhe seu cartão profissional e comece a atender com mais clareza.</p>
          </div>
          <Button onClick={() => openAuth("register")} className="mt-8 h-13 shrink-0 rounded-2xl bg-[#d9f56a] px-6 text-base font-bold text-[#173a34] hover:bg-[#e8ff8e] lg:mt-0">
            Criar meu espaço agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>
    <footer className="border-t border-[#dce5dc] py-8">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col justify-between items-center gap-3 text-sm text-[#82948e] sm:flex-row">
        <img src="/logo.png" alt="MeuAutônomo" className="h-8 w-auto object-contain" />
        <span>Feito para profissionais que fazem acontecer.</span>
      </div>
    </footer>

    <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
  </div>;
}

