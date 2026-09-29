import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  History,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  RefreshCcw,
  Send,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trash2,
  UserRound,
  Users,
  UserCheck,
  Percent,
  MessageSquare,
  Building2,
  WalletCards,
  X,
  HelpCircle,
  Globe,
  Info,
  QrCode,
  Receipt,
  Smartphone,
  Lightbulb,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SERVICE_CATALOG } from "../data/servicesCatalog";
import { ALL_PROFESSIONS_FLAT, POPULAR_PROFESSIONS, findCategoryForProfession, getProfessionsByCategory } from "../data/professions";
import { checkServiceSpelling } from "../utils/serviceSpellcheck";
import { StateCitySelect } from "@/components/StateCitySelect";
import { ReceiptModal, type ReceiptData } from "@/components/ReceiptModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { lookupCep, formatCep } from "@/utils/cep";
import { GuidedTutorialModal } from "@/components/GuidedTutorialModal";
import { formatBrl, formatBrlInput, parseBrlToCents } from "@/utils/currency";
import { SimulatorTour } from "@/components/SimulatorTour";


const money = (cents = 0) => formatBrl(cents);
const dateLabel = (date: Date | string) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(" de ", " ");
const timeLabel = (date: Date | string) => new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"; };
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const formatPhone = (val: string = "") => {
  if (!val) return "";
  const digits = String(val).replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const statusLabel: Record<string, string> = { agendado: "Agendado", confirmado: "Confirmado", andamento: "Em andamento", concluido: "Concluído", cancelado: "Cancelado", faltou: "Não compareceu", nova: "Nova", em_analise: "Em análise", orcamento_enviado: "Orçamento enviado", agendada: "Agendada", arquivada: "Arquivada", rascunho: "Rascunho", enviado: "Enviado", aceito: "Aceito", recusado: "Recusado", alteracao_solicitada: "Alteração solicitada" };
const statusClass: Record<string, string> = { concluido: "bg-[#e3f5e3] text-[#2c7a45]", confirmado: "bg-[#e1effa] text-[#23638e]", agendado: "bg-[#fff4d7] text-[#906815]", nova: "bg-[#eef5c8] text-[#667700]", enviado: "bg-[#e8eef8] text-[#496b98]", aceito: "bg-[#e3f5e3] text-[#2c7a45]", pendente: "bg-[#fff4d7] text-[#906815]", pago: "bg-[#e3f5e3] text-[#2c7a45]", parcial: "bg-[#e8eef8] text-[#496b98]", cancelado: "bg-[#f9e5e3] text-[#9c4d43]" };
const modalityLabel: Record<string, string> = { presencial: "No seu espaço", endereco: "No endereço do cliente", online: "Online", hibrido: "Híbrido" };

export function AppHome() {
  const { user, loading: authLoading } = useAuth();
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    retry: false,
    enabled: Boolean(user),
  });

  if (authLoading || (user && profileQuery.isLoading)) return <LoadingScreen />;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.replace("/?login=true");
    }
    return <LoadingScreen />;
  }
  if (!profileQuery.data) return <Onboarding />;
  return <DashboardLayout><Workspace /></DashboardLayout>;
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-[#f5f7f2]"><div className="flex items-center gap-3 text-[#58716b]"><RefreshCcw className="h-5 w-5 animate-spin" /> Carregando seu espaço…</div></div>;
}

function ProfessionSelectField({
  professionName,
  professionCategory,
  onChange,
}: {
  professionName: string;
  professionCategory: string;
  onChange: (name: string, category: string) => void;
}) {
  const initialCat = useMemo(() => {
    if (professionCategory) return professionCategory;
    if (professionName) return findCategoryForProfession(professionName);
    return "";
  }, [professionCategory, professionName]);

  const isKnownCat = POPULAR_PROFESSIONS.some(
    (c) => c.category.toLowerCase() === initialCat.toLowerCase()
  );

  const [chosenCategory, setChosenCategory] = useState<string>(
    initialCat ? (isKnownCat ? initialCat : "__outra_categoria__") : ""
  );

  const [customCategory, setCustomCategory] = useState<string>(
    initialCat && !isKnownCat ? initialCat : ""
  );

  const availableProfessions = useMemo(() => {
    if (!chosenCategory || chosenCategory === "__outra_categoria__") return [];
    return getProfessionsByCategory(chosenCategory);
  }, [chosenCategory]);

  const isKnownProf = availableProfessions.some(
    (p) => p.toLowerCase() === (professionName || "").trim().toLowerCase()
  );

  const [isCustomProf, setIsCustomProf] = useState<boolean>(
    Boolean(professionName && !isKnownProf)
  );

  const activeCatObj = POPULAR_PROFESSIONS.find(
    (c) => c.category.toLowerCase() === chosenCategory.toLowerCase()
  );

  const handleCategoryChange = (val: string) => {
    setChosenCategory(val);
    if (val === "__outra_categoria__") {
      setIsCustomProf(true);
      onChange(professionName || "", customCategory || "Outros Serviços");
    } else {
      const newProfList = getProfessionsByCategory(val);
      const stillValid = newProfList.some(
        (p) => p.toLowerCase() === (professionName || "").trim().toLowerCase()
      );
      if (!stillValid) {
        setIsCustomProf(false);
        onChange("", val);
      } else {
        onChange(professionName, val);
      }
    }
  };

  const handleProfessionChange = (val: string) => {
    if (val === "__outra_profissao__") {
      setIsCustomProf(true);
      onChange("", chosenCategory);
    } else {
      setIsCustomProf(false);
      onChange(val, chosenCategory);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-4 sm:p-5">
      {/* 1º PASSO: MODALIDADE / RAMO DE ATUAÇÃO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-[#173a34] flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
              1
            </span>
            Modalidade / Área de atuação
          </Label>
          <span className="text-[11px] font-medium text-[#7a938c]">
            Ramo do seu serviço
          </span>
        </div>

        <Select value={chosenCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-12 w-full rounded-xl border-[#dce5dc] bg-white text-sm font-semibold text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15">
            <SelectValue placeholder="Selecione a modalidade (ex.: Casa e manutenção, Beleza...)" />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-2xl border-[#dce5dc] shadow-xl">
            {POPULAR_PROFESSIONS.map((cat) => (
              <SelectItem
                key={cat.category}
                value={cat.category}
                className="py-2.5 text-sm font-medium hover:bg-[#f0f5ec]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.category}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem
              value="__outra_categoria__"
              className="mt-1 border-t border-[#edf1eb] py-2.5 text-sm font-bold text-[#627912] bg-[#f8faf2]"
            >
              ✍️ Outra modalidade / ramo (digitar livremente)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CASO SEJA CATEGORIA MANUAL */}
      {chosenCategory === "__outra_categoria__" && (
        <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-white p-3.5 border border-[#dce5dc]">
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-[#38584f]">
              Nome da Modalidade / Área
            </Label>
            <Input
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                onChange(professionName, e.target.value);
              }}
              placeholder="Ex.: Artesanato, Náutica..."
              className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-[#38584f]">
              Sua Atividade / Profissão
            </Label>
            <Input
              value={professionName}
              onChange={(e) => onChange(e.target.value, customCategory || "Serviços Gerais")}
              placeholder="Ex.: Tapeceiro náutico, Ceramista..."
              className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm"
            />
          </div>
        </div>
      )}

      {/* 2º PASSO: ATIVIDADE ESPECÍFICA (ABRE APÓS ESCOLHER A MODALIDADE) */}
      {chosenCategory && chosenCategory !== "__outra_categoria__" && (
        <div className="space-y-2 pt-1 border-t border-[#edf1eb]">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold text-[#173a34] flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#173a34] text-[11px] font-bold text-[#d9f56a]">
                2
              </span>
              Atividade / Profissão ({activeCatObj?.category})
            </Label>
            <span className="text-[11px] font-medium text-[#7a938c]">
              Escolha sua especialidade
            </span>
          </div>

          {!isCustomProf ? (
            <Select
              value={professionName || undefined}
              onValueChange={handleProfessionChange}
            >
              <SelectTrigger className="h-12 w-full rounded-xl border-[#dce5dc] bg-white text-sm font-semibold text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15">
                <SelectValue placeholder={`Escolha sua atividade em ${activeCatObj?.category}...`} />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border-[#dce5dc] shadow-xl">
                {availableProfessions.map((prof) => (
                  <SelectItem key={prof} value={prof} className="py-2.5 text-sm font-medium">
                    {prof}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__outra_profissao__"
                  className="mt-1 border-t border-[#edf1eb] py-2.5 text-sm font-bold text-[#627912] bg-[#f8faf2]"
                >
                  ✍️ Outra profissão nesta área...
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2 rounded-xl bg-white p-3.5 border border-[#dce5dc]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#38584f]">
                  Digite o nome da sua atividade:
                </Label>
                <button
                  type="button"
                  onClick={() => setIsCustomProf(false)}
                  className="text-xs font-semibold text-[#173a34] underline hover:text-[#557718]"
                >
                  Voltar para lista de {activeCatObj?.category}
                </button>
              </div>
              <Input
                value={professionName}
                onChange={(e) => onChange(e.target.value, chosenCategory)}
                placeholder="Ex.: Técnico especialista em aquecedores..."
                className="h-11 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm font-medium focus:border-[#173a34]"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* SE AINDA NÃO ESCOLHEU A MODALIDADE */}
      {!chosenCategory && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#dce5dc] bg-[#f4f7f1] p-3 text-xs text-[#6e857e]">
          <span className="text-sm">💡</span>
          <span>Selecione a modalidade acima no <strong>passo 1</strong> para liberar a lista de atividades correspondentes.</span>
        </div>
      )}

      {/* BADGE DE CONFIRMAÇÃO VISUAL */}
      {chosenCategory && professionName && (
        <div className="flex items-center gap-2 pt-1 text-xs text-[#4e6a61]">
          <span className="font-semibold text-[#284b42]">Seu perfil profissional:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f7dd] px-3 py-1 font-bold text-[#566c0e]">
            {activeCatObj?.icon && <span>{activeCatObj.icon}</span>}
            <span>{chosenCategory === "__outra_categoria__" ? (customCategory || "Personalizado") : chosenCategory}</span>
            <ChevronRight className="h-3 w-3 text-[#7a931a]" />
            <span className="text-[#173a34]">{professionName}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function PublicAddressField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-[#38584f]">
            Endereço público do seu espaço
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#edf4e8] text-[#6d8a24] hover:bg-[#d9f56a] hover:text-[#173a34] transition"
                title="Clique para entender o que é o endereço público"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80 rounded-2xl border border-[#dce5dc] bg-white p-4 shadow-xl z-50">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d9f56a] text-[#173a34]">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#173a34]">
                    O que é o Endereço Público?
                  </h4>
                  <p className="text-xs leading-relaxed text-[#5c756d]">
                    É o link da sua página na web (seu cartão profissional digital). Seus clientes poderão abrir esse link pelo WhatsApp ou navegador para ver seus serviços e pedir orçamentos.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex h-12 w-full items-center rounded-xl border border-[#dce5dc] bg-[#fbfcf9] shadow-sm transition focus-within:border-[#173a34] focus-within:ring-2 focus-within:ring-[#173a34]/15">
        <span className="flex h-full shrink-0 select-none items-center border-r border-[#dce5dc] bg-[#eff5ec] px-3.5 text-xs font-bold text-[#557168] sm:text-sm">
          meuautonomo.app/
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(slugify(e.target.value))}
          placeholder="seu-nome-ou-negocio"
          className="h-full flex-1 bg-transparent px-3 text-sm font-semibold text-[#173a34] outline-none placeholder:text-[#9bad9a]"
        />
      </div>

      <p className="text-xs text-[#738a82]">
        🔗 Link do seu cartão digital. Você poderá enviar para clientes no WhatsApp ou colocar na bio do Instagram.
      </p>
    </div>
  );
}

function ServiceNameField({
  value,
  onChange,
  onSelectCatalog,
  professionName,
  placeholder = "Ex.: Instalação de chuveiro elétrico",
  label = "Nome do serviço",
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectCatalog?: (name: string, description?: string) => void;
  professionName?: string;
  placeholder?: string;
  label?: string;
}) {
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [autoFixed, setAutoFixed] = useState<{ from: string; to: string } | null>(null);

  const spellcheck = useMemo(() => {
    return checkServiceSpelling(value);
  }, [value]);

  const professionSuggestions = useMemo(() => {
    if (!professionName) return [];
    const profLower = professionName.toLowerCase();
    const found = SERVICE_CATALOG.find(
      (c) =>
        c.label.toLowerCase().includes(profLower) ||
        profLower.includes(c.label.toLowerCase()) ||
        c.id.toLowerCase().includes(profLower)
    );
    return found ? found.services.slice(0, 5) : [];
  }, [professionName]);

  const showCorrection = spellcheck.hasCorrection && dismissed !== spellcheck.correctedText;
  const showCatalog =
    spellcheck.catalogSuggestion &&
    spellcheck.catalogSuggestion.name.toLowerCase() !== value.trim().toLowerCase() &&
    dismissed !== spellcheck.catalogSuggestion.name;

  const handleBlur = () => {
    if (spellcheck.hasCorrection && spellcheck.correctedText.toLowerCase() !== value.trim().toLowerCase()) {
      const orig = value;
      const fixed = spellcheck.correctedText;
      onChange(fixed);
      setAutoFixed({ from: orig, to: fixed });
      toast.info(`Ortografia ajustada: "${fixed}"`, {
        description: `Corrigido automaticamente de "${orig}".`,
        action: {
          label: "Desfazer",
          onClick: () => {
            onChange(orig);
            setDismissed(fixed);
            setAutoFixed(null);
          },
        },
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-[#38584f] flex items-center gap-1.5">
          {label}
        </Label>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#708818] bg-[#f4f8e6] px-2 py-0.5 rounded-full border border-[#e1ecc2]">
          <Sparkles className="h-3 w-3" /> Corretor ortográfico ativo
        </span>
      </div>

      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (autoFixed && e.target.value !== autoFixed.to) {
              setAutoFixed(null);
            }
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" && spellcheck.hasCorrection) {
              e.preventDefault();
              onChange(spellcheck.correctedText);
              setDismissed(spellcheck.correctedText);
            }
          }}
          placeholder={placeholder}
          spellCheck={true}
          lang="pt-BR"
          autoCorrect="on"
          autoCapitalize="sentences"
          className="h-12 rounded-xl border-[#dce5dc] bg-white text-sm font-medium text-[#173a34] focus:border-[#173a34] focus:ring-2 focus:ring-[#173a34]/15"
        />
      </div>

      {/* FEEDBACK DE CORREÇÃO AUTOMÁTICA COM BOTÃO DESFAZER */}
      {autoFixed && autoFixed.to === value && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#d2e4c4] bg-[#f6fbf2] p-2 text-xs transition animate-in fade-in">
          <div className="flex items-center gap-1.5 text-[#2c4b3f]">
            <Sparkles className="h-3.5 w-3.5 text-[#708818]" />
            <span>Corrigido automaticamente para <strong className="font-bold text-[#173a34]">"{autoFixed.to}"</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(autoFixed.from);
              setDismissed(autoFixed.to);
              setAutoFixed(null);
            }}
            className="text-[11px] font-bold text-[#456b20] underline hover:text-[#173a34] transition cursor-pointer"
          >
            Desfazer
          </button>
        </div>
      )}

      {/* BALÃO DE CORREÇÃO ORTOGRÁFICA ENQUANTO DIGITA */}
      {showCorrection && (!autoFixed || autoFixed.to !== value) && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#d2e4c4] bg-[#f6fbf2] p-2.5 text-xs transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-[#2c4b3f]">
            <Sparkles className="h-4 w-4 shrink-0 text-[#6f8d16]" />
            <span>
              Você quis dizer: <strong className="font-bold text-[#173a34]">"{spellcheck.correctedText}"</strong>?
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onChange(spellcheck.correctedText);
                setDismissed(spellcheck.correctedText);
              }}
              className="rounded-lg bg-[#d9f56a] px-2.5 py-1 text-[11px] font-bold text-[#173a34] shadow-sm hover:bg-[#cbf046] transition"
            >
              Corrigir agora
            </button>
            <button
              type="button"
              onClick={() => setDismissed(spellcheck.correctedText)}
              className="rounded-lg px-2 py-1 text-[11px] text-[#71867f] hover:bg-black/5 transition"
              title="Dispensar sugestão"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* SUGESTÃO DE SERVIÇO PADRÃO DO CATÁLOGO */}
      {!showCorrection && showCatalog && spellcheck.catalogSuggestion && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#cbe4ee] bg-[#eef7fa] p-2.5 text-xs transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-[#225063]">
            <Sparkles className="h-4 w-4 shrink-0 text-[#2a7796]" />
            <span>
              Sugestão do catálogo: <strong className="font-bold text-[#103848]">"{spellcheck.catalogSuggestion.name}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onSelectCatalog) {
                  onSelectCatalog(spellcheck.catalogSuggestion!.name, spellcheck.catalogSuggestion!.description);
                } else {
                  onChange(spellcheck.catalogSuggestion!.name);
                }
                setDismissed(spellcheck.catalogSuggestion!.name);
              }}
              className="rounded-lg bg-[#246781] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#194e63] transition"
            >
              Usar sugestão
            </button>
            <button
              type="button"
              onClick={() => setDismissed(spellcheck.catalogSuggestion!.name)}
              className="rounded-lg px-2 py-1 text-[11px] text-[#5b7a87] hover:bg-black/5 transition"
              title="Dispensar sugestão"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* CHIPS DE SUGESTÕES RÁPIDAS BASEADAS NA PROFISSÃO DO USUÁRIO */}
      {professionSuggestions.length > 0 && !value && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-[#6e857e]">
            ✨ Sugestões prontas para {professionName} (clique para preencher):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {professionSuggestions.map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => {
                  if (onSelectCatalog) {
                    onSelectCatalog(sug.name, sug.description);
                  } else {
                    onChange(sug.name);
                  }
                }}
                className="rounded-lg border border-[#dce5dc] bg-[#fbfcf9] px-2.5 py-1 text-xs font-medium text-[#2d4b42] hover:border-[#173a34] hover:bg-white hover:text-[#173a34] transition"
              >
                + {sug.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState({
    displayName: user?.name || "",
    professionCategory: "",
    professionName: "",
    city: "",
    serviceRegion: "",
    slug: slugify(user?.name || "profissional"),
    bio: "",
  });
  const [service, setService] = useState({
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
    modality: "presencial" as "presencial" | "endereco" | "online" | "hibrido",
  });
  const [schedule, setSchedule] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    start: "08:00",
    end: "18:00",
  });

  const profileMutation = trpc.profile.upsert.useMutation();
  const serviceMutation = trpc.service.create.useMutation();
  const availabilityMutation = trpc.profile.saveAvailability.useMutation();

  const saveProfile = async () => {
    if (!profession.displayName.trim()) return toast.error("Informe como quer ser chamado.");
    if (!profession.professionName.trim()) return toast.error("Selecione ou informe sua profissão.");
    if (!profession.slug.trim()) return toast.error("Informe o endereço público do seu espaço.");

    try {
      await profileMutation.mutateAsync({
        ...profession,
        professionCategory: profession.professionCategory || "Serviços Gerais",
        city: profession.city || undefined,
        serviceRegion: profession.serviceRegion || undefined,
        bio: profession.bio || undefined,
        showPrices: true,
        bookingEnabled: false,
      });
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar seu perfil.");
    }
  };

  const saveService = async () => {
    if (!service.name.trim()) return toast.error("Dê um nome para seu primeiro serviço.");
    const spell = checkServiceSpelling(service.name);
    const finalName = spell.hasCorrection ? spell.correctedText : service.name;
    try {
      await serviceMutation.mutateAsync({
        name: finalName,
        description: service.description || undefined,
        durationMinutes: Number(service.durationMinutes),
        priceCents: parseBrlToCents(service.price),
        modality: service.modality,
      });
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar seu serviço.");
    }
  };

  const finish = async () => {
    const days = Object.entries(schedule)
      .filter(([key, value]) => ["mon", "tue", "wed", "thu", "fri", "sat"].includes(key) && value)
      .map(([key]) => key);
    try {
      await availabilityMutation.mutateAsync({
        schedule: JSON.stringify({ days, start: schedule.start, end: schedule.end }),
        unavailableDays: JSON.stringify([]),
      });
      toast.success("Seu espaço está pronto para começar!");
      window.location.href = "/app";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar sua agenda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center">
          <img src="/logo.png" alt="MeuAutônomo" className="h-12 w-auto object-contain" />
        </div>
        <div className="mb-8 grid grid-cols-3 gap-2">
          <Step n={1} active={step >= 1} label="Você" />
          <Step n={2} active={step >= 2} label="Serviço" />
          <Step n={3} active={step >= 3} label="Agenda" />
        </div>
        <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_60px_rgba(19,42,39,0.08)]">
          <div className="h-2 bg-[#d9f56a]" />
          <CardContent className="p-6 sm:p-10">
            {step === 1 && (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 1 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  O que você faz?
                </h1>
                <p className="mb-8 max-w-xl text-[#6b817a]">
                  Vamos deixar seu espaço com a sua cara. Selecione sua profissão ou escreva como você atua.
                </p>

                <div className="space-y-5">
                  <div className="space-y-4">
                    <Field
                      label="Como quer ser chamado?"
                      value={profession.displayName}
                      onChange={(value) => {
                        const newSlug = !profession.slug || profession.slug === slugify(profession.displayName)
                          ? slugify(value)
                          : profession.slug;
                        setProfession({ ...profession, displayName: value, slug: newSlug });
                      }}
                      placeholder="Ex.: Carlos Ferreira"
                    />

                    <StateCitySelect
                      value={profession.city}
                      onChange={(cityVal) =>
                        setProfession({
                          ...profession,
                          city: cityVal,
                          serviceRegion: cityVal ? `${cityVal} e região` : "",
                        })
                      }
                      helpText="Escolha onde você presta seus serviços para clientes encontrarem você mais fácil."
                    />
                  </div>

                  <ProfessionSelectField
                    professionName={profession.professionName}
                    professionCategory={profession.professionCategory}
                    onChange={(name, category) =>
                      setProfession({
                        ...profession,
                        professionName: name,
                        professionCategory: category,
                      })
                    }
                  />

                  <PublicAddressField
                    value={profession.slug}
                    onChange={(value) => setProfession({ ...profession, slug: value })}
                  />

                  <div>
                    <Label className="mb-2 block text-sm text-[#38584f]">
                      Uma frase sobre seu trabalho <span className="font-normal text-[#9bad9a]">(opcional)</span>
                    </Label>
                    <Textarea
                      value={profession.bio}
                      onChange={(e) => setProfession({ ...profession, bio: e.target.value })}
                      placeholder="Conte rapidamente como você ajuda seus clientes…"
                      className="min-h-24 rounded-2xl border-[#dce5dc] bg-[#fbfcf9]"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={saveProfile}
                    disabled={profileMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 2 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  Qual serviço você oferece?
                </h1>
                <p className="mb-8 max-w-xl text-[#6b817a]">
                  Comece com o seu principal serviço. Você poderá cadastrar outros depois.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <ServiceNameField
                      label="Nome do serviço"
                      value={service.name}
                      onChange={(value) => setService({ ...service, name: value })}
                      onSelectCatalog={(name, description) =>
                        setService({
                          ...service,
                          name,
                          description: description || service.description,
                        })
                      }
                      professionName={profession.professionName}
                      placeholder="Ex.: Instalação elétrica residencial"
                    />
                  </div>
                  <Field
                    label="Preço inicial"
                    value={service.price}
                    onChange={(value) => setService({ ...service, price: value })}
                    placeholder="150,00"
                    prefix="R$ "
                  />
                  <Field
                    label="Duração estimada (minutos)"
                    value={service.durationMinutes}
                    onChange={(value) => setService({ ...service, durationMinutes: value })}
                    placeholder="60"
                  />
                </div>
                <div className="mt-5">
                  <Label className="mb-2 block text-sm text-[#38584f]">Como você atende?</Label>
                  <Select
                    value={service.modality}
                    onValueChange={(value: typeof service.modality) =>
                      setService({ ...service, modality: value })
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">No meu espaço</SelectItem>
                      <SelectItem value="endereco">No endereço do cliente</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-5">
                  <Label className="mb-2 block text-sm text-[#38584f]">
                    Descrição <span className="font-normal text-[#9bad9a]">(opcional)</span>
                  </Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => setService({ ...service, description: e.target.value })}
                    placeholder="O que está incluído neste serviço?"
                    className="min-h-24 rounded-2xl border-[#dce5dc] bg-[#fbfcf9]"
                  />
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-xl text-[#58716b]">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    onClick={saveService}
                    disabled={serviceMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8aa500]">
                  Passo 3 de 3
                </p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#173a34] sm:text-4xl">
                  Quando você trabalha?
                </h1>
                <p className="mb-8 max-w-xl text-[#6b817a]">
                  Isso ajuda a evitar conflitos e mostra seus horários de atendimento.
                </p>
                <div>
                  <Label className="mb-3 block text-sm text-[#38584f]">Dias de trabalho</Label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["mon", "Seg"],
                      ["tue", "Ter"],
                      ["wed", "Qua"],
                      ["thu", "Qui"],
                      ["fri", "Sex"],
                      ["sat", "Sáb"],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSchedule({ ...schedule, [key]: !schedule[key] })}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                          schedule[key]
                            ? "border-[#173a34] bg-[#173a34] text-white"
                            : "border-[#dce5dc] bg-[#fbfcf9] text-[#78908a]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm text-[#38584f]">Começo</Label>
                    <Input
                      type="time"
                      value={schedule.start}
                      onChange={(e) => setSchedule({ ...schedule, start: e.target.value })}
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm text-[#38584f]">Fim</Label>
                    <Input
                      type="time"
                      value={schedule.end}
                      onChange={(e) => setSchedule({ ...schedule, end: e.target.value })}
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
                    />
                  </div>
                </div>
                <div className="mt-8 rounded-2xl bg-[#f1f7dd] p-4 text-sm text-[#52694e]">
                  <CheckCircle2 className="mb-2 h-5 w-5 text-[#8aa500]" />
                  <strong>Quase lá.</strong> Você poderá ajustar horários, adicionar serviços e compartilhar seu cartão a qualquer momento.
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-xl text-[#58716b]">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button
                    onClick={finish}
                    disabled={availabilityMutation.isPending}
                    className="h-12 rounded-xl bg-[#173a34] px-6 text-white hover:bg-[#28564d]"
                  >
                    Ir para meu espaço <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step({ n, active, label }: { n: number; active: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm font-semibold", active ? "text-[#173a34]" : "text-[#9bad9a]")}>
      <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs", active ? "bg-[#d9f56a] text-[#173a34]" : "bg-[#e7eee5] text-[#9bad9a]")}>
        {n}
      </span>
      {label}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  type?: string;
}) {
  const isPhone = type === "tel" || label.toLowerCase().includes("telefone") || label.toLowerCase().includes("whatsapp");
  const isCurrency = prefix === "R$ " || prefix === "R$" || type === "currency" || label.toLowerCase().includes("preço") || label.toLowerCase().includes("desconto") || label.toLowerCase() === "valor";

  const effectivePlaceholder = placeholder || (isPhone ? "(11) 98765-4321" : isCurrency ? "0,00" : undefined);
  const displayValue = isPhone ? formatPhone(value) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPhone) {
      onChange(formatPhone(e.target.value));
    } else if (isCurrency) {
      const raw = e.target.value.replace(/[^\d.,]/g, "");
      onChange(raw);
    } else {
      onChange(e.target.value);
    }
  };

  const handleBlur = () => {
    if (isCurrency && value) {
      const formatted = formatBrlInput(value);
      if (formatted && formatted !== value) {
        onChange(formatted);
      }
    }
  };

  const effectiveInputMode = isPhone ? "tel" : isCurrency ? "decimal" : undefined;
  const effectiveType = isPhone ? "tel" : isCurrency ? "text" : (type || "text");

  return (
    <div>
      <Label className="mb-2 block text-sm font-semibold text-[#38584f]">{label}</Label>
      {prefix || isCurrency ? (
        <div className="flex h-12 w-full items-center rounded-xl border border-[#dce5dc] bg-[#fbfcf9] shadow-sm transition focus-within:border-[#173a34] focus-within:ring-2 focus-within:ring-[#173a34]/15">
          <span className="flex h-full shrink-0 select-none items-center border-r border-[#dce5dc] bg-[#eff5ec] px-3.5 text-xs font-bold text-[#557168] sm:text-sm">
            {prefix || "R$ "}
          </span>
          <input
            type={effectiveType}
            inputMode={effectiveInputMode}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={effectivePlaceholder}
            className="h-full flex-1 bg-transparent px-3 text-sm font-semibold text-[#173a34] outline-none placeholder:text-[#9bad9a]"
          />
        </div>
      ) : (
        <Input
          type={effectiveType}
          inputMode={effectiveInputMode}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={effectivePlaceholder}
          className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm focus:border-[#173a34]"
        />
      )}
    </div>
  );
}

function Workspace() {
  const [location, setLocation] = useLocation();
  const route = location === "/" ? "/app" : location;
  if (route === "/app") return <Dashboard />;
  if (route === "/meu-dia") return <MeuDia />;
  if (route === "/relatorios") return <Reports />;
  if (route === "/agenda") return <Agenda />;
  if (route === "/clientes") return <Clients />;
  if (route === "/servicos") return <Services />;
  if (route === "/solicitacoes") return <Requests />;
  if (route === "/orcamentos") return <Quotes />;
  if (route === "/financeiro") return <Finance />;
  if (route === "/equipe") return <TeamPage />;
  if (route === "/cartao") return <ProfessionalCard />;
  if (route === "/tutorial" || route === "/guia") return <TutorialPage />;
  if (route === "/configuracoes") return <SettingsPage />;
  setLocation("/app");
  return null;
}

function HelpButton({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)} title="Como funciona?" className="grid h-6 w-6 place-items-center rounded-full text-[#9bad9a] transition hover:text-[#8aa500]"><HelpCircle className="h-5 w-5" /></button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle className="text-[#173a34]">{title}</DialogTitle></DialogHeader><div className="space-y-4 py-2 text-sm leading-6 text-[#526d64]">{children}</div></DialogContent></Dialog>
  </>;
}

function Page({ title, eyebrow, description, action, help, children }: { title: string; eyebrow?: string; description?: string; action?: React.ReactNode; help?: React.ReactNode; children: React.ReactNode }) { return <div className="container py-6 md:py-10"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">{eyebrow || "MeuAutônomo"}</p><div className="flex items-center gap-2"><h1 className="text-3xl font-bold tracking-tight text-[#173a34] md:text-4xl">{title}</h1>{help}</div>{description && <p className="mt-2 max-w-2xl text-[#6d837c]">{description}</p>}</div>{action && <div className="flex flex-wrap items-center gap-2">{action}</div>}</div>{children}</div>; }
function EmptyState({ icon: Icon, title, description, action }: { icon: typeof CalendarDays; title: string; description: string; action?: React.ReactNode }) { return <div className="grid place-items-center rounded-[24px] border border-dashed border-[#cddbcf] bg-white/60 px-6 py-16 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eef5d2] text-[#829a14]"><Icon className="h-6 w-6" /></div><h3 className="text-lg font-bold text-[#173a34]">{title}</h3><p className="mt-2 max-w-sm text-sm text-[#78908a]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }
function StatusBadge({ status }: { status: string }) { return <Badge className={cn("border-0 font-semibold", statusClass[status] || "bg-[#edf2ec] text-[#5d746d]")}>{statusLabel[status] || status}</Badge>; }

function Dashboard() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const range = useMemo(() => ({ from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined }), [from, to]);
  const summary = trpc.dashboard.summary.useQuery(range);
  const services = trpc.service.list.useQuery();
  const clients = trpc.customer.list.useQuery();
  const [, setLocation] = useLocation();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialTab, setTutorialTab] = useState<"passos" | "estudio" | "dicas">("passos");
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("meu-autonomo-tutorial-banner-dismissed") === "true";
  });
  if (summary.isLoading) return <LoadingScreen />;
  if (summary.error) return <Page title="Seu espaço" description="Não foi possível carregar seus dados agora."><Button onClick={() => summary.refetch()} className="bg-[#173a34] text-white"><RefreshCcw className="mr-2 h-4 w-4" /> Tentar novamente</Button></Page>;
  const data = summary.data!;
  const next = data.today.find(item => item.status !== "cancelado");
  const nextClient = next ? clients.data?.find(c => c.id === next.clientId) : null;
  const nextService = next ? services.data?.find(s => s.id === next.serviceId) : null;
  return <Page title={`${greeting()}, ${(data.profile.displayName || "profissional").split(" ")[0]}!`} eyebrow="Hoje" description="Uma visão rápida para você abrir e já saber o que precisa fazer." help={<HelpButton title="Como funciona o Painel?"><p><strong>O Painel</strong> é a sua central de comando. Aqui você vê, de relance, o que acontece no seu dia e no seu mês.</p><p><strong>Métricas:</strong> Atendimentos do dia, valor previsto, recebido no mês e valor em aberto.</p><p><strong>Próximo atendimento:</strong> O que vem a seguir na agenda, com horário, cliente e serviço.</p><p><strong>Solicitações recentes:</strong> Pedidos recebidos de clientes para você avaliar e transformar em agendamentos.</p><p><strong>Filtro de período:</strong> Use o filtro de datas para ver métricas de períodos específicos.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} /><Button onClick={() => setLocation("/agenda")} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Novo atendimento</Button></div>}>
    {!bannerDismissed && (
      <div className="relative mb-6 overflow-hidden rounded-[24px] border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-5 shadow-[0_8px_30px_rgba(23,58,52,0.06)] sm:p-6">
        <button
          type="button"
          onClick={() => {
            setBannerDismissed(true);
            localStorage.setItem("meu-autonomo-tutorial-banner-dismissed", "true");
          }}
          className="absolute top-4 right-4 rounded-lg p-1 text-[#758d7c] transition hover:bg-black/5 hover:text-[#173a34]"
          title="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-4 pr-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#173a34] text-[#d9f56a] shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-[#173a34] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#d9f56a]">
                  Novo por aqui?
                </Badge>
                <span className="text-xs font-semibold text-[#6d8a35]">Guia Passo a Passo</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-[#173a34] sm:text-xl">
                Aprenda a usar o MeuAutônomo em menos de 3 minutos
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#476356] sm:text-sm">
                Descubra como criar seu link profissional, cadastrar serviços com 1 clique, gerenciar parceiros no estúdio, emitir orçamentos no WhatsApp e organizar sua agenda.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-end md:self-center">
            <Button
              onClick={() => {
                setTutorialTab("passos");
                setTutorialOpen(true);
              }}
              className="h-10 rounded-xl bg-[#173a34] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#28564d]"
            >
              <BookOpen className="mr-2 h-4 w-4 text-[#d9f56a]" /> Ver Passo a Passo
            </Button>
            <Button
              onClick={() => {
                setTutorialTab("estudio");
                setTutorialOpen(true);
              }}
              variant="outline"
              className="h-10 border-[#b8d49e] bg-white px-3 text-xs font-semibold text-[#173a34] hover:bg-[#f4fae6]"
            >
              <Building2 className="mr-1.5 h-3.5 w-3.5 text-[#6d8a35]" /> Módulo Estúdio & Equipe
            </Button>
            <Button
              onClick={() => setLocation("/guia")}
              variant="ghost"
              className="h-10 px-2.5 text-xs font-semibold text-[#2a4d41] hover:bg-black/5"
            >
              Manual Completo <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    )}
    <GuidedTutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} defaultTab={tutorialTab} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Atendimentos hoje" value={String(data.metrics.todayCount)} hint="na sua agenda" icon={CalendarDays} accent="lime" /><Metric title="Previsto hoje" value={money(data.metrics.todayProjectedCents)} hint="em atendimentos" icon={WalletCards} accent="blue" /><Metric title="Recebido no mês" value={money(data.metrics.receivedCents)} hint="pagamentos registrados" icon={CircleDollarSign} accent="green" /><Metric title="A receber" value={money(data.metrics.pendingCents)} hint="em aberto" icon={ClipboardList} accent="orange" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-lg text-[#173a34]">Próximo atendimento</CardTitle><p className="mt-1 text-sm text-[#82948e]">O que vem a seguir no seu dia</p></div><CalendarDays className="h-5 w-5 text-[#8aa500]" /></CardHeader><CardContent>{next ? <div className="rounded-2xl bg-[#f4f8ed] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-2xl font-bold text-[#173a34]">{timeLabel(next.startsAt)}</p><p className="mt-1 text-sm text-[#71867f]">{dateLabel(next.startsAt)} · {next.durationMinutes} min</p></div><StatusBadge status={next.status} /></div><div className="mt-5 grid gap-3 text-sm text-[#5b746c] sm:grid-cols-2"><p><UserRound className="mr-2 inline h-4 w-4 text-[#8aa500]" />{nextClient ? nextClient.name : next.clientId ? `Cliente #${next.clientId}` : "Cliente a confirmar"}</p>{nextService && <p><BriefcaseBusiness className="mr-2 inline h-4 w-4 text-[#8aa500]" /><strong className="font-semibold text-[#284b42]">{nextService.name}</strong></p>}<p><WalletCards className="mr-2 inline h-4 w-4 text-[#8aa500]" />{money(next.amountCents)}</p><p><MapPin className="mr-2 inline h-4 w-4 text-[#8aa500]" />{next.location || "Local a combinar"}</p></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" className="rounded-xl border-[#ccdccc] bg-white text-[#34564d]" onClick={() => setLocation("/agenda")}>Ver agenda <ChevronRight className="ml-1 h-4 w-4" /></Button>{next.location && <Button variant="ghost" className="rounded-xl text-[#71867f]" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.location || "")}`, "_blank")}>Abrir rota <ExternalLink className="ml-1 h-4 w-4" /></Button>}</div></div> : <EmptyState icon={CalendarDays} title="Agenda livre por enquanto" description="Adicione seu próximo atendimento e deixe seu dia organizado." action={<Button onClick={() => setLocation("/agenda")} className="rounded-xl bg-[#173a34] text-white"><Plus className="mr-2 h-4 w-4" /> Adicionar atendimento</Button>} />}</CardContent></Card><div className="grid gap-6"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg text-[#173a34]">Solicitações recentes</CardTitle><Button variant="ghost" onClick={() => setLocation("/solicitacoes")} className="text-xs text-[#71867f]">Ver todas <ArrowRight className="ml-1 h-3 w-3" /></Button></CardHeader><CardContent className="space-y-3">{data.recentRequests.length ? data.recentRequests.map(request => <button key={request.id} onClick={() => setLocation("/solicitacoes")} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-[#f5f8f2]"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]"><ClipboardList className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#2b4d44]">{request.requesterName}</p><p className="truncate text-xs text-[#83968f]">{request.description}</p></div><StatusBadge status={request.status} /></button>) : <p className="py-5 text-sm text-[#83968f]">Quando um cliente pedir um serviço, ele aparecerá aqui.</p>}</CardContent></Card><Card className="rounded-[24px] border-0 bg-[#173a34] text-white shadow-[0_10px_35px_rgba(19,42,39,0.12)]"><CardContent className="p-6"><div className="mb-4 flex items-center gap-2 text-[#d9f56a]"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.15em]">Seu cartão</span></div><h3 className="text-xl font-bold">Compartilhe seu trabalho.</h3><p className="mt-2 text-sm leading-6 text-white/65">Tenha um link profissional para enviar no WhatsApp, Instagram e onde seus clientes estiverem.</p><Button onClick={() => setLocation("/cartao")} className="mt-5 rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e]">Abrir meu cartão <ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div></div>
  </Page>;
}
function Metric({ title, value, hint, icon: Icon, accent }: { title: string; value: string; hint: string; icon: typeof CalendarDays; accent: string }) { const colors: Record<string,string> = { lime: "bg-[#eef5d2] text-[#809614]", blue: "bg-[#e8f1f5] text-[#3f738e]", green: "bg-[#e3f3e8] text-[#3e885c]", orange: "bg-[#fff1d9] text-[#a27320]" }; return <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_26px_rgba(19,42,39,0.04)]"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#83968f]">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-[#173a34]">{value}</p><p className="mt-1 text-xs text-[#9aa9a3]">{hint}</p></div><div className={cn("grid h-10 w-10 place-items-center rounded-xl", colors[accent])}><Icon className="h-5 w-5" /></div></div></CardContent></Card>; }

function Agenda() {
  const today = new Date();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const bounds = useMemo(() => { const from = new Date(today.getFullYear(), today.getMonth(), today.getDate()); const to = new Date(from); if (view === "day") to.setDate(to.getDate() + 1); else if (view === "month") { from.setDate(1); to.setMonth(to.getMonth() + 1, 1); } else to.setDate(to.getDate() + 7); return { from: from.toISOString(), to: to.toISOString() }; }, [view]);
  const appointments = trpc.appointment.list.useQuery(bounds);
  const clients = trpc.customer.list.useQuery();
  const services = trpc.service.list.useQuery();
  const teamMembers = trpc.team.list.useQuery();
  const utils = trpc.useUtils();
  const getNextAppointmentSlot = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const create = trpc.appointment.create.useMutation({ onSuccess: () => { toast.success("Atendimento adicionado à agenda."); utils.appointment.list.invalidate(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", teamMemberId: "", startsAt: getNextAppointmentSlot(), durationMinutes: "60", amount: "", location: "", notes: "", status: "confirmado" });
  const handleOpenNew = () => {
    setForm({ clientId: "", serviceId: "", teamMemberId: "", startsAt: getNextAppointmentSlot(), durationMinutes: "60", amount: "", location: "", notes: "", status: "confirmado" });
    setOpen(true);
  };
  const submit = async () => { if (!form.startsAt || isNaN(new Date(form.startsAt).getTime())) return toast.error("Escolha data e horário válidos."); try { await create.mutateAsync({ clientId: form.clientId ? Number(form.clientId) : undefined, serviceId: form.serviceId ? Number(form.serviceId) : undefined, teamMemberId: form.teamMemberId ? Number(form.teamMemberId) : undefined, startsAt: new Date(form.startsAt).toISOString(), durationMinutes: Number(form.durationMinutes), amountCents: parseBrlToCents(form.amount), location: form.location || undefined, notes: form.notes || undefined, status: (form.status || "confirmado") as any, paymentStatus: "pendente" }); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar."); } };
  return <Page title="Agenda" eyebrow="Organize seus horários" description="Veja seus próximos atendimentos e mantenha o dia sob controle." help={<HelpButton title="Como funciona a Agenda?"><p><strong>A Agenda</strong> reúne todos os seus atendimentos. Use as abas Dia / Semana / Mês para navegar e o botão verde para adicionar um novo horário.</p><p><strong>O que cada status significa:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Agendado</strong> — horário marcado, aguardando confirmação.</li><li><strong>Confirmado</strong> — o cliente confirmou a presença.</li><li><strong>Em andamento</strong> — o atendimento está acontecendo agora.</li><li><strong>Concluído</strong> — finalizado com sucesso.</li><li><strong>Cancelado</strong> — não vai acontecer.</li><li><strong>Não compareceu</strong> — o cliente não apareceu no horário.</li></ul><p>Mude o status pelo seletor ao lado de cada atendimento. Você também pode editar ou excluir clicando nos ícones.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl bg-white p-1 shadow-sm">{(["day","week","month"] as const).map((key) => { const label = key === "day" ? "Dia" : key === "week" ? "Semana" : "Mês"; return <Button key={key} variant="ghost" onClick={() => setView(key)} className={cn("h-9 rounded-lg px-3 text-xs", view === key ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white" : "text-[#71867f]")}>{label}</Button>; })}</div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={handleOpenNew} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Novo atendimento</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>Novo atendimento</DialogTitle><DialogDescription>Reserve um horário para um cliente.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Cliente" value={form.clientId} onChange={value => setForm({ ...form, clientId: value })} placeholder="Selecionar cliente" options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))} /><FormSelect label="Serviço" value={form.serviceId} onChange={value => { const selected = services.data?.find(s => String(s.id) === value); setForm({ ...form, serviceId: value, amount: selected ? formatBrlInput(selected.priceCents) : form.amount, durationMinutes: selected ? String(selected.durationMinutes) : form.durationMinutes }); }} placeholder="Selecionar serviço" options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: s.name }))} /></div>{Boolean(teamMembers.data?.length) && <FormSelect label="Profissional / Parceiro(a)" value={form.teamMemberId} onChange={value => setForm({ ...form, teamMemberId: value })} placeholder="Eu mesmo(a) (Titular)" options={[{ value: "", label: "Eu mesmo(a) (Titular)" }, ...(teamMembers.data || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role})` }))]} />}<div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Situação" value={form.status} onChange={value => setForm({ ...form, status: value })} options={[["confirmado","Confirmado"],["agendado","Agendado"],["concluido","Concluído"]].map(([value,label]) => ({ value, label }))} /><div><Label className="mb-2 block">Data e horário</Label><Input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Duração (min)" value={form.durationMinutes} onChange={value => setForm({ ...form, durationMinutes: value })} /><Field label="Valor" prefix="R$ " value={form.amount} onChange={value => setForm({ ...form, amount: value })} /></div><div><Field label="Local" value={form.location} onChange={value => setForm({ ...form, location: value })} placeholder="Endereço ou link" /></div><div><Label className="mb-2 block">Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div></div><DialogFooter><Button onClick={submit} disabled={create.isPending} className="rounded-xl bg-[#173a34] text-white">Salvar atendimento</Button></DialogFooter></DialogContent></Dialog></div>}>
    <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader className="border-b border-[#edf1eb] pb-4"><div className="flex items-center justify-between"><div><CardTitle className="text-lg text-[#173a34]">{view === "day" ? "Hoje" : view === "month" ? "Este mês" : "Próximos 7 dias"}</CardTitle><p className="mt-1 text-sm text-[#82948e]">Toque em um atendimento para acompanhar o status.</p></div><div className="hidden items-center gap-2 text-xs text-[#82948e] sm:flex"><span className="h-2 w-2 rounded-full bg-[#d9f56a]" /> Hoje</div></div></CardHeader><CardContent className="p-0">{appointments.isLoading ? <div className="p-8 text-[#82948e]">Carregando agenda…</div> : appointments.data?.length ? <div className="divide-y divide-[#edf1eb]">{appointments.data.map(item => <AppointmentRow key={item.id} item={item} clients={clients.data || []} services={services.data || []} teamMembers={teamMembers.data || []} />)}</div> : <div className="p-8"><EmptyState icon={CalendarDays} title="Sua agenda está livre" description="Adicione seu primeiro atendimento para começar a organizar o dia." action={<Button onClick={handleOpenNew} className="rounded-xl bg-[#173a34] text-white"><Plus className="mr-2 h-4 w-4" /> Novo atendimento</Button>} /></div>}</CardContent></Card>
  </Page>;
}
function AppointmentRow({ item, clients, services, teamMembers }: { item: any; clients: any[]; services: any[]; teamMembers?: any[] }) {
  const updateStatus = trpc.appointment.updateStatus.useMutation(); const update = trpc.appointment.update.useMutation(); const cancel = trpc.appointment.cancel.useMutation(); const utils = trpc.useUtils(); const [open, setOpen] = useState(false);
  const toLocal = (value: Date | string) => { const date = new Date(value); const pad = (number: number) => String(number).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; };
  const [form, setForm] = useState({ clientId: item.clientId ? String(item.clientId) : "", serviceId: item.serviceId ? String(item.serviceId) : "", teamMemberId: item.teamMemberId ? String(item.teamMemberId) : "", startsAt: toLocal(item.startsAt), durationMinutes: String(item.durationMinutes), amount: formatBrlInput(item.amountCents), location: item.location || "", notes: item.notes || "" });
  const save = async () => { try { await update.mutateAsync({ id: item.id, clientId: form.clientId ? Number(form.clientId) : undefined, serviceId: form.serviceId ? Number(form.serviceId) : undefined, teamMemberId: form.teamMemberId ? Number(form.teamMemberId) : null, startsAt: new Date(form.startsAt).toISOString(), durationMinutes: Number(form.durationMinutes), amountCents: parseBrlToCents(form.amount), location: form.location || undefined, notes: form.notes || undefined }); toast.success("Atendimento atualizado."); utils.appointment.list.invalidate(); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar."); } };
  const client = clients.find(c => c.id === item.clientId);
  const service = services.find(s => s.id === item.serviceId);
  const member = teamMembers?.find(m => m.id === item.teamMemberId);
  const clientName = client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente a confirmar");
  const serviceName = service?.name;
  return <div className="flex flex-col gap-4 p-5 transition hover:bg-[#fbfcf9] sm:flex-row sm:items-center"><div className="flex items-center gap-4 sm:w-48"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f1f7dd] text-center"><span className="text-sm font-bold text-[#718600]">{timeLabel(item.startsAt)}</span></div><div><p className="font-semibold text-[#284b42]">{dateLabel(item.startsAt)}</p><p className="text-xs text-[#82948e]">{item.durationMinutes} minutos</p></div></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{clientName}</p>{serviceName && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2.5 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{serviceName}</span>}{member && <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f1f5] px-2.5 py-0.5 text-xs font-semibold text-[#2f5e77]"><UserCheck className="h-3 w-3" />{member.name}</span>}</div><p className="mt-1 truncate text-sm text-[#82948e]">{item.location ? <><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#8aa500]" />{item.location} · </> : ""}{money(item.amountCents)}</p>{item.notes && <p className="mt-0.5 truncate text-xs text-[#9aa9a3] italic">Obs: {item.notes}</p>}</div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} /><Select value={item.status} onValueChange={async value => { await updateStatus.mutateAsync({ id: item.id, status: value as any }); toast.success("Status atualizado."); utils.appointment.list.invalidate(); }}><SelectTrigger className="h-9 w-[140px] rounded-lg border-[#dce5dc] bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent>{["agendado","confirmado","andamento","concluido","cancelado","faltou"].map(value => <SelectItem key={value} value={value}>{statusLabel[value]}</SelectItem>)}</SelectContent></Select><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="h-9 rounded-lg border-[#dce5dc] bg-white px-2"><Pencil className="h-3.5 w-3.5" /></Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>Editar atendimento</DialogTitle><DialogDescription>Reagende ou atualize os dados deste horário.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Cliente" value={form.clientId} onChange={value => setForm({ ...form, clientId: value })} options={clients.map(client => ({ value: String(client.id), label: client.name }))} /><FormSelect label="Serviço" value={form.serviceId} onChange={value => { const sel = services.find(s => String(s.id) === value); setForm({ ...form, serviceId: value, amount: sel && (!form.amount || form.amount === "0" || form.amount === "0,00") ? formatBrlInput(sel.priceCents) : form.amount, durationMinutes: sel && !form.durationMinutes ? String(sel.durationMinutes) : form.durationMinutes }); }} options={services.filter(service => service.active).map(service => ({ value: String(service.id), label: service.name }))} /></div>{Boolean(teamMembers?.length) && <FormSelect label="Profissional / Parceiro(a)" value={form.teamMemberId} onChange={value => setForm({ ...form, teamMemberId: value })} placeholder="Eu mesmo(a) (Titular)" options={[{ value: "", label: "Eu mesmo(a) (Titular)" }, ...(teamMembers || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role})` }))]} />}<div className="grid gap-4 sm:grid-cols-2"><div><Label className="mb-2 block">Data e horário</Label><Input type="datetime-local" value={form.startsAt} onChange={event => setForm({ ...form, startsAt: event.target.value })} /></div><Field label="Duração (min)" value={form.durationMinutes} onChange={value => setForm({ ...form, durationMinutes: value })} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Valor" prefix="R$ " value={form.amount} onChange={value => setForm({ ...form, amount: value })} /><Field label="Local" value={form.location} onChange={value => setForm({ ...form, location: value })} /></div><div><Label className="mb-2 block">Observações</Label><Textarea value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div></div><DialogFooter><Button onClick={save} disabled={update.isPending} className="rounded-xl bg-[#173a34] text-white">Salvar alterações</Button></DialogFooter></DialogContent></Dialog><Button variant="ghost" onClick={async () => { await cancel.mutateAsync({ id: item.id }); toast.success("Atendimento cancelado."); utils.appointment.list.invalidate(); }} className="h-9 rounded-lg px-2 text-[#9c4d43]"><Trash2 className="h-3.5 w-3.5" /></Button></div></div>;
}

function Clients() {
  const clients = trpc.customer.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.customer.create.useMutation({ onSuccess: () => { toast.success("Cliente salvo."); utils.customer.list.invalidate(); setOpen(false); reset(); } });
  const update = trpc.customer.update.useMutation({ onSuccess: () => { toast.success("Cliente atualizado."); utils.customer.list.invalidate(); setOpen(false); reset(); } });
  const remove = trpc.customer.remove.useMutation({ onSuccess: () => { toast.success("Cliente removido ou arquivado."); utils.customer.list.invalidate(); setSelectedId(null); setDeleteClientId(null); } });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const empty = { name: "", phone: "", whatsapp: "", email: "", address: "", notes: "", cep: "", archived: false };
  const [form, setForm] = useState(empty);
  const [cepLoading, setCepLoading] = useState(false);
  const history = trpc.customer.history.useQuery({ id: selectedId! }, { enabled: Boolean(selectedId) });
  const reset = () => { setForm(empty); setEditingId(null); };
  const openAdd = () => { reset(); setOpen(true); };
  const openEdit = (client: any) => { setEditingId(client.id); setForm({ name: client.name, phone: client.phone || "", whatsapp: client.whatsapp || "", email: client.email || "", address: client.address || "", notes: client.notes || "", cep: "", archived: client.archived }); setOpen(true); };
  const handleCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setForm(f => ({ ...f, cep: formatted }));
    const digits = val.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepLoading(true);
      const res = await lookupCep(digits);
      setCepLoading(false);
      if (res) {
        setForm(f => ({ ...f, address: res.formattedAddress }));
        toast.success("Endereço preenchido via CEP!");
      } else {
        toast.error("CEP não encontrado.");
      }
    }
  };
  const submit = () => { if (!form.name.trim()) return toast.error("Informe o nome do cliente."); if (editingId) update.mutate({ id: editingId, ...form }); else create.mutate(form); };
  return <Page title="Meus clientes" eyebrow="Relacionamentos" description="Tenha contatos, histórico e próximos passos acessíveis quando precisar." help={<HelpButton title="Como funciona Clientes?"><p><strong>Clientes</strong> é onde você organiza todos os seus contatos. Cadastre nome, telefone, WhatsApp e endereço.</p><p><strong>Histórico:</strong> Clique em "Histórico" para ver todos os atendimentos, orçamentos e pagamentos de um cliente.</p><p><strong>Busca:</strong> Use a barra de pesquisa para encontrar rapidamente pelo nome, telefone ou e-mail.</p><p><strong>Arquivamento:</strong> Clientes inativos podem ser removidos da lista principal sem perder o histórico.</p></HelpButton>} action={<Button onClick={openAdd} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Novo cliente</Button>}>
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) reset(); }}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>{editingId ? "Editar cliente" : "Novo cliente"}</DialogTitle><DialogDescription>Dados salvos para agenda, orçamento e histórico.</DialogDescription></DialogHeader><div className="grid gap-4 py-3 sm:grid-cols-2"><Field label="Nome" value={form.name} onChange={value => setForm({ ...form, name: value })} /><Field label="Telefone" value={form.phone} onChange={value => setForm({ ...form, phone: value })} /><Field label="WhatsApp" value={form.whatsapp} onChange={value => setForm({ ...form, whatsapp: value })} /><Field label="E-mail" value={form.email} onChange={value => setForm({ ...form, email: value })} /><div className="sm:col-span-2"><div className="grid gap-3 sm:grid-cols-3"><div><Label className="mb-2 block">CEP {cepLoading && <span className="text-xs text-[#8aa500]">(buscando...)</span>}</Label><Input placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} className="h-10 rounded-xl border-[#dce5dc] bg-white" /></div><div className="sm:col-span-2"><Field label="Endereço" value={form.address} onChange={value => setForm({ ...form, address: value })} placeholder="Rua, número, bairro..." /></div></div></div><div className="sm:col-span-2"><Label className="mb-2 block">Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div></div><DialogFooter><Button onClick={submit} disabled={create.isPending || update.isPending} className="rounded-xl bg-[#173a34] text-white">Salvar cliente</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(selectedId)} onOpenChange={value => !value && setSelectedId(null)}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>{history.data?.client.name || "Histórico do cliente"}</DialogTitle><DialogDescription>Relacionamentos reais registrados no seu espaço.</DialogDescription></DialogHeader>{history.isLoading ? <p className="py-8 text-sm text-[#82948e]">Carregando histórico…</p> : history.data ? <div className="space-y-5 py-3"><div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#f5f8f2] p-3 text-center"><p className="text-xl font-bold text-[#173a34]">{history.data.appointments.length}</p><p className="text-[11px] text-[#82948e]">atendimentos</p></div><div className="rounded-xl bg-[#f5f8f2] p-3 text-center"><p className="text-xl font-bold text-[#173a34]">{history.data.quotes.length}</p><p className="text-[11px] text-[#82948e]">orçamentos</p></div><div className="rounded-xl bg-[#f5f8f2] p-3 text-center"><p className="text-xl font-bold text-[#173a34]">{history.data.payments.length}</p><p className="text-[11px] text-[#82948e]">pagamentos</p></div></div><div className="space-y-2">{history.data.appointments.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#edf1eb] p-3 text-sm"><span className="text-[#526d64]">{dateLabel(item.startsAt)} · {timeLabel(item.startsAt)}</span><StatusBadge status={item.status} /></div>)}{!history.data.appointments.length && <p className="text-sm text-[#82948e]">Nenhum atendimento registrado.</p>}</div></div> : null}</DialogContent></Dialog>
    <ConfirmModal open={Boolean(deleteClientId)} onOpenChange={v => !v && setDeleteClientId(null)} title="Remover cliente" description="Deseja realmente remover ou arquivar este cliente? O histórico de atendimentos e orçamentos anteriores será preservado." confirmLabel="Remover cliente" variant="danger" onConfirm={() => { if (deleteClientId) remove.mutate({ id: deleteClientId }); }} />
    <div className="mb-5 max-w-md"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Pesquisar por nome, telefone ou e-mail" className="h-11 rounded-xl border-[#dce5dc] bg-white pl-9" /></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{clients.data?.filter(client => `${client.name} ${client.phone || ""} ${client.email || ""}`.toLowerCase().includes(search.toLowerCase())).map(client => <Card key={client.id} className="rounded-[22px] border-0 shadow-[0_8px_26px_rgba(19,42,39,0.04)]"><CardContent className="p-5"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] font-bold text-[#819815]">{client.name.charAt(0).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-bold text-[#284b42]">{client.name}</h3><p className="mt-1 text-sm text-[#82948e]">{client.phone ? formatPhone(client.phone) : (client.email || "Contato sem telefone")}</p></div></div><div className="mt-5 space-y-2 text-sm text-[#71867f]">{client.whatsapp && <p><span className="font-semibold text-[#4f6c63]">WhatsApp</span> · {formatPhone(client.whatsapp)}</p>}{client.address && <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8aa500]" />{client.address}</p>}</div><div className="mt-5 flex gap-2 border-t border-[#edf1eb] pt-4"><Button variant="outline" onClick={() => setSelectedId(client.id)} className="h-9 flex-1 rounded-lg border-[#dce5dc] bg-white text-xs"><History className="mr-1 h-3.5 w-3.5" /> Histórico</Button><Button variant="ghost" onClick={() => openEdit(client)} className="h-9 rounded-lg text-xs"><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button><Button variant="ghost" onClick={() => setDeleteClientId(client.id)} className="h-9 rounded-lg text-xs text-[#9c4d43]"><Trash2 className="h-3.5 w-3.5" /></Button></div></CardContent></Card>)}</div>
    {!clients.isLoading && !clients.data?.length && <EmptyState icon={Users} title="Você ainda não tem clientes" description="Cadastre alguém ou compartilhe seu cartão para começar a receber solicitações." action={<Button onClick={openAdd} className="rounded-xl bg-[#173a34] text-white"><Plus className="mr-2 h-4 w-4" /> Cadastrar cliente</Button>} />}
  </Page>;
}


function CatalogPicker({ onSelect }: { onSelect: (name: string, description: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const close = () => { setOpen(false); setSelected(null); setSearch(""); };

  const filtered = SERVICE_CATALOG.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    p.services.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const profession = SERVICE_CATALOG.find(p => p.id === selected);

  // Quando há busca e profissão selecionada, filtrar sub-serviços
  const subServices = profession?.services.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || profession.label.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return <>
    <Button variant="outline" onClick={() => setOpen(true)} className="h-11 rounded-xl border-[#dce5dc] bg-white text-[#4c6960] hover:bg-[#f5f8f2]">
      <BookOpen className="mr-2 h-4 w-4" /> Usar catálogo
    </Button>
    <Dialog open={open} onOpenChange={v => { if (!v) close(); else setOpen(true); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[#173a34]">Catálogo de serviços sugeridos</DialogTitle>
          <DialogDescription>Escolha uma profissão para carregar serviços prontos ou cadastre um serviço do seu jeito.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bad9a]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar profissão ou serviço (ex: encanador, pintura...)"
              className="h-10 w-full rounded-xl border border-[#dce5dc] bg-[#f5f8f2] pl-9 pr-4 text-sm text-[#284b42] outline-none focus:border-[#8aa500]"
            />
          </div>

          {search.trim().length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-[#f0f7ea] px-3.5 py-2.5 text-xs text-[#3d5e4b] border border-[#d2e4c4]">
              <span>Não achou na lista o que precisa?</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-semibold text-[#6d8315] hover:bg-[#e4eed7]"
                onClick={() => { onSelect(search.trim(), ""); close(); }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Criar "{search.trim()}"
              </Button>
            </div>
          )}

          {!selected ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => setSelected(p.id)}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-[#dce5dc] bg-white p-4 text-center transition hover:border-[#8aa500] hover:bg-[#f5f8f2]">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-xs font-semibold text-[#284b42]">{p.label}</span>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#dce5dc] p-6 text-center">
                  <p className="text-sm text-[#82948e]">Nenhuma profissão correspondente encontrada.</p>
                  <Button variant="outline" className="mt-3 h-9 rounded-xl border-[#8aa500] text-sm text-[#8aa500] hover:bg-[#f5f8f2]"
                    onClick={() => { onSelect(search, ""); close(); }}>
                    <Plus className="mr-1.5 h-4 w-4" /> Cadastrar "{search}" manualmente
                  </Button>
                </div>
              )}
              <div className="mt-4 rounded-2xl border border-dashed border-[#dce5dc] bg-[#fdfefd] p-4 text-center">
                <p className="text-xs text-[#71867f]">Sua área de atuação não está na lista?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-8 rounded-xl border-[#8aa500] text-xs font-medium text-[#738d0d] hover:bg-[#f5f8f2]"
                  onClick={() => { onSelect("", ""); close(); }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Digitar serviço personalizado manualmente
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-[#71867f] hover:text-[#8aa500]">
                <ChevronLeft className="h-4 w-4" /> Voltar para todas as profissões
              </button>
              <p className="font-semibold text-[#173a34]">{profession?.emoji} {profession?.label}</p>
              <div className="grid gap-2">
                {subServices.map(s => (
                  <button key={s.name}
                    onClick={() => { onSelect(s.name, s.description); close(); }}
                    className="flex flex-col items-start rounded-xl border border-[#dce5dc] bg-white p-4 text-left transition hover:border-[#8aa500] hover:bg-[#f5f8f2]">
                    <span className="font-semibold text-[#284b42]">{s.name}</span>
                    <span className="mt-1 text-xs text-[#82948e]">{s.description}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-dashed border-[#dce5dc] p-4 text-center">
                <p className="text-xs text-[#82948e]">Precisa de um serviço diferente para {profession?.label}?</p>
                <Button variant="ghost" size="sm" className="mt-1 h-8 rounded-lg text-xs text-[#8aa500] hover:bg-[#f5f8f2]"
                  onClick={() => { onSelect("", ""); close(); }}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar serviço personalizado
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

function Services() {
  const services = trpc.service.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.service.create.useMutation({ onSuccess: () => { toast.success("Serviço salvo."); utils.service.list.invalidate(); setOpen(false); reset(); } });
  const update = trpc.service.update.useMutation({ onSuccess: () => { toast.success("Serviço atualizado."); utils.service.list.invalidate(); setOpen(false); reset(); } });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const empty = { name: "", description: "", durationMinutes: "60", price: "", modality: "presencial" as "presencial" | "endereco" | "online" | "hibrido", active: true };
  const [form, setForm] = useState(empty);
  const reset = () => { setForm(empty); setEditingId(null); };
  const openAdd = () => { reset(); setOpen(true); };
  const openEdit = (service: any) => { setEditingId(service.id); setForm({ name: service.name, description: service.description || "", durationMinutes: String(service.durationMinutes), price: formatBrlInput(service.priceCents), modality: service.modality, active: service.active }); setOpen(true); };
  const submit = () => {
    if (!form.name.trim()) return toast.error("Informe o nome do serviço.");
    const spell = checkServiceSpelling(form.name);
    const finalName = spell.hasCorrection ? spell.correctedText : form.name;
    const payload = {
      name: finalName,
      description: form.description || undefined,
      durationMinutes: Number(form.durationMinutes),
      priceCents: parseBrlToCents(form.price),
      modality: form.modality,
    };
    if (editingId) update.mutate({ id: editingId, ...payload, active: form.active });
    else create.mutate(payload);
  };
  const toggle = (service: any) => update.mutate({ id: service.id, name: service.name, description: service.description || undefined, durationMinutes: service.durationMinutes, priceCents: service.priceCents, modality: service.modality, active: !service.active });
  return <Page title="Meus serviços" eyebrow="O que você oferece" description="Mantenha seu catálogo pronto para a agenda e para a página pública." help={<HelpButton title="Como funciona Serviços?"><p><strong>Serviços</strong> é o catálogo do que você oferece. Cada serviço tem nome, preço, duração e modalidade.</p><p><strong>Modalidades:</strong> Presencial (no seu local), no endereço do cliente, online ou híbrido.</p><p><strong>Ativar/Desativar:</strong> Serviços desativados não aparecem para novos clientes, mas ficam preservados no histórico.</p><p>Os serviços cadastrados alimentam a <strong>Agenda</strong>, os <strong>Orçamentos</strong> e sua <strong>página pública</strong>.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><CatalogPicker onSelect={(name, desc) => { setForm({ ...empty, name, description: desc }); setEditingId(null); setOpen(true); }} /><Button onClick={openAdd} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Novo serviço</Button></div>}>
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) reset(); }}><ServiceDialog form={form} setForm={setForm} submit={submit} pending={create.isPending || update.isPending} editing={Boolean(editingId)} /></Dialog>
    <div className="mb-5 max-w-md"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome ou descrição..." className="h-11 rounded-xl border-[#dce5dc] bg-white pl-9" /></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{services.data?.filter(service => `${service.name} ${service.description || ""}`.toLowerCase().includes(search.toLowerCase())).map(service => <Card key={service.id} className="rounded-[22px] border-0 shadow-[0_8px_26px_rgba(19,42,39,0.04)]"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f1f5] text-[#3f738e]"><BriefcaseBusiness className="h-5 w-5" /></div><StatusBadge status={service.active ? "aceito" : "cancelado"} /></div><h3 className="mt-5 font-bold text-[#284b42]">{service.name}</h3><p className="mt-2 min-h-10 text-sm leading-5 text-[#82948e]">{service.description || "Sem descrição adicionada."}</p><div className="mt-5 flex items-center justify-between border-t border-[#edf1eb] pt-4"><span className="text-sm text-[#71867f]"><Clock3 className="mr-1 inline h-4 w-4" />{service.durationMinutes} min</span><strong className="text-lg text-[#173a34]">{money(service.priceCents)}</strong></div><p className="mt-2 text-xs text-[#9aa9a3]">{modalityLabel[service.modality]}</p><div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => openEdit(service)} className="h-9 flex-1 rounded-lg border-[#dce5dc] bg-white text-xs"><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button><Button variant="ghost" onClick={() => toggle(service)} className="h-9 rounded-lg text-xs text-[#71867f]">{service.active ? "Desativar" : "Ativar"}</Button></div></CardContent></Card>)}</div>
    {!services.isLoading && !services.data?.length && <EmptyState icon={BriefcaseBusiness} title="Adicione seu primeiro serviço" description="Seu catálogo alimenta a página pública, os pedidos e os orçamentos." action={<div className="flex flex-wrap justify-center gap-2"><CatalogPicker onSelect={(name, desc) => { setForm({ ...empty, name, description: desc }); setEditingId(null); setOpen(true); }} /><Button onClick={openAdd} className="rounded-xl bg-[#173a34] text-white"><Plus className="mr-2 h-4 w-4" /> Novo serviço</Button></div>} />}
  </Page>;
}
function ServiceDialog({ form, setForm, submit, pending, editing }: { form: any; setForm: (form: any) => void; submit: () => void; pending: boolean; editing: boolean }) { return <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle><DialogDescription>As alterações refletem na agenda e na página pública.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><ServiceNameField label="Nome do serviço" value={form.name} onChange={value => setForm({ ...form, name: value })} onSelectCatalog={(name, description) => setForm({ ...form, name, description: description || form.description })} placeholder="Ex.: Troca de chuveiro, Instalação de tomadas..." /><div className="grid gap-4 sm:grid-cols-2"><Field label="Preço" prefix="R$ " value={form.price} onChange={value => setForm({ ...form, price: value })} /><Field label="Duração (min)" value={form.durationMinutes} onChange={value => setForm({ ...form, durationMinutes: value })} /></div><FormSelect label="Modalidade" value={form.modality} onChange={value => setForm({ ...form, modality: value })} options={Object.entries(modalityLabel).map(([value,label]) => ({ value, label }))} /><div><Label className="mb-2 block">Descrição</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div></div><DialogFooter><Button onClick={submit} disabled={pending} className="rounded-xl bg-[#173a34] text-white">{editing ? "Salvar alterações" : "Salvar serviço"}</Button></DialogFooter></DialogContent>; }

function Requests() {
  const requests = trpc.request.list.useQuery(); const utils = trpc.useUtils();
  const update = trpc.request.updateStatus.useMutation({ onSuccess: () => { toast.success("Solicitação atualizada."); utils.request.list.invalidate(); } });
  const convertClient = trpc.request.convertToClient.useMutation({ onSuccess: () => { toast.success("Solicitação convertida em cliente."); utils.request.list.invalidate(); utils.customer.list.invalidate(); } });
  const convertAppointment = trpc.request.convertToAppointment.useMutation({ onSuccess: () => { toast.success("Atendimento criado na agenda."); utils.request.list.invalidate(); utils.appointment.list.invalidate(); } }); const convertQuote = trpc.request.convertToQuote.useMutation({ onSuccess: data => { toast.success("Orçamento criado."); utils.request.list.invalidate(); utils.quote.list.invalidate(); navigator.clipboard?.writeText(`${window.location.origin}/orcamento/${data.token}`); } });
  return <Page title="Solicitações" eyebrow="Novos clientes" description="Pedidos que chegaram pela sua página pública, sem exigir cadastro do cliente." help={<HelpButton title="Como funciona Solicitações?"><p><strong>Solicitações</strong> são pedidos que clientes fazem pela sua página pública, sem precisar criar conta.</p><p><strong>Fluxo de status:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Nova</strong> — acabou de chegar, aguarda sua análise.</li><li><strong>Em análise</strong> — você está avaliando o pedido.</li><li><strong>Orçamento enviado</strong> — você criou e enviou uma proposta.</li><li><strong>Agendada</strong> — virou um atendimento na agenda.</li><li><strong>Arquivada</strong> — encerrada sem conversão.</li></ul><p>Use os botões para <strong>virar cliente</strong>, <strong>criar orçamento</strong> ou <strong>criar atendimento</strong> diretamente.</p></HelpButton>}><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardContent className="p-0">{requests.data?.length ? <div className="divide-y divide-[#edf1eb]">{requests.data.map(request => <div key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815]"><ClipboardList className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#284b42]">{request.requesterName}</h3><StatusBadge status={request.status} /></div><p className="mt-1 text-sm text-[#82948e]">{formatPhone(request.requesterPhone)}{request.requesterEmail ? ` · ${request.requesterEmail}` : ""}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#526d64]">{request.description}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8b9c96]"><span><Clock3 className="mr-1 inline h-3.5 w-3.5" />Recebida em {dateLabel(request.createdAt)}</span>{request.address && <span><MapPin className="mr-1 inline h-3.5 w-3.5" />{request.address}</span>}{request.attachments?.map(file => <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" className="text-[#496b98] hover:underline"><Paperclip className="mr-1 inline h-3.5 w-3.5" />{file.fileName}</a>)}</div><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => convertClient.mutate({ id: request.id })} disabled={Boolean(request.clientId) || convertClient.isPending} className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs">{request.clientId ? "Cliente cadastrado" : "Virar cliente"}</Button><Button variant="outline" onClick={() => convertQuote.mutate({ id: request.id, sendNow: true })} disabled={convertQuote.isPending} className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs">Criar orçamento</Button><Button onClick={() => convertAppointment.mutate({ id: request.id })} disabled={!request.clientId || convertAppointment.isPending} className="h-9 rounded-lg bg-[#173a34] text-xs text-white">Criar atendimento</Button></div></div><Select value={request.status} onValueChange={value => update.mutate({ id: request.id, status: value as any })}><SelectTrigger className="h-9 w-[170px] rounded-lg border-[#dce5dc] bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent>{["nova","em_analise","orcamento_enviado","agendada","arquivada"].map(value => <SelectItem key={value} value={value}>{statusLabel[value]}</SelectItem>)}</SelectContent></Select></div>)}</div> : <div className="p-8"><div className="mx-auto max-w-xl text-center"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-[#eef5d2] text-[#819815] shadow-sm"><ClipboardList className="h-8 w-8" /></div><h3 className="text-xl font-bold text-[#173a34]">Como funcionam as solicitações?</h3><p className="mt-2 text-sm leading-6 text-[#6d837c]">Os clientes chegam através da sua página pública e cartão digital — <strong>sem precisar criar conta nem instalar aplicativos</strong>.</p><div className="mt-8 space-y-3 text-left"><div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#eef5d2] font-bold text-sm text-[#819815]">1</div><div><p className="text-sm font-bold text-[#284b42]">Você divulga seu link ou cartão virtual</p><p className="mt-0.5 text-xs text-[#71867f]">Compartilhe no WhatsApp, Instagram, bio ou envie direto quando alguém pedir seu contato.</p></div></div><div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e3f3e8] font-bold text-sm text-[#3e885c]">2</div><div><p className="text-sm font-bold text-[#284b42]">O cliente solicita o serviço pelo navegador</p><p className="mt-0.5 text-xs text-[#71867f]">Ele informa nome, WhatsApp, descreve o que precisa, pode anexar fotos e indicar o local.</p></div></div><div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e8eef8] font-bold text-sm text-[#496b98]">3</div><div><p className="text-sm font-bold text-[#284b42]">O pedido cai instantaneamente aqui</p><p className="mt-0.5 text-xs text-[#71867f]">Você visualiza todos os dados, fotos e informações para avaliar com rapidez.</p></div></div><div className="flex items-start gap-3.5 rounded-2xl border border-[#e4ebe0] bg-[#f9fbf8] p-4"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#d9f56a] font-bold text-sm text-[#173a34]">4</div><div><p className="text-sm font-bold text-[#284b42]">Você responde em 1 clique</p><p className="mt-0.5 text-xs text-[#71867f]">Basta clicar em <strong>"Criar orçamento"</strong> para enviar proposta digital, <strong>"Virar cliente"</strong> ou <strong>"Criar atendimento"</strong>.</p></div></div></div><div className="mt-8 flex justify-center"><Button onClick={() => window.location.href = "/cartao"} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Share2 className="mr-2 h-4 w-4" /> Acessar e compartilhar meu cartão</Button></div></div></div>}</CardContent></Card></Page>;
}

function Quotes() {
  const quotes = trpc.quote.list.useQuery();
  const clients = trpc.customer.list.useQuery();
  const services = trpc.service.list.useQuery();
  const profileQuery = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState<string>("");
  const [receiptQuote, setReceiptQuote] = useState<ReceiptData | null>(null);

  const initialForm = {
    clientId: "",
    serviceId: "",
    description: "",
    discount: "",
    paymentTerms: "",
    notes: "",
    validUntil: "",
    sendNow: true,
    items: [{ description: "", quantity: "1", unitPrice: "" }]
  };
  const [form, setForm] = useState(initialForm);

  const create = trpc.quote.create.useMutation({
    onSuccess: data => {
      if (data.token) {
        toast.success("Orçamento salvo e link gerado!");
        setCreatedToken(data.token);
      } else {
        toast.success("Orçamento salvo como rascunho.");
        setCreatedToken(null);
      }
      utils.quote.list.invalidate();
      setOpen(false);
    }
  });

  const update = trpc.quote.update.useMutation({
    onSuccess: data => {
      if (data.token) {
        toast.success("Proposta revisada e link atualizado!");
        setCreatedToken(data.token);
      } else {
        toast.success("Proposta atualizada como rascunho.");
        setCreatedToken(null);
      }
      utils.quote.list.invalidate();
      setOpen(false);
      setEditingQuoteId(null);
    }
  });

  const publishQuote = trpc.quote.publish.useMutation({
    onSuccess: data => {
      toast.success("Orçamento publicado e link gerado!");
      utils.quote.list.invalidate();
      setCreatedToken(data.token);
    },
    onError: err => {
      toast.error(err.message || "Erro ao publicar orçamento.");
    }
  });

  const deleteQuote = trpc.quote.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento excluído com sucesso!");
      utils.quote.list.invalidate();
    },
    onError: err => {
      toast.error(err.message || "Erro ao excluir orçamento.");
    }
  });

  const paymentPresets = [
    "Cartão de Crédito/Débito na maquininha do profissional",
    "PIX direto com o profissional na conclusão",
    "Dinheiro à vista no término do serviço",
    "50% de entrada + 50% na conclusão",
    "Cartão de Crédito parcelado (com taxa da máquina)",
    "A combinar diretamente entre as partes"
  ];

  const openNewQuote = () => {
    setEditingQuoteId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEditQuote = (quote: any) => {
    setEditingQuoteId(quote.id);
    setForm({
      clientId: quote.clientId ? String(quote.clientId) : "",
      serviceId: quote.serviceId ? String(quote.serviceId) : "",
      description: quote.description || "",
      discount: quote.discountCents ? formatBrlInput(quote.discountCents) : "",
      paymentTerms: quote.paymentTerms || "",
      notes: quote.notes || "",
      validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split("T")[0] : "",
      sendNow: true,
      items: quote.items?.length
        ? quote.items.map((it: any) => ({
            description: it.description,
            quantity: String(it.quantity),
            unitPrice: formatBrlInput(it.unitPriceCents)
          }))
        : [{ description: quote.description || "Serviço", quantity: "1", unitPrice: formatBrlInput(quote.subtotalCents) }]
    });
    setOpen(true);
  };

  const subtotal = form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * parseBrlToCents(item.unitPrice), 0);
  const total = Math.max(0, subtotal - parseBrlToCents(form.discount));

  const submit = () => {
    if (!form.items.every(item => item.description.trim() && Number(item.quantity) > 0)) {
      return toast.error("Preencha a descrição e quantidade de todos os itens.");
    }
    const payloadItems = form.items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPriceCents: parseBrlToCents(item.unitPrice)
    }));

    if (editingQuoteId) {
      update.mutate({
        id: editingQuoteId,
        description: form.description || undefined,
        discountCents: parseBrlToCents(form.discount),
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        validUntil: form.validUntil ? new Date(`${form.validUntil}T23:59:59`).toISOString() : undefined,
        sendNow: form.sendNow,
        items: payloadItems
      });
    } else {
      create.mutate({
        clientId: form.clientId ? Number(form.clientId) : undefined,
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        description: form.description || undefined,
        discountCents: parseBrlToCents(form.discount),
        notes: form.notes || undefined,
        paymentTerms: form.paymentTerms || undefined,
        validUntil: form.validUntil ? new Date(`${form.validUntil}T23:59:59`).toISOString() : undefined,
        sendNow: form.sendNow,
        items: payloadItems
      });
    }
  };

  const shareUrl = createdToken ? `${window.location.origin}/orcamento/${createdToken}` : "";
  const updateItem = (index: number, values: any) => setForm({ ...form, items: form.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item) });

  return (
    <Page
      title="Orçamentos"
      eyebrow="Propostas que fecham"
      description="Crie uma proposta clara com itens, desconto, condições de pagamento e um link seguro para o cliente responder."
      help={<HelpButton title="Como funciona Orçamentos?"><p><strong>Orçamentos</strong> são propostas formais que você envia ao cliente com itens, valores e condições.</p><p><strong>Status:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Rascunho</strong> — ainda não enviado ao cliente.</li><li><strong>Enviado</strong> — o cliente recebeu o link e pode responder.</li><li><strong>Aceito</strong> — cliente aprovou a proposta.</li><li><strong>Recusado</strong> — cliente pediu alteração ou recusou.</li></ul><p><strong>Link público:</strong> O cliente não precisa criar conta para visualizar e aceitar o orçamento. Basta abrir o link enviado.</p><p>Após aceito, o orçamento pode virar um atendimento na agenda com um clique.</p></HelpButton>}
      action={
        <Button onClick={openNewQuote} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]">
          <Plus className="mr-2 h-4 w-4" /> Novo orçamento
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setEditingQuoteId(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuoteId
                ? (quotes.data?.find(q => q.id === editingQuoteId)?.status === "aceito" ? "Revisar Proposta (Reabertura)" : "Revisar e Reenviar Proposta")
                : "Novo orçamento"}
            </DialogTitle>
            <DialogDescription>
              {editingQuoteId
                ? (quotes.data?.find(q => q.id === editingQuoteId)?.status === "aceito"
                    ? "Esta proposta já foi aceita pelo cliente. Ao salvar com novos itens ou valores, ela será reaberta para o cliente aprovar o novo total."
                    : "Ajuste os valores, itens ou condições e reenvie a proposta atualizada.")
                : "O cliente não precisa ter conta no MeuAutônomo para visualizar e aceitar."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                label="Cliente"
                value={form.clientId}
                onChange={value => setForm({ ...form, clientId: value })}
                placeholder="Selecionar"
                options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))}
              />
              <FormSelect
                label="Serviço principal"
                value={form.serviceId}
                onChange={value => {
                  const service = services.data?.find(item => String(item.id) === value);
                  setForm({
                    ...form,
                    serviceId: value,
                    items: service ? [{ description: service.name, quantity: "1", unitPrice: formatBrlInput(service.priceCents) }, ...form.items.slice(1)] : form.items
                  });
                }}
                placeholder="Selecionar"
                options={(services.data || []).filter(s => s.active).map(s => ({ value: String(s.id), label: s.name }))}
              />
            </div>
            <Field label="Descrição da proposta" value={form.description} onChange={value => setForm({ ...form, description: value })} placeholder="O que está sendo proposto?" />

            <div className="rounded-2xl bg-[#f5f8f2] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#38584f]">Itens e Mão de Obra</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, items: [...form.items, { description: "", quantity: "1", unitPrice: "" }] })}
                  className="h-8 rounded-lg border-[#dce5dc] bg-white text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar item
                </Button>
              </div>
              {form.items.map((item, index) => (
                <div key={index} className="mb-3 grid gap-3 rounded-xl border border-[#e3ebe0] bg-white p-3 sm:grid-cols-[1fr_90px_120px_auto]">
                  <Field label={index === 0 ? "Descrição" : ""} value={item.description} onChange={value => updateItem(index, { description: value })} />
                  <Field label={index === 0 ? "Qtd." : ""} value={item.quantity} onChange={value => updateItem(index, { quantity: value })} />
                  <Field label={index === 0 ? "Preço unit." : ""} prefix="R$ " value={item.unitPrice} onChange={value => updateItem(index, { unitPrice: value })} />
                  {form.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) })}
                      className="sm:mt-5 mt-1 self-end sm:self-auto h-10 px-2 text-[#9c4d43]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f5f8f2] p-3">
                <p className="text-xs text-[#82948e]">Subtotal</p>
                <p className="mt-1 font-bold text-[#173a34]">{money(subtotal)}</p>
              </div>
              <Field label="Desconto" prefix="R$ " value={form.discount} onChange={value => setForm({ ...form, discount: value })} />
              <div className="rounded-xl bg-[#173a34] p-3 text-white">
                <p className="text-xs text-white/65">Total</p>
                <p className="mt-1 font-bold">{money(total)}</p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Condições e Formas de Pagamento</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {paymentPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, paymentTerms: form.paymentTerms ? `${form.paymentTerms} ou ${preset}` : preset })}
                    className="rounded-full border border-[#dce5dc] bg-white px-2.5 py-1 text-xs text-[#4c6960] hover:bg-[#eef5d2] transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <Input
                value={form.paymentTerms}
                onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                placeholder="Ex.: PIX à vista ou Cartão em até 3x sem juros"
              />
              <p className="mt-1 text-[11px] text-[#82948e]">
                O pagamento será realizado diretamente com você. A plataforma não processa ou retém valores.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Validade</Label>
              <Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            </div>

            <div>
              <Label className="mb-2 block">Observações e garantias</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ex.: Garantia de 90 dias, materiais inclusos, etc." />
            </div>

            <label className="flex items-center gap-3 text-sm text-[#526d64]">
              <input type="checkbox" checked={form.sendNow} onChange={e => setForm({ ...form, sendNow: e.target.checked })} className="h-4 w-4 accent-[#173a34]" />
              {editingQuoteId ? "Reenviar e reabrir link para o cliente" : "Enviar agora e gerar link público"}
            </label>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={create.isPending || update.isPending} className="rounded-xl bg-[#173a34] text-white">
              {editingQuoteId ? "Reenviar proposta revisada" : "Salvar orçamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {createdToken && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d9e7bf] bg-[#f1f7dd] p-4 text-sm text-[#53674a] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="text-[#304d2c]">Link da proposta pronto!</strong> Envie para o cliente visualizar e responder.
          </div>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl);
              toast.success("Link copiado para a área de transferência.");
            }}
            className="rounded-xl border-[#c8d9a4] bg-white"
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar link
          </Button>
        </div>
      )}

      <div className="mb-5 grid gap-2.5 sm:grid-cols-4 text-xs">
        <div className="rounded-2xl border border-[#dce5dc] bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#5d746d]">
            <span className="h-2 w-2 rounded-full bg-[#82948e]" />
            <span>Rascunho</span>
          </div>
          <p className="mt-1 text-[#82948e] leading-snug">Ainda não enviado ao cliente.</p>
        </div>
        <div className="rounded-2xl border border-[#cbe2f8] bg-[#f4f8fe] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#2d5c88]">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
            <span>Enviado</span>
          </div>
          <p className="mt-1 text-[#5d7d9e] leading-snug">O cliente recebeu o link e pode responder.</p>
        </div>
        <div className="rounded-2xl border border-[#c2e4cc] bg-[#f0f9f3] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#27663d]">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span>Aceito</span>
          </div>
          <p className="mt-1 text-[#518261] leading-snug">Cliente aprovou a proposta.</p>
        </div>
        <div className="rounded-2xl border border-[#f5d6cf] bg-[#fef5f3] p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-[#963d30]">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span>Recusado / Ajuste</span>
          </div>
          <p className="mt-1 text-[#8e6059] leading-snug">Cliente pediu alteração ou recusou.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "todos", label: "Todos", count: quotes.data?.length || 0 },
            { id: "rascunho", label: "Rascunho", count: quotes.data?.filter(q => q.status === "rascunho").length || 0 },
            { id: "enviado", label: "Enviado", count: quotes.data?.filter(q => q.status === "enviado").length || 0 },
            { id: "aceito", label: "Aceito", count: quotes.data?.filter(q => q.status === "aceito").length || 0 },
            { id: "alteracao", label: "Alteração / Recusado", count: quotes.data?.filter(q => q.status === "alteracao_solicitada" || q.status === "recusado").length || 0 },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === tab.id
                  ? "bg-[#173a34] text-white"
                  : "border border-[#dce5dc] bg-white text-[#526d64] hover:bg-[#f5f8f2]"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-[#edf2ec] text-[#6b827a]"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, itens..."
            className="h-9 rounded-xl border-[#dce5dc] bg-white pl-9 text-xs"
          />
        </div>
      </div>

      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
        <CardContent className="p-0">
          {quotes.data?.length ? (
            <div className="divide-y divide-[#edf1eb]">
              {(quotes.data || []).filter(q => {
                if (statusFilter !== "todos") {
                  if (statusFilter === "alteracao") {
                    if (q.status !== "alteracao_solicitada" && q.status !== "recusado") return false;
                  } else if (q.status !== statusFilter) {
                    return false;
                  }
                }
                if (!search.trim()) return true;
                const cName = clients.data?.find(c => c.id === q.clientId)?.name || q.clientName || "";
                return `${q.description || ""} ${cName} ${q.paymentTerms || ""} ${q.notes || ""}`.toLowerCase().includes(search.toLowerCase());
              }).map(quote => {
                const clientObj = clients.data?.find(client => client.id === quote.clientId);
                const clientDisplayName = quote.clientName || clientObj?.name || "Cliente";
                const clientPhone = (quote as any).clientPhone || clientObj?.whatsapp || clientObj?.phone || "";

                return (
                  <div key={quote.id} className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e8eef8] text-[#496b98]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#284b42]">{quote.description || `Orçamento #${quote.id}`}</h3>
                            <StatusBadge status={quote.status} />
                          </div>
                          <p className="mt-1 text-sm text-[#82948e]">
                            <strong className="text-[#284b42] font-semibold">{clientDisplayName}</strong> · {dateLabel(quote.createdAt)} · Total de {money(quote.totalCents)}
                          </p>
                          {quote.status === "aceito" && quote.clientName && (
                            <p className="mt-1 text-xs text-[#2e6e4a] font-medium">
                              <Check className="mr-1 inline h-3.5 w-3.5" /> Aprovado por {quote.clientName} {quote.clientEmail ? `(${quote.clientEmail})` : ""}
                            </p>
                          )}
                          {quote.status === "recusado" && (
                            <p className="mt-1 text-xs text-[#c0392b] font-medium">
                              <X className="mr-1 inline h-3.5 w-3.5" /> Proposta recusada pelo cliente
                            </p>
                          )}
                          {quote.paymentTerms && (
                            <p className="mt-1 text-xs text-[#526d64]">
                              <CreditCard className="mr-1 inline h-3.5 w-3.5 text-[#8aa500]" /> Pagamento: {quote.paymentTerms}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {quote.status === "rascunho" ? (
                          <Button
                            size="sm"
                            onClick={() => publishQuote.mutate({ id: quote.id })}
                            disabled={publishQuote.isPending}
                            className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs"
                          >
                            <Send className="mr-1.5 h-3.5 w-3.5" /> Publicar e gerar link
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rawPhone = clientPhone.replace(/\D/g, "");
                              const quoteUrl = `${window.location.origin}/orcamento/${quote.secureToken}`;
                              const desc = quote.description || "prestação de serviços";
                              const val = money(quote.totalCents);
                              const msg = encodeURIComponent(`Olá ${clientDisplayName}! Segue a proposta de orçamento referente a ${desc} no valor de ${val}.\n\nVocê pode consultar os itens detalhados e aprovar diretamente por este link seguro:\n${quoteUrl}\n\nQualquer dúvida estou à disposição!`);
                              if (rawPhone) {
                                window.open(`https://wa.me/55${rawPhone.replace(/^55/, "")}?text=${msg}`, "_blank");
                              } else {
                                navigator.clipboard?.writeText(decodeURIComponent(msg));
                                toast.success("Mensagem de orçamento copiada! Cole no WhatsApp do cliente.");
                              }
                            }}
                            className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#28564d] hover:bg-[#f0fdf4]"
                          >
                            <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> Enviar WhatsApp
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditQuote(quote)}
                          className={cn(
                            "rounded-xl border-[#dce5dc] bg-white text-xs text-[#4c6960]",
                            quote.status === "aceito" && "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          )}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> {quote.status === "aceito" ? "Revisar / Reabrir" : "Revisar / Editar"}
                        </Button>
                        {quote.status !== "rascunho" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard?.writeText(`${window.location.origin}/orcamento/${quote.secureToken}`);
                              toast.success("Link copiado.");
                            }}
                            className="rounded-xl border-[#dce5dc] bg-white text-xs text-[#4c6960]"
                          >
                            <Link2 className="mr-1.5 h-3.5 w-3.5" /> Copiar link
                          </Button>
                        )}
                        {quote.status === "aceito" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReceiptQuote({
                                receiptNumber: `REC-${String(quote.id).padStart(4, "0")}`,
                                date: quote.respondedAt || quote.createdAt,
                                professionalName: profileQuery.data?.displayName || "Profissional",
                                profession: profileQuery.data?.professionName || "Prestador de Serviços",
                                professionalPhone: profileQuery.data?.whatsapp || profileQuery.data?.phone || "",
                                professionalCity: profileQuery.data?.city || "",
                                pixKey: profileQuery.data?.pixKey || "",
                                clientName: clientDisplayName,
                                clientPhone: clientPhone,
                                serviceDescription: quote.description || "Prestação de serviços orçados",
                                amountCents: quote.totalCents,
                                paymentMethod: quote.paymentTerms || "Acerto direto com o prestador",
                              });
                            }}
                            className="rounded-xl border-[#b3d7bf] bg-[#f0f7f2] text-xs font-semibold text-[#173a34] hover:bg-[#e1f0e5]"
                          >
                            <Receipt className="mr-1.5 h-3.5 w-3.5 text-[#2e6e4a]" /> Gerar Recibo
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita.")) {
                              deleteQuote.mutate({ id: quote.id });
                            }
                          }}
                          disabled={deleteQuote.isPending}
                          className="rounded-xl border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          title="Excluir este orçamento"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Excluir
                        </Button>
                      </div>
                    </div>

                    {quote.status === "alteracao_solicitada" && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4">
                        <div className="flex items-center gap-2 font-semibold text-amber-900 text-sm">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>O cliente solicitou alterações nesta proposta:</span>
                        </div>
                        <p className="mt-2 rounded-xl border border-amber-200 bg-white/90 p-3 text-xs leading-5 text-amber-950 font-medium">
                          "{quote.changeRequest || "Cliente solicitou alterações."}"
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openEditQuote(quote)}
                            className="h-8 rounded-lg bg-[#173a34] text-xs text-white hover:bg-[#28564d]"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Revisar Proposta e Reenviar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={FileText}
                title="Nenhum orçamento ainda"
                description="Transforme uma solicitação em uma proposta profissional e envie um link simples."
                action={
                  <Button onClick={openNewQuote} className="rounded-xl bg-[#173a34] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Criar orçamento
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
      <ReceiptModal open={Boolean(receiptQuote)} onOpenChange={v => !v && setReceiptQuote(null)} data={receiptQuote} />
    </Page>
  );
}

export function MeuDia() {
  const summary = trpc.dashboard.summary.useQuery();
  const services = trpc.service.list.useQuery();
  const clients = trpc.customer.list.useQuery();
  if (summary.isLoading) return <LoadingScreen />;
  if (summary.error) return <Page title="Meu Dia" description="Não foi possível carregar sua rotina agora."><Button onClick={() => summary.refetch()} className="bg-[#173a34] text-white">Tentar novamente</Button></Page>;
  const data = summary.data!;
  return <Page title="Meu Dia" eyebrow="Comece por aqui" description="Sua rotina de hoje, sem distrações." help={<HelpButton title="Como funciona Meu Dia?"><p><strong>Meu Dia</strong> é um resumo focado no que importa agora — sem a distração de toda a plataforma.</p><p><strong>Métricas do topo:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Atendimentos</strong> — quantos estão na agenda de hoje.</li><li><strong>Previsto</strong> — valor total estimado dos atendimentos de hoje.</li><li><strong>Solicitações</strong> — pedidos novos que precisam de atenção.</li><li><strong>Orçamentos</strong> — propostas enviadas aguardando resposta do cliente.</li></ul><p><strong>O que precisa de atenção:</strong> Lista as solicitações novas e os orçamentos pendentes para você agir rapidamente sem precisar navegar pela plataforma.</p></HelpButton>}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Atendimentos" value={String(data.metrics.todayCount)} hint="na agenda de hoje" icon={CalendarDays} accent="lime" /><Metric title="Previsto" value={money(data.metrics.todayProjectedCents)} hint="em atendimentos" icon={WalletCards} accent="blue" /><Metric title="Solicitações" value={String(data.recentRequests.filter(item => item.status === "nova").length)} hint="aguardando atenção" icon={ClipboardList} accent="orange" /><Metric title="Orçamentos" value={String(data.pendingQuotes.length)} hint="aguardando resposta" icon={FileText} accent="green" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Agenda de hoje</CardTitle></CardHeader><CardContent className="p-0">{data.today.length ? <div className="divide-y divide-[#edf1eb]">{data.today.map(item => { const client = clients.data?.find(c => c.id === item.clientId); const service = services.data?.find(s => s.id === item.serviceId); return <div key={item.id} className="flex items-center gap-4 p-5"><div className="grid h-12 w-16 place-items-center rounded-xl bg-[#f1f7dd] text-sm font-bold text-[#718600]">{timeLabel(item.startsAt)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{client?.name || (item.clientId ? `Cliente #${item.clientId}` : "Cliente a confirmar")}</p>{service && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{service.name}</span>}</div><p className="mt-1 truncate text-sm text-[#82948e]">{item.location ? `${item.location} · ` : ""}{money(item.amountCents)}</p></div><StatusBadge status={item.status} /></div>; })}</div> : <div className="p-8"><EmptyState icon={CalendarDays} title="Nenhum atendimento hoje" description="Seu dia está livre. Você pode usar o tempo para organizar clientes e propostas." /></div>}</CardContent></Card><div className="grid gap-6"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">O que precisa de atenção</CardTitle></CardHeader><CardContent className="space-y-3">{data.recentRequests.filter(item => item.status === "nova").map(item => <div key={`r-${item.id}`} className="rounded-xl bg-[#f1f7dd] p-4"><p className="text-sm font-semibold text-[#526b4d]">Nova solicitação de {item.requesterName}</p><p className="mt-1 text-xs text-[#82948e]">{item.description}</p></div>)}{data.pendingQuotes.map(item => <div key={`q-${item.id}`} className="rounded-xl bg-[#e8eef8] p-4"><p className="text-sm font-semibold text-[#496b98]">Orçamento aguardando resposta</p><p className="mt-1 text-xs text-[#82948e]">{item.description || `Orçamento #${item.id}`} · {money(item.totalCents)}</p></div>)}{!data.recentRequests.some(item => item.status === "nova") && !data.pendingQuotes.length && <p className="py-4 text-sm text-[#82948e]">Tudo em dia por enquanto.</p>}</CardContent></Card></div></div></Page>;
}

export function Reports() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const range = useMemo(() => ({ from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined }), [from, to]); const report = trpc.reports.summary.useQuery(range);
  return <Page title="Relatórios" eyebrow="Entenda seu negócio" description="Indicadores simples para acompanhar o período escolhido." help={<HelpButton title="Como funciona Relatórios?"><p><strong>Relatórios</strong> mostra um resumo do seu negócio para o período selecionado.</p><p><strong>Métricas:</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Faturamento</strong> — soma de todos os pagamentos registrados.</li><li><strong>Recebido</strong> — apenas os pagamentos com status "Pago".</li><li><strong>Pendente</strong> — valor ainda a receber.</li><li><strong>Atendimentos</strong> — quantidade de atendimentos não cancelados.</li><li><strong>Novos clientes</strong> — clientes cadastrados no período.</li></ul><p><strong>Filtro de período:</strong> Defina uma data inicial e final para ver os dados de qualquer intervalo. Sem filtro, exibe todos os registros.</p><p><strong>Clientes recorrentes:</strong> Clientes com mais de um atendimento registrado — um sinal de fidelização.</p></HelpButton>} action={<RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />}>
    {report.isLoading ? <LoadingScreen /> : report.error ? <EmptyState icon={BarChart3} title="Não foi possível carregar o relatório" description="Tente novamente em alguns instantes." action={<Button onClick={() => report.refetch()} className="rounded-xl bg-[#173a34] text-white">Tentar novamente</Button>} /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric title="Faturamento" value={money(report.data?.revenueCents)} hint="no período" icon={CircleDollarSign} accent="green" /><Metric title="Recebido" value={money(report.data?.receivedCents)} hint="pagamentos pagos" icon={WalletCards} accent="blue" /><Metric title="Pendente" value={money(report.data?.pendingCents)} hint="a receber" icon={ClipboardList} accent="orange" /><Metric title="Atendimentos" value={String(report.data?.appointmentCount || 0)} hint="não cancelados" icon={CalendarDays} accent="lime" /><Metric title="Novos clientes" value={String(report.data?.newClients || 0)} hint="no período" icon={Users} accent="green" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Serviços mais realizados</CardTitle></CardHeader><CardContent>{report.data?.topServices.length ? <div className="space-y-4">{report.data.topServices.map((item, index) => <div key={item.serviceId}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-[#526d64]">{index + 1}. {item.name}</span><span className="text-[#82948e]">{item.count} atendimento(s)</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1eb]"><div className="h-full rounded-full bg-[#8aa500]" style={{ width: `${Math.max(12, (item.count / report.data!.topServices[0].count) * 100)}%` }} /></div></div>)}</div> : <EmptyState icon={BarChart3} title="Sem atendimentos no período" description="Quando houver atendimentos, eles aparecerão neste resumo." />}</CardContent></Card><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Clientes recorrentes</CardTitle></CardHeader><CardContent><p className="text-4xl font-bold text-[#173a34]">{report.data?.recurringClients || 0}</p><p className="mt-2 text-sm leading-6 text-[#82948e]">Clientes com pelo menos um atendimento registrado no histórico.</p></CardContent></Card></div></>}
  </Page>;
}

function RangeFilter({ from, to, setFrom, setTo }: { from: string; to: string; setFrom: (value: string) => void; setTo: (value: string) => void }) { return <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm"><Label className="sr-only" htmlFor="period-from">De</Label><Input id="period-from" type="date" value={from} onChange={event => setFrom(event.target.value)} className="h-8 w-[132px] rounded-lg border-0 bg-[#f5f8f2] text-xs" /><span className="text-xs text-[#9aa9a3]">até</span><Label className="sr-only" htmlFor="period-to">Até</Label><Input id="period-to" type="date" value={to} onChange={event => setTo(event.target.value)} className="h-8 w-[132px] rounded-lg border-0 bg-[#f5f8f2] text-xs" />{(from || to) && <Button variant="ghost" onClick={() => { setFrom(""); setTo(""); }} className="h-8 rounded-lg px-2 text-xs text-[#71867f]">Limpar</Button>}</div>; }

function Finance() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const range = useMemo(() => ({ from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined, to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined }), [from, to]);
  const payments = trpc.payment.list.useQuery(range); const expenses = trpc.expense.list.useQuery(range); const summary = trpc.dashboard.summary.useQuery(range); const clients = trpc.customer.list.useQuery(); const services = trpc.service.list.useQuery(); const teamMembers = trpc.team.list.useQuery(); const utils = trpc.useUtils();
  const createPayment = trpc.payment.create.useMutation({ onSuccess: () => { toast.success("Pagamento registrado."); utils.payment.list.invalidate(); setPaymentOpen(false); } });
  const createExpense = trpc.expense.create.useMutation({ onSuccess: () => { toast.success("Despesa registrada."); utils.expense.list.invalidate(); setExpenseOpen(false); } });
  const [paymentOpen, setPaymentOpen] = useState(false); const [expenseOpen, setExpenseOpen] = useState(false);
  const [payment, setPayment] = useState({ clientId: "", serviceId: "", teamMemberId: "", amount: "", method: "pix" as "pix" | "dinheiro" | "cartao" | "transferencia" | "outro", status: "pago" as "pago" | "pendente" | "parcial", note: "" });
  const [expense, setExpense] = useState({ description: "", category: "", amount: "", note: "" });
  const submitPayment = () => { const cents = parseBrlToCents(payment.amount); if (cents <= 0) return toast.error("Informe um valor válido."); createPayment.mutate({ clientId: payment.clientId ? Number(payment.clientId) : undefined, serviceId: payment.serviceId ? Number(payment.serviceId) : undefined, teamMemberId: payment.teamMemberId ? Number(payment.teamMemberId) : undefined, amountCents: cents, method: payment.method, status: payment.status, note: payment.note || undefined }); };
  const submitExpense = () => { const cents = parseBrlToCents(expense.amount); if (!expense.description || cents <= 0) return toast.error("Informe descrição e valor."); createExpense.mutate({ description: expense.description, category: expense.category || undefined, amountCents: cents, note: expense.note || undefined }); };
  const received = (payments.data || []).filter(p => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0); const pending = (payments.data || []).filter(p => p.status !== "pago").reduce((sum, p) => sum + p.amountCents, 0); const spent = (expenses.data || []).reduce((sum, item) => sum + item.amountCents, 0);
  return <Page title="Financeiro" eyebrow="Dinheiro sem complicação" description="Registre receitas e despesas. Sem números inventados: tudo vem dos seus lançamentos." help={<HelpButton title="Como funciona Financeiro?"><p><strong>Financeiro</strong> registra todas as movimentações do seu negócio — receitas e despesas.</p><p><strong>Receitas (entradas):</strong></p><ul className="list-disc pl-5 space-y-1"><li><strong>Pago</strong> — dinheiro já recebido, conta no saldo.</li><li><strong>Pendente</strong> — combinado mas ainda não pago.</li><li><strong>Parcial</strong> — parte foi paga, o resto está pendente.</li></ul><p><strong>Despesas (saídas):</strong> Custos do seu trabalho — materiais, deslocamento, ferramentas etc.</p><p><strong>Saldo:</strong> Receitas pagas menos despesas registradas no período.</p><p><strong>Filtro de período:</strong> Selecione um intervalo de datas para ver só o que aconteceu naquele período.</p></HelpButton>} action={<div className="flex flex-wrap items-center gap-2"><RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} /><Button onClick={() => setExpenseOpen(true)} variant="outline" className="h-11 rounded-xl border-[#dce5dc] bg-white text-[#4c6960]"><Plus className="mr-2 h-4 w-4" /> Nova despesa</Button><Button onClick={() => setPaymentOpen(true)} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"><Plus className="mr-2 h-4 w-4" /> Registrar receita</Button></div>}>
    <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>Registrar receita</DialogTitle><DialogDescription>Pagamento recebido ou a receber.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormSelect label="Cliente" value={payment.clientId} onChange={value => setPayment({ ...payment, clientId: value })} placeholder="Selecionar cliente" options={(clients.data || []).map(c => ({ value: String(c.id), label: c.name }))} /><FormSelect label="Serviço" value={payment.serviceId} onChange={value => { const svc = services.data?.find(s => String(s.id) === value); setPayment({ ...payment, serviceId: value, amount: svc && (!payment.amount || payment.amount === "0" || payment.amount === "0,00") ? formatBrlInput(svc.priceCents) : payment.amount }); }} placeholder="Selecionar serviço" options={(services.data || []).filter(service => service.active).map(service => ({ value: String(service.id), label: service.name }))} />{Boolean(teamMembers.data?.length) && <FormSelect label="Profissional / Parceiro(a)" value={payment.teamMemberId} onChange={value => setPayment({ ...payment, teamMemberId: value })} placeholder="Receita própria (sem comissão)" options={[{ value: "", label: "Receita própria (sem comissão)" }, ...(teamMembers.data || []).filter(m => m.active).map(m => ({ value: String(m.id), label: `${m.name} (${m.role || "Parceiro"} - ${m.commissionPercent}% comissão)` }))]} />}<Field label="Valor" prefix="R$ " value={payment.amount} onChange={value => setPayment({ ...payment, amount: value })} /><div className="grid gap-4 sm:grid-cols-2"><FormSelect label="Forma" value={payment.method} onChange={value => setPayment({ ...payment, method: value as typeof payment.method })} options={[["pix","Pix"],["dinheiro","Dinheiro"],["cartao","Cartão"],["transferencia","Transferência"],["outro","Outro"]].map(([value,label]) => ({ value, label }))} /><FormSelect label="Situação" value={payment.status} onChange={value => setPayment({ ...payment, status: value as typeof payment.status })} options={[["pago","Pago"],["pendente","Pendente"],["parcial","Parcial"]].map(([value,label]) => ({ value, label }))} /></div><Field label="Observação" value={payment.note} onChange={value => setPayment({ ...payment, note: value })} /></div><DialogFooter><Button onClick={submitPayment} className="rounded-xl bg-[#173a34] text-white">Salvar receita</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>Nova despesa</DialogTitle><DialogDescription>Registre um custo real do seu trabalho.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="Descrição" value={expense.description} onChange={value => setExpense({ ...expense, description: value })} placeholder="Ex.: Material elétrico" /><div className="grid gap-4 sm:grid-cols-2"><Field label="Categoria" value={expense.category} onChange={value => setExpense({ ...expense, category: value })} placeholder="Ex.: Materiais" /><Field label="Valor" prefix="R$ " value={expense.amount} onChange={value => setExpense({ ...expense, amount: value })} /></div><Field label="Observação" value={expense.note} onChange={value => setExpense({ ...expense, note: value })} /></div><DialogFooter><Button onClick={submitExpense} className="rounded-xl bg-[#173a34] text-white">Salvar despesa</Button></DialogFooter></DialogContent></Dialog>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Recebido" value={money(received)} hint="receitas pagas" icon={CircleDollarSign} accent="green" /><Metric title="Pendente" value={money(pending)} hint="a receber" icon={ClipboardList} accent="orange" /><Metric title="Despesas" value={money(spent)} hint="custos registrados" icon={WalletCards} accent="blue" /><Metric title="Saldo" value={money(received - spent)} hint="recebido menos despesas" icon={CircleDollarSign} accent="lime" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-lg text-[#173a34]">Resumo do período</CardTitle><p className="mt-1 text-sm text-[#82948e]">Receitas pagas, valores pendentes e despesas por dia.</p></div><BarChart3 className="h-5 w-5 text-[#8aa500]" /></div></CardHeader><CardContent className="pt-0">{summary.isLoading ? <div className="grid h-[250px] place-items-center text-sm text-[#82948e]">Carregando gráfico…</div> : summary.data?.monthlySeries.length ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={summary.data.monthlySeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tickFormatter={value => String(value).slice(8, 10)} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis tickFormatter={value => `R$ ${Math.round(Number(value) / 100)}`} tickLine={false} axisLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip formatter={(value, name) => [money(Number(value)), name === "receitas" ? "Receitas" : name === "pendentes" ? "Pendentes" : "Despesas"]} labelFormatter={value => `Dia ${String(value).slice(8, 10)}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} /><Legend formatter={value => value === "receitas" ? "Receitas" : value === "pendentes" ? "Pendentes" : "Despesas"} iconType="circle" /><Line type="monotone" dataKey="receitas" stroke="var(--chart-1)" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="pendentes" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="5 5" dot={false} /><Line type="monotone" dataKey="despesas" stroke="var(--destructive)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <div className="grid h-[250px] place-items-center rounded-2xl bg-[#f5f8f2] text-center"><div><BarChart3 className="mx-auto h-7 w-7 text-[#9bad9a]" /><p className="mt-3 text-sm font-semibold text-[#526d64]">Nenhuma movimentação no período</p><p className="mt-1 text-xs text-[#82948e]">O gráfico aparecerá quando você registrar receitas ou despesas.</p></div></div>}</CardContent></Card>
      <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Saldo acumulado</CardTitle><p className="text-sm text-[#82948e]">Evolução do saldo recebido menos despesas.</p></CardHeader><CardContent className="pt-0">{summary.data?.monthlySeries.length ? <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.data.monthlySeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="date" tickFormatter={value => String(value).slice(8, 10)} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis tickFormatter={value => `R$ ${Math.round(Number(value) / 100)}`} tickLine={false} axisLine={false} width={58} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip formatter={value => [money(Number(value)), "Saldo"]} labelFormatter={value => `Dia ${String(value).slice(8, 10)}`} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} /><Bar dataKey="saldo" fill="var(--chart-2)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="grid h-[250px] place-items-center text-sm text-[#82948e]">Sem dados para calcular o saldo.</div>}</CardContent></Card>
    </div>
    <Card className="mt-6 rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardHeader><CardTitle className="text-lg text-[#173a34]">Movimentações</CardTitle></CardHeader><CardContent className="p-0">{payments.data?.length || expenses.data?.length ? <div className="divide-y divide-[#edf1eb]">{payments.data?.map(item => { const member = teamMembers.data?.find(m => m.id === item.teamMemberId); const client = clients.data?.find(c => c.id === item.clientId); const service = services.data?.find(s => s.id === item.serviceId); const clientName = client?.name || (item as any).clientName || (item.clientId ? `Cliente #${item.clientId}` : "Receita"); const serviceName = service?.name || (item as any).serviceName; return <div key={`p-${item.id}`} className="flex items-center gap-3 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c]"><WalletCards className="h-4 w-4" /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#284b42]">{clientName}</p>{serviceName && <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5d2] px-2 py-0.5 text-xs font-semibold text-[#667700]"><BriefcaseBusiness className="h-3 w-3" />{serviceName}</span>}{member && <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f1f5] px-2 py-0.5 text-xs font-semibold text-[#2f5e77]"><UserCheck className="h-3 w-3" />{member.name} ({item.commissionPercent || member.commissionPercent}%)</span>}</div><p className="mt-1 text-xs text-[#82948e]">{item.method.toUpperCase()} · {dateLabel(item.createdAt)}{item.commissionAmountCents ? ` · Repasse parceiro: ${money(item.commissionAmountCents)}` : ""}</p></div><div className="text-right"><p className="font-bold text-[#173a34]">+ {money(item.amountCents)}</p><StatusBadge status={item.status} /></div></div>; })}{expenses.data?.map(item => <div key={`e-${item.id}`} className="flex items-center gap-3 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9e5e3] text-[#9c4d43]"><WalletCards className="h-4 w-4" /></div><div className="flex-1"><p className="font-semibold text-[#284b42]">{item.description}</p><p className="mt-1 text-xs text-[#82948e]">{item.category || "Despesa"} · {dateLabel(item.occurredAt)}</p></div><p className="font-bold text-[#9c4d43]">- {money(item.amountCents)}</p></div>)}</div> : <div className="p-8"><EmptyState icon={CircleDollarSign} title="Nenhuma movimentação registrada" description="Quando você registrar uma receita ou despesa, ela aparecerá aqui." /></div>}</CardContent></Card>
  </Page>;
}

export function TeamPage() {
  const [period, setPeriod] = useState<"hoje" | "semana" | "mes" | "tudo">("mes");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const range = useMemo(() => {
    const now = new Date();
    if (period === "hoje") {
      const dStr = now.toISOString().split("T")[0];
      return { from: `${dStr}T00:00:00.000Z`, to: `${dStr}T23:59:59.999Z` };
    }
    if (period === "semana") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (period === "mes") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    if (from || to) {
      return {
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined
      };
    }
    return { from: undefined, to: undefined };
  }, [period, from, to]);

  const report = trpc.team.report.useQuery(range);
  const teamList = trpc.team.list.useQuery();
  const profile = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const emptyForm = {
    name: "",
    role: "",
    phone: "",
    email: "",
    pixKey: "",
    pixKeyType: "cpf" as "cpf" | "email" | "telefone" | "aleatoria",
    commissionPercent: "50",
    color: "#28564d",
    notes: ""
  };
  const [form, setForm] = useState(emptyForm);

  const createMember = trpc.team.create.useMutation({
    onSuccess: () => {
      toast.success("Profissional parceiro(a) cadastrado(a) com sucesso!");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
      setModalOpen(false);
      setEditingMember(null);
    },
    onError: err => toast.error(err.message || "Erro ao cadastrar parceiro.")
  });

  const updateMember = trpc.team.update.useMutation({
    onSuccess: () => {
      toast.success("Dados do parceiro atualizados.");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
      setModalOpen(false);
      setEditingMember(null);
    },
    onError: err => toast.error(err.message || "Erro ao atualizar parceiro.")
  });

  const toggleActive = trpc.team.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status do profissional atualizado.");
      utils.team.list.invalidate();
      utils.team.report.invalidate();
    }
  });

  const openNew = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (member: any) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      pixKey: member.pixKey || "",
      pixKeyType: member.pixKeyType || "cpf",
      commissionPercent: String(member.commissionPercent || 50),
      color: member.color || "#28564d",
      notes: member.notes || ""
    });
    setModalOpen(true);
  };

  const submitMember = () => {
    if (!form.name.trim()) return toast.error("Informe o nome do profissional parceiro.");
    const comm = Number(form.commissionPercent);
    if (isNaN(comm) || comm < 0 || comm > 100) return toast.error("A comissão deve ser uma porcentagem entre 0% e 100%.");

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || "Profissional Parceiro(a)",
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      pixKey: form.pixKey.trim() || undefined,
      pixKeyType: form.pixKeyType,
      commissionPercent: comm,
      color: form.color,
      notes: form.notes.trim() || undefined
    };

    if (editingMember) {
      updateMember.mutate({ id: editingMember.id, ...payload });
    } else {
      createMember.mutate(payload);
    }
  };

  const periodLabel = period === "hoje" ? "Hoje" : period === "semana" ? "Esta Semana" : period === "mes" ? "Este Mês" : "Geral / Período Selecionado";

  const handleSendWhatsAppReport = (memberStats: any, memberInfo: any) => {
    const studioName = profile.data?.displayName || "Nosso Espaço";
    const partnerName = memberInfo?.name || "Parceiro(a)";
    const totalAppointments = memberStats?.count || 0;
    const gross = money(memberStats?.grossCents || 0);
    const commVal = money(memberStats?.commissionCents || 0);
    const commPct = memberInfo?.commissionPercent ?? 50;
    const studioNet = money(memberStats?.studioCents || 0);
    const pix = memberInfo?.pixKey ? `${(memberInfo.pixKeyType || "PIX").toUpperCase()}: ${memberInfo.pixKey}` : "A combinar";

    const text = `*FECHAMENTO DE REPASSES - ${studioName.toUpperCase()}*\n\n` +
      `Olá *${partnerName}*! Segue o extrato de atendimentos e comissões referente a *${periodLabel}*:\n\n` +
      `💅 *Atendimentos realizados:* ${totalAppointments}\n` +
      `💰 *Faturamento Total Gerado:* ${gross}\n` +
      `✂️ *Sua Comissão (${commPct}%):* ${commVal}\n` +
      `🏢 *Retenção Estúdio/Espaço:* ${studioNet}\n\n` +
      `🔑 *Dados PIX para Acerto:*\n${pix}\n\n` +
      `_Extrato emitido com base na Lei do Salão-Parceiro (Lei 13.352). Qualquer dúvida estou à disposição!_`;

    const rawPhone = (memberInfo?.phone || "").replace(/\D/g, "");
    if (rawPhone) {
      window.open(`https://wa.me/55${rawPhone.replace(/^55/, "")}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("Extrato copiado para a área de transferência! Cole no WhatsApp do profissional.");
    }
  };

  const roleSuggestions = [
    "Manicure & Nail Designer",
    "Alongamento em Fibra / Gel",
    "Designer de Sobrancelhas",
    "Micropigmentadora",
    "Lash Designer (Cílios)",
    "Esteticista Facial & Corporal",
    "Cabeleireira(o) / Colorista",
    "Maquiadora Profissional",
    "Massoterapeuta / Depiladora"
  ];

  const activeMembersCount = (teamList.data || []).filter(m => m.active).length;

  return (
    <Page
      title="Equipe & Parceiros"
      eyebrow="Módulo Estúdio & Salão-Parceiro"
      description="Gerencie profissionais parceiros, acompanhe a produção de cada um, apure repasses de comissão e envie o extrato direto no WhatsApp."
      help={
        <HelpButton title="Como funciona o Módulo de Equipe?">
          <p><strong>Salão e Estúdio Parceiro (Lei 13.352/2016):</strong></p>
          <p>Permite que você cadastre múltiplos profissionais autônomos que atendem no seu espaço com divisão transparente de comissões (ex: 50%/50%, 60%/40%).</p>
          <p><strong>Vantagens:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Agendamentos simultâneos:</strong> Profissionais diferentes podem atender clientes no mesmo horário sem choque de agenda.</li>
            <li><strong>Cálculo Automático:</strong> Toda receita registrada calcula na hora o repasse do parceiro e o lucro líquido do salão.</li>
            <li><strong>Extrato no WhatsApp:</strong> Em 1 clique, você envia o demonstrativo detalhado com os totais apurados e a chave PIX do parceiro.</li>
          </ul>
        </HelpButton>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {(["hoje", "semana", "mes", "tudo"] as const).map(key => {
              const label = key === "hoje" ? "Hoje" : key === "semana" ? "Semana" : key === "mes" ? "Mês" : "Geral";
              return (
                <Button
                  key={key}
                  variant="ghost"
                  onClick={() => setPeriod(key)}
                  className={cn(
                    "h-9 rounded-lg px-3 text-xs",
                    period === key ? "bg-[#173a34] text-white hover:bg-[#28564d] hover:text-white" : "text-[#71867f]"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <Button onClick={openNew} className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]">
            <Plus className="mr-2 h-4 w-4" /> Novo(a) parceiro(a)
          </Button>
        </div>
      }
    >
      <div className="mb-6 rounded-2xl border border-[#d9e7bf] bg-[#f7faed] p-4 text-xs leading-relaxed text-[#4d6642]">
        <div className="flex items-center gap-2 font-bold text-[#2d4724] text-sm mb-1">
          <Building2 className="h-4 w-4 text-[#8aa500]" />
          <span>Gestão Profissional para Estúdios e Espaços Compartilhados</span>
        </div>
        Cadastre os profissionais parceiros que utilizam sua estrutura. O MeuAutônomo cuida da apuração de receitas, divide a comissão combinada e facilita o acerto de contas sem burocracia ou risco trabalhista.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Parceiros Ativos"
          value={String(activeMembersCount)}
          hint="profissionais cadastrados"
          icon={Users}
          accent="lime"
        />
        <Metric
          title="Faturamento da Equipe"
          value={money(report.data?.totalGrossCents || 0)}
          hint={`em atendimentos (${periodLabel})`}
          icon={CircleDollarSign}
          accent="green"
        />
        <Metric
          title="Comissões a Repassar"
          value={money(report.data?.totalCommissionCents || 0)}
          hint="total a pagar aos parceiros"
          icon={Percent}
          accent="orange"
        />
        <Metric
          title="Lucro do Estúdio"
          value={money(report.data?.totalStudioNetCents || 0)}
          hint="retenção líquida do espaço"
          icon={WalletCards}
          accent="blue"
        />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#173a34]">Profissionais Parceiros</h2>
            <p className="text-xs text-[#82948e]">Acompanhe o faturamento individual e envie o extrato de acerto com um clique.</p>
          </div>
        </div>

        {teamList.isLoading ? (
          <div className="p-8 text-center text-sm text-[#82948e]">Carregando parceiros...</div>
        ) : !teamList.data?.length ? (
          <EmptyState
            icon={UserCheck}
            title="Nenhum parceiro cadastrado ainda"
            description="Cadastre manicures, designers de sobrancelha, cabeleireiros ou outros profissionais que trabalham com você."
            action={
              <Button onClick={openNew} className="rounded-xl bg-[#173a34] text-white">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar primeiro(a) parceiro(a)
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamList.data.map(member => {
              const stats = (report.data?.breakdown || []).find((b: any) => b.member.id === member.id) || {
                grossCents: 0,
                commissionCents: 0,
                studioCents: 0,
                count: 0
              };

              return (
                <Card
                  key={member.id}
                  className={cn(
                    "rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] transition",
                    !member.active && "opacity-60 bg-[#f9fbf8]"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-bold text-white shadow-sm"
                          style={{ backgroundColor: member.color || "#28564d" }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#173a34] text-base">{member.name}</h3>
                          <p className="text-xs font-medium text-[#71867f]">{member.role || "Profissional Parceiro(a)"}</p>
                        </div>
                      </div>
                      <Badge className={cn("border-0 text-[10px]", member.active ? "bg-[#eef5d2] text-[#6d8000]" : "bg-[#f1f3f1] text-[#82948e]")}>
                        {member.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f5f8f2] px-3.5 py-2 text-xs">
                      <span className="text-[#526d64] font-medium">Comissão Acordada:</span>
                      <strong className="text-[#173a34] text-sm">{member.commissionPercent}%</strong>
                    </div>

                    {member.pixKey && (
                      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#dce5dc] bg-white px-3.5 py-2 text-xs">
                        <div className="min-w-0 flex-1 truncate pr-2 text-[#526d64]">
                          <span className="font-semibold text-[#173a34] mr-1">{member.pixKeyType?.toUpperCase() || "PIX"}:</span>
                          <span className="truncate">{member.pixKey}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(member.pixKey || "");
                            toast.success("Chave PIX copiada!");
                          }}
                          className="h-7 px-2 text-[11px] text-[#4c6960] hover:bg-[#f5f8f2]"
                          title="Copiar Chave PIX"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copiar
                        </Button>
                      </div>
                    )}

                    <div className="mt-5 border-t border-[#edf1eb] pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#82948e] mb-3">
                        Produção ({periodLabel})
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-[#fbfcf9] border border-[#edf1eb] p-2.5">
                          <p className="text-[#82948e] text-[10px]">Faturamento</p>
                          <p className="font-bold text-[#173a34] mt-0.5">{money(stats.grossCents)}</p>
                          <p className="text-[10px] text-[#82948e] mt-1">{stats.count} atendimento(s)</p>
                        </div>
                        <div className="rounded-xl bg-[#fbfcf9] border border-[#edf1eb] p-2.5">
                          <p className="text-[#82948e] text-[10px]">Comissão ({member.commissionPercent}%)</p>
                          <p className="font-bold text-[#966b17] mt-0.5">{money(stats.commissionCents)}</p>
                          <p className="text-[10px] text-[#3e885c] mt-1">Estúdio: {money(stats.studioCents)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <Button
                        onClick={() => handleSendWhatsAppReport(stats, member)}
                        className="w-full h-10 rounded-xl bg-[#28564d] text-white hover:bg-[#173a34] text-xs font-semibold shadow-sm"
                      >
                        <Share2 className="mr-2 h-3.5 w-3.5 text-[#d9f56a]" /> Enviar Extrato no WhatsApp
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => openEdit(member)}
                          className="h-9 flex-1 rounded-xl border-[#dce5dc] bg-white text-xs text-[#526d64]"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => toggleActive.mutate({ id: member.id, active: !member.active })}
                          className="h-9 rounded-xl text-xs text-[#71867f]"
                        >
                          {member.active ? "Desativar" : "Reativar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Editar Profissional Parceiro(a)" : "Novo(a) Profissional Parceiro(a)"}</DialogTitle>
            <DialogDescription>
              Cadastre o parceiro para dividir comissões e gerar agendamentos independentes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <Field
              label="Nome completo do(a) profissional"
              value={form.name}
              onChange={val => setForm({ ...form, name: val })}
              placeholder="Ex.: Camila Souza"
            />

            <div>
              <Field
                label="Especialidade / Função"
                value={form.role}
                onChange={val => setForm({ ...form, role: val })}
                placeholder="Ex.: Manicure & Nail Designer"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roleSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, role: s })}
                    className="rounded-lg bg-[#f0f4ea] px-2 py-1 text-[11px] text-[#4d6b46] hover:bg-[#e4eed9] transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="WhatsApp / Telefone"
                value={form.phone}
                onChange={val => setForm({ ...form, phone: val })}
                placeholder="(00) 00000-0000"
              />
              <Field
                label="E-mail (opcional)"
                value={form.email}
                onChange={val => setForm({ ...form, email: val })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="rounded-2xl bg-[#f5f8f2] p-4 border border-[#dce5dc] space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-[#173a34]">Comissão do(a) Parceiro(a)</Label>
                <span className="text-base font-black text-[#173a34] bg-white px-2.5 py-1 rounded-xl border border-[#dce5dc] shadow-2xs">
                  {form.commissionPercent}%
                </span>
              </div>
              <p className="text-xs text-[#6d837c]">
                Porcentagem que o profissional recebe sobre o valor de cada atendimento realizado.
              </p>

              {/* Botões de porcentagens comuns */}
              <div className="grid grid-cols-4 gap-2">
                {["40", "50", "60", "70"].map(pct => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, commissionPercent: pct })}
                    className={cn(
                      "h-10 rounded-xl font-bold text-xs transition",
                      form.commissionPercent === pct
                        ? "bg-[#173a34] text-[#d9f56a] border-[#173a34] shadow-sm"
                        : "bg-white text-slate-700 hover:bg-[#eef5e6]"
                    )}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              {/* Campo para digitar porcentagem personalizada (100% visível em qualquer smartphone) */}
              <div className="pt-1">
                <Label className="text-[11px] font-semibold text-[#5a7369] block mb-1.5">
                  Ou digite outra porcentagem personalizada:
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.commissionPercent}
                    onChange={e => setForm({ ...form, commissionPercent: e.target.value })}
                    className="h-11 rounded-xl bg-white pr-9 text-sm font-bold text-[#173a34] border-[#dce5dc] focus:border-[#173a34]"
                    placeholder="Ex.: 45"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormSelect
                label="Tipo da Chave PIX"
                value={form.pixKeyType}
                onChange={val => setForm({ ...form, pixKeyType: val as any })}
                options={[
                  { value: "cpf", label: "CPF" },
                  { value: "telefone", label: "Telefone" },
                  { value: "email", label: "E-mail" },
                  { value: "aleatoria", label: "Chave Aleatória" },
                ]}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Chave PIX para repasse"
                  value={form.pixKey}
                  onChange={val => setForm({ ...form, pixKey: val })}
                  placeholder="Informe a chave PIX do profissional"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Observações do acordo / Contrato</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex.: Dias de atendimento na semana, regras de produtos ou materiais utilizados..."
                className="rounded-xl border-[#dce5dc]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={submitMember}
              disabled={createMember.isPending || updateMember.isPending}
              className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
            >
              {editingMember ? "Salvar Alterações" : "Cadastrar Parceiro(a)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}


function ProfessionalCard() { const profile = trpc.profile.get.useQuery(); if (!profile.data) return null; const shareUrl = `${window.location.origin}/p/${profile.data.slug}`; const copy = () => { navigator.clipboard?.writeText(shareUrl); toast.success("Link do cartão copiado."); }; return <Page title="Meu cartão" eyebrow="Sua presença profissional" description="Um link simples para compartilhar onde seus clientes já estão." help={<HelpButton title="Como funciona meu Cartão?"><p><strong>Meu Cartão</strong> é sua presença digital — um link público para compartilhar com clientes.</p><p><strong>Link público:</strong> Seu link único no formato <code>meuautonomo.app/p/seu-slug</code>. Clientes acessam sem precisar criar conta.</p><p><strong>Como divulgar:</strong> Coloque o link na bio do Instagram, no status do WhatsApp e em suas propostas.</p><p>Clientes que acessam seu cartão podem preencher uma solicitação que cai direto em <strong>Solicitações</strong>.</p></HelpButton>}><div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><Card className="overflow-hidden rounded-[28px] border-0 bg-[#173a34] text-white shadow-[0_16px_45px_rgba(19,42,39,0.18)]"><CardContent className="relative p-7 sm:p-9"><div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#d9f56a]/10" /><div className="relative"><div className="mb-10 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-[#d9f56a]" /> MeuAutônomo</span><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">Cartão digital</span></div><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#d9f56a] text-2xl font-bold text-[#173a34]">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt={profile.data.displayName} className="h-full w-full rounded-2xl object-cover" /> : profile.data.displayName.charAt(0).toUpperCase()}</div><h2 className="mt-5 text-3xl font-bold tracking-tight">{profile.data.displayName}</h2><p className="mt-1 text-lg text-[#d9f56a]">{profile.data.professionName}</p><p className="mt-5 max-w-sm text-sm leading-6 text-white/65">{profile.data.bio || "Profissional autônomo pronto para ajudar."}</p><div className="mt-7 space-y-2 text-sm text-white/70">{profile.data.serviceRegion && <p><MapPin className="mr-2 inline h-4 w-4 text-[#d9f56a]" />{profile.data.serviceRegion}</p>}{profile.data.whatsapp && <p><Share2 className="mr-2 inline h-4 w-4 text-[#d9f56a]" />{formatPhone(profile.data.whatsapp)}</p>}</div></div></CardContent></Card><div className="space-y-5"><Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]"><CardContent className="p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815]"><Link2 className="h-5 w-5" /></div><div><h3 className="font-bold text-[#284b42]">Seu link público</h3><p className="mt-1 text-sm text-[#82948e]">Compartilhe e receba novas solicitações.</p></div></div><div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f5f8f2] p-3"><span className="min-w-0 flex-1 truncate text-sm text-[#526d64]">{shareUrl}</span><Button variant="outline" onClick={copy} className="h-9 shrink-0 rounded-lg border-[#dce5dc] bg-white"><Copy className="h-4 w-4" /></Button></div><div className="mt-4 flex flex-wrap gap-2"><Button onClick={copy} className="rounded-xl bg-[#173a34] text-white"><Share2 className="mr-2 h-4 w-4" /> Compartilhar cartão</Button><a href={`/p/${profile.data.slug}`} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-xl border-[#dce5dc] bg-white text-[#4c6960]"><ExternalLink className="mr-2 h-4 w-4" /> Abrir página</Button></a></div></CardContent></Card><Card className="rounded-[24px] border-0 bg-[#f1f7dd]"><CardContent className="p-6"><p className="text-sm font-semibold text-[#52674c]">Dica de hoje</p><p className="mt-2 text-lg font-bold text-[#304d2c]">Seu cartão é seu ponto de encontro.</p><p className="mt-2 text-sm leading-6 text-[#6d805f]">Coloque o link na bio do Instagram, no status do WhatsApp e nas suas propostas.</p></CardContent></Card></div></div></Page>; }

function SettingsPage() {
  const profile = trpc.profile.get.useQuery();
  const availability = trpc.profile.getAvailability.useQuery();
  const update = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas.");
      profile.refetch();
    }
  });
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: () => {
      toast.success("Foto atualizada.");
      profile.refetch();
    }
  });
  const saveAvailability = trpc.profile.saveAvailability.useMutation({
    onSuccess: () => toast.success("Horários salvos.")
  });
  const resetDb = trpc.database.reset.useMutation({
    onSuccess: () => {
      toast.success("Banco zerado com sucesso!");
      setTimeout(() => window.location.reload(), 700);
    }
  });

  const [form, setForm] = useState<any>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  if (!profile.data) return null;

  const current = form || {
    displayName: profile.data.displayName,
    slug: profile.data.slug,
    professionCategory: profile.data.professionCategory || "",
    professionName: profile.data.professionName,
    bio: profile.data.bio || "",
    city: profile.data.city || "",
    serviceRegion: profile.data.serviceRegion || "",
    phone: profile.data.phone || "",
    whatsapp: profile.data.whatsapp || "",
    avatarUrl: profile.data.avatarUrl || "",
    showPrices: profile.data.showPrices,
    bookingEnabled: profile.data.bookingEnabled,
    pixKey: profile.data.pixKey || "",
    pixKeyType: profile.data.pixKeyType || "cpf",
  };

  const save = () => update.mutate({
    ...current,
    professionCategory: current.professionCategory || undefined,
    city: current.city || undefined,
    serviceRegion: current.serviceRegion || undefined,
    bio: current.bio || undefined,
    phone: current.phone || undefined,
    whatsapp: current.whatsapp || undefined,
    avatarUrl: current.avatarUrl || undefined,
    pixKey: current.pixKey || undefined,
    pixKeyType: current.pixKeyType || undefined,
  });

  return (
    <Page
      title="Configurações"
      eyebrow="Seu espaço, do seu jeito"
      description="Atualize seus dados públicos, chave PIX e sua disponibilidade."
      help={
        <HelpButton title="Como funciona Configurações?">
          <p><strong>Configurações</strong> é onde você ajusta seu perfil profissional, sua chave PIX e sua disponibilidade de horários.</p>
          <p><strong>Perfil público:</strong> Nome, profissão, endereço público (slug), cidade, WhatsApp e descrição aparecem no seu cartão e página pública.</p>
          <p><strong>Chave PIX:</strong> Configurada aqui, ela aparece com botão de 1 clique "Copiar PIX" nos orçamentos aprovados e nos recibos digitais.</p>
          <p><strong>Foto de perfil:</strong> Imagens até 5 MB nos formatos JPEG, PNG ou WebP.</p>
          <p><strong>Disponibilidade:</strong> Defina horário de início e fim para que o sistema valide novos agendamentos.</p>
        </HelpButton>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
          <CardHeader>
            <CardTitle className="text-lg text-[#173a34]">Perfil profissional</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4 rounded-2xl bg-[#f5f8f2] p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#d9f56a] text-xl font-bold text-[#173a34]">
                {current.avatarUrl ? <img src={current.avatarUrl} alt={current.displayName} className="h-full w-full object-cover" /> : current.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Label className="mb-1 block text-sm text-[#38584f]">Foto do perfil</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (!file || file.size > 5_000_000) return toast.error("Escolha uma imagem de até 5 MB.");
                    const reader = new FileReader();
                    reader.onload = () => uploadAvatar.mutate({
                      fileName: file.name,
                      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
                      dataUrl: String(reader.result)
                    });
                    reader.readAsDataURL(file);
                  }}
                  className="h-9 rounded-lg border-[#dce5dc] bg-white text-xs"
                />
              </div>
            </div>
            <Field label="Nome" value={current.displayName} onChange={value => setForm({ ...current, displayName: value })} />
            <ProfessionSelectField
              professionName={current.professionName}
              professionCategory={current.professionCategory}
              onChange={(name, category) => setForm({ ...current, professionName: name, professionCategory: category })}
            />
            <PublicAddressField value={current.slug} onChange={value => setForm({ ...current, slug: value })} />
            <StateCitySelect
              value={current.city}
              onChange={value => setForm({ ...current, city: value, serviceRegion: value ? `${value} e região` : current.serviceRegion })}
            />
            <Field label="WhatsApp" value={current.whatsapp} onChange={value => setForm({ ...current, whatsapp: value })} />
            <div>
              <Label className="mb-2 block">Descrição</Label>
              <Textarea value={current.bio} onChange={e => setForm({ ...current, bio: e.target.value })} />
            </div>
            <Button onClick={save} disabled={update.isPending} className="mt-2 w-fit rounded-xl bg-[#173a34] text-white">
              Salvar perfil
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e3f3e8] text-[#2c7a45]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg text-[#173a34]">Chave PIX para Recebimentos</CardTitle>
                  <p className="text-xs text-[#82948e]">Aparece na proposta aprovada e no recibo para seu cliente</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-2 block">Tipo de Chave</Label>
                  <Select
                    value={current.pixKeyType || "cpf"}
                    onValueChange={v => setForm({ ...current, pixKeyType: v })}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-[#dce5dc] bg-white">
                      <SelectValue placeholder="Tipo de Chave" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Chave PIX"
                    placeholder={
                      current.pixKeyType === "telefone"
                        ? "(11) 99999-9999"
                        : current.pixKeyType === "email"
                        ? "seu@email.com"
                        : current.pixKeyType === "cnpj"
                        ? "00.000.000/0001-00"
                        : current.pixKeyType === "aleatoria"
                        ? "Chave aleatória gerada pelo banco"
                        : "000.000.000-00"
                    }
                    value={current.pixKey || ""}
                    onChange={value => setForm({ ...current, pixKey: value })}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-[#f5f8f2] p-3 text-xs leading-5 text-[#627a6f]">
                💡 <strong>Facilidade para receber:</strong> Quando o cliente aprova o orçamento, um botão destacado <em>"Copiar Chave PIX"</em> é exibido automaticamente, agilizando o seu recebimento.
              </div>
              <Button onClick={save} disabled={update.isPending} className="rounded-xl bg-[#173a34] text-white">
                Salvar Chave PIX
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#173a34]">Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-[#71867f]">
                Esses horários são usados para validar novos agendamentos e evitar conflitos.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Começo</Label>
                  <Input id="availability-start" type="time" defaultValue={availability.data ? JSON.parse(availability.data.schedule).start : "08:00"} />
                </div>
                <div>
                  <Label className="mb-2 block">Fim</Label>
                  <Input id="availability-end" type="time" defaultValue={availability.data ? JSON.parse(availability.data.schedule).end : "18:00"} />
                </div>
              </div>
              <Button
                onClick={() => {
                  const start = (document.getElementById("availability-start") as HTMLInputElement)?.value || "08:00";
                  const end = (document.getElementById("availability-end") as HTMLInputElement)?.value || "18:00";
                  saveAvailability.mutate({
                    schedule: JSON.stringify({ days: ["mon","tue","wed","thu","fri"], start, end }),
                    unavailableDays: JSON.stringify([])
                  });
                }}
                className="rounded-xl bg-[#173a34] text-white"
              >
                Salvar horários
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[24px] border-0 shadow-[0_10px_35px_rgba(19,42,39,0.05)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[#173a34]">Ambiente de Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[#71867f]">
              O sistema salva seus dados em tempo real. Se desejar limpar todos os registros (clientes, orçamentos, atendimentos e despesas) para iniciar testes do zero, você pode usar a ação rápida abaixo ou acessar o painel <Link href="/admin" className="font-semibold text-[#173a34] underline">Administrativo (/admin)</Link>.
            </p>
            <Button
              variant="outline"
              onClick={() => setResetConfirmOpen(true)}
              disabled={resetDb.isPending}
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Zerar dados para novos testes
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Zerar dados de teste?"
        description="Esta ação apagará todos os clientes, orçamentos, atendimentos e despesas de teste, restaurando o estado inicial do sistema para que você possa recomeçar suas validações."
        confirmLabel="Sim, zerar dados"
        variant="danger"
        onConfirm={() => {
          setResetConfirmOpen(false);
          resetDb.mutate();
        }}
      />
    </Page>
  );
}

export function TutorialPage() {
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"passos" | "estudio" | "dicas">("passos");

  const openTour = (tab: "passos" | "estudio" | "dicas" = "passos") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const steps = [
    {
      num: 1,
      icon: UserRound,
      color: "bg-[#eef5d2] text-[#819815]",
      title: "Seu Cartão Digital & Link Profissional",
      badge: "Comece Aqui",
      desc: "Você ganha uma página pública exclusiva (ex: /p/seu-nome). É o seu cartão de visitas na web. Seus clientes NÃO precisam instalar app nem criar conta para ver seus serviços.",
      path: "/cartao",
      buttonText: "Acessar Meu Cartão",
      tip: "Coloque o link na bio do seu Instagram e no status do WhatsApp!",
    },
    {
      num: 2,
      icon: BriefcaseBusiness,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Catálogo de Serviços com Preços Prontos",
      badge: "Catálogo Rápido",
      desc: "Cadastre seus serviços com duração, valor e modalidade. Use nossas sugestões prontas para estética, beleza, unhas, sobrancelhas ou adicione qualquer especialidade autônoma.",
      path: "/servicos",
      buttonText: "Configurar Serviços",
      tip: "Os serviços cadastrados preenchem automaticamente a agenda e os orçamentos.",
    },
    {
      num: 3,
      icon: UserCheck,
      color: "bg-[#f1f7dd] text-[#28564d]",
      title: "Módulo Equipe & Estúdio (Salão-Parceiro)",
      badge: "Para Quem Tem Equipe",
      desc: "Tem mais pessoas trabalhando no mesmo local? Baseado na Lei do Salão-Parceiro (Lei 13.352), cadastre parceiros autônomos com comissões individuais (ex: 50%, 60%) e gerencie tudo sem conflitos.",
      path: "/equipe",
      buttonText: "Módulo Equipe",
      tip: "Gera extratos individuais prontos para enviar no WhatsApp do parceiro com a chave PIX!",
    },
    {
      num: 4,
      icon: FileText,
      color: "bg-[#fff1d9] text-[#a27320]",
      title: "Orçamentos Formais no WhatsApp",
      badge: "Feche Mais Vendas",
      desc: "Crie propostas claras e elegantes em menos de 1 minuto. O cliente recebe um link no WhatsApp, confere os detalhes e aprova em 1 clique. Acaba a insegurança sobre valores combinados.",
      path: "/orcamentos",
      buttonText: "Criar Orçamento",
      tip: "Orçamentos aprovados viram atendimentos na agenda com apenas um toque.",
    },
    {
      num: 5,
      icon: CalendarDays,
      color: "bg-[#e8f1f5] text-[#3f738e]",
      title: "Agenda Inteligente & Sem Conflitos",
      badge: "Organização Total",
      desc: "Controle seus compromissos nos modos Dia, Semana ou Mês. Selecione o profissional responsável caso tenha parceiros no estúdio e acompanhe status em tempo real.",
      path: "/agenda",
      buttonText: "Minha Agenda",
      tip: "Clique em 'Abrir rota' para traçar o caminho até o endereço do cliente no Google Maps.",
    },
    {
      num: 6,
      icon: CircleDollarSign,
      color: "bg-[#e3f3e8] text-[#3e885c]",
      title: "Financeiro & Recibos em PDF",
      badge: "Zero Taxas",
      desc: "Receba 100% dos seus ganhos diretamente via PIX, cartão ou dinheiro — sem intermediários. Registre pagamentos, acompanhe valores a receber e emita Recibos em PDF com assinatura formal.",
      path: "/financeiro",
      buttonText: "Abrir Financeiro",
      tip: "Recibos em PDF podem ser compartilhados direto no WhatsApp ou impressos.",
    },
    {
      num: 7,
      icon: SunMedium,
      color: "bg-[#fdf3d8] text-[#966b15]",
      title: "Meu Dia & Rotina Sem Estresse",
      badge: "Assistente Diário",
      desc: "Abra pela manhã e veja em uma única tela quem são seus clientes do dia, horários marcados, total previsto para faturar e ações pendentes. Produtividade máxima sem perder tempo.",
      path: "/meu-dia",
      buttonText: "Ver Meu Dia",
      tip: "A rotina ideal: confira o 'Meu Dia' antes de começar os atendimentos.",
    },
  ];

  return (
    <Page
      title="Guia do Usuário & Tutorial Prático"
      eyebrow="Aprenda a Usar"
      description="Tudo o que você precisa saber para dominar cada ferramenta do MeuAutônomo, aumentar seu faturamento e organizar seu trabalho."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => openTour("passos")}
            className="h-11 rounded-xl bg-[#173a34] px-4 font-bold text-white shadow-sm hover:bg-[#28564d]"
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#d9f56a]" /> Iniciar Tour Interativo
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/app")}
            className="h-11 rounded-xl border-[#ccdccc] bg-white text-[#34564d]"
          >
            Ir para o Painel
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Banner de Boas-Vindas e Atalho */}
        <div className="rounded-[26px] border border-[#d2e4b8] bg-linear-to-r from-[#f7fbe8] via-[#f0f8df] to-[#e6f3d0] p-6 shadow-[0_8px_30px_rgba(23,58,52,0.06)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#173a34] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d9f56a]">
                  Passo a Passo
                </span>
                <span className="text-xs font-semibold text-[#667700]">Guia Completo da Plataforma</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#173a34] md:text-3xl">
                Tudo o que você precisa para decolar seu negócio
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#486255] md:text-base">
                O MeuAutônomo foi feito para autônomos individuais e donas de estúdios ou salões. Escolha uma das seções abaixo para ver como aplicar no seu dia a dia.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-96">
              <button
                type="button"
                onClick={() => openTour("passos")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Sparkles className="h-6 w-6 text-[#8aa500]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">7 Passos Básicos</span>
                <span className="text-[11px] text-[#71867f]">Para começar</span>
              </button>
              <button
                type="button"
                onClick={() => openTour("estudio")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Building2 className="h-6 w-6 text-[#28564d]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">Estúdio & Equipe</span>
                <span className="text-[11px] text-[#71867f]">Salão-Parceiro</span>
              </button>
              <button
                type="button"
                onClick={() => openTour("dicas")}
                className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-xs transition hover:bg-[#f3f8e5] hover:shadow-sm"
              >
                <Lightbulb className="h-6 w-6 text-[#a27320]" />
                <span className="mt-2 text-xs font-bold text-[#173a34]">Dicas de Ouro</span>
                <span className="text-[11px] text-[#71867f]">0% de taxas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Abas com Conteúdo Detalhado */}
        <Tabs defaultValue="simulador" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-4 rounded-2xl bg-[#e8eee5] p-1.5 h-auto gap-1">
            <TabsTrigger
              value="simulador"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              ✨ Simulador Visual (Ver na Prática)
            </TabsTrigger>
            <TabsTrigger
              value="passos"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              🚀 7 Passos para Começar
            </TabsTrigger>
            <TabsTrigger
              value="estudio"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              🏢 Estúdio & Equipe
            </TabsTrigger>
            <TabsTrigger
              value="dicas"
              className="rounded-xl py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#173a34] data-[state=active]:shadow-xs"
            >
              💡 Dicas & Perguntas
            </TabsTrigger>
          </TabsList>

          {/* ABA 0: SIMULADOR VISUAL COMPLETO */}
          <TabsContent value="simulador" className="space-y-4">
            <SimulatorTour />
          </TabsContent>

          {/* ABA 1: OS 7 PASSOS */}
          <TabsContent value="passos" className="space-y-4">
            <div className="grid gap-4">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <Card key={step.num} className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-bold", step.color)}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-[#edf2ec] px-2 py-0.5 text-xs font-bold text-[#4e685f]">
                                Passo {step.num}
                              </span>
                              <Badge className="border-0 bg-[#eef5d2] text-xs font-semibold text-[#667700]">
                                {step.badge}
                              </Badge>
                            </div>
                            <h3 className="mt-1.5 text-lg font-bold text-[#173a34]">
                              {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-[#5d756d] leading-relaxed max-w-2xl">
                              {step.desc}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#718600] bg-[#fbfdec] px-3 py-1.5 rounded-lg border border-[#e4edcd] w-fit">
                              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                              <span>{step.tip}</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 sm:self-center">
                          <Button
                            onClick={() => setLocation(step.path)}
                            className="w-full sm:w-auto rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] text-xs font-bold h-10 px-4"
                          >
                            {step.buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ABA 2: ESTÚDIO & EQUIPE */}
          <TabsContent value="estudio" className="space-y-6">
            <Card className="rounded-[24px] border-0 bg-[#173a34] text-white shadow-[0_12px_40px_rgba(19,42,39,0.12)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 text-[#d9f56a]">
                  <Building2 className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Gestão Completa de Salão & Estúdio
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-bold">
                  Como funciona o Módulo de Equipe (Lei do Salão-Parceiro)?
                </h3>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/70 max-w-3xl">
                  Se você possui um estúdio de estética, salão de beleza, barbearia ou espaço compartilhado onde outras manicures, lash designers ou profissionais autônomas atendem, o MeuAutônomo resolve 100% da sua gestão contábil e de repasses.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setLocation("/equipe")}
                    className="rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e] font-bold text-xs h-10 px-5"
                  >
                    Acessar Módulo Equipe <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openTour("estudio")}
                    className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 text-xs font-medium h-10"
                  >
                    Ver Tour do Módulo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815] font-bold">1</div>
                    <CardTitle className="text-base text-[#173a34]">Cadastro com Comissão Flexível</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Cadastre cada profissional parceiro(a) com nome, cargo (ex: Manicure, Lash Designer), chave PIX e porcentagem de comissão (ex: 50% ou 60%). Cada profissional tem sua comissão calculada de forma individual e automática.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e] font-bold">2</div>
                    <CardTitle className="text-base text-[#173a34]">Agenda Simultânea sem Conflitos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Ao criar um agendamento, selecione qual parceiro atenderá. O sistema permite atendimentos no mesmo horário para profissionais diferentes, perfeito para estúdios com várias mesas ou macas.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c] font-bold">3</div>
                    <CardTitle className="text-base text-[#173a34]">Divisão Automática de Receita</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Você não precisa fazer contas de calculadora no fim do mês! A aba 'Extrato & Repasses' mostra exatamente o faturamento bruto gerado por cada parceiro, o valor da comissão a pagar e o quanto ficou de retenção para o estúdio.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d9] text-[#a27320] font-bold">4</div>
                    <CardTitle className="text-base text-[#173a34]">Extrato no WhatsApp em 1 Clique</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Basta tocar no botão verde 'Enviar Extrato WhatsApp'. O sistema monta uma mensagem completa com os atendimentos realizados, a soma devida e a chave PIX do parceiro para você realizar a transferência com total transparência.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 3: DICAS & PERGUNTAS */}
          <TabsContent value="dicas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f3e8] text-[#3e885c]">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">100% Direto na Sua Conta (Zero Taxas)</CardTitle>
                      <p className="text-xs text-[#82948e]">Como funciona o pagamento dos clientes?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  O MeuAutônomo <strong>NÃO é um intermediador financeiro</strong>. Não cobramos nenhuma porcentagem sobre os seus atendimentos. O cliente paga diretamente para você via PIX, dinheiro ou na sua maquininha de cartão. Você apenas registra o pagamento no sistema para alimentar seu controle.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5d2] text-[#819815]">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">Instalar no Celular como Aplicativo</CardTitle>
                      <p className="text-xs text-[#82948e]">Sem precisar de Play Store ou App Store</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  O sistema é um PWA moderno. No iPhone, abra no Safari, toque no ícone de Compartilhar e selecione <strong>'Adicionar à Tela de Início'</strong>. No Android, toque no menu de 3 pontinhos do Chrome e escolha <strong>'Instalar aplicativo'</strong>. Ele funcionará com ícone na sua tela inicial em tela cheia!
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#3f738e]">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">Recibos Formais em PDF</CardTitle>
                      <p className="text-xs text-[#82948e]">Profissionalismo para seus clientes</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  Na aba <strong>Financeiro</strong> ou ao concluir um atendimento, você pode clicar no botão <strong>Recibo</strong>. O sistema gera um comprovante oficial em PDF formatado com seus dados, CPF/CNPJ, valor por extenso e assinatura digital para você enviar direto no WhatsApp do cliente.
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border-0 bg-white shadow-[0_8px_25px_rgba(19,42,39,0.04)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d9] text-[#a27320]">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-[#173a34]">O Cliente Precisa Criar Conta?</CardTitle>
                      <p className="text-xs text-[#82948e]">Zero atrito para quem contrata você</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-[#5d756d] leading-relaxed">
                  <strong>Não!</strong> Seu cliente nunca é obrigado a cadastrar senha ou baixar aplicativos. Ele abre seu link público, vê seus serviços e faz o pedido em 20 segundos. Você recebe a notificação no painel e no WhatsApp e já tem o contato dele salvo na sua carteira de clientes.
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <GuidedTutorialModal open={modalOpen} onOpenChange={setModalOpen} defaultTab={modalTab} />
    </Page>
  );
}

function FormSelect({ label, value, onChange, options, placeholder = "Selecionar" }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  const internalValue = !value || value === "" ? "__empty__" : value;
  const normalizedOptions = options.map(opt => ({
    ...opt,
    radixValue: opt.value === "" ? "__empty__" : opt.value
  }));
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Select value={internalValue} onValueChange={val => onChange(val === "__empty__" ? "" : val)}>
        <SelectTrigger className="h-10 rounded-xl border-[#dce5dc] bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.length ? (
            normalizedOptions.map(option => (
              <SelectItem key={option.radixValue} value={option.radixValue}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              Nenhuma opção
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PublicProfile({ slug }: { slug: string }) { const query = trpc.publicProfile.bySlug.useQuery({ slug }); const create = trpc.request.createPublic.useMutation({ onSuccess: () => { toast.success("Solicitação enviada."); setSent(true); } }); const [sent, setSent] = useState(false); const [open, setOpen] = useState(false); const [form, setForm] = useState({ requesterName: "", requesterPhone: "", requesterEmail: "", serviceId: "", description: "", address: "", desiredAt: "", preferredTime: "" }); const [files, setFiles] = useState<File[]>([]); if (query.isLoading) return <LoadingScreen />; if (!query.data) return <div className="grid min-h-screen place-items-center bg-[#f5f7f2] text-[#58716b]">Profissional não encontrado.</div>; const { profile, services } = query.data; const submit = () => { if (!form.requesterName || !form.requesterPhone || !form.description) return toast.error("Preencha nome, telefone e conte o que você precisa."); Promise.all(files.map(file => new Promise<any>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, mimeType: file.type, size: file.size, dataUrl: String(reader.result) }); reader.onerror = reject; reader.readAsDataURL(file); }))).then(attachments => create.mutate({ slug, requesterName: form.requesterName, requesterPhone: form.requesterPhone, requesterEmail: form.requesterEmail || undefined, serviceId: form.serviceId ? Number(form.serviceId) : undefined, description: form.description, address: form.address || undefined, desiredAt: form.desiredAt ? new Date(form.desiredAt).toISOString() : undefined, preferredTime: form.preferredTime || undefined, attachments })); }; return <div className="min-h-screen bg-[#f5f7f2]"><header className="border-b border-[#dce5dc] bg-white"><div className="container flex h-20 sm:h-24 items-center justify-between py-2"><Link href="/" className="flex items-center py-1"><img src="/logo.png" alt="MeuAutônomo" className="h-14 sm:h-16 w-auto object-contain" /></Link><span className="text-xs font-semibold text-[#82948e] bg-[#f5f8f2] px-3 py-1.5 rounded-full border border-[#dce5dc]">Cartão profissional</span></div></header><main className="container max-w-5xl py-8 md:py-14"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><Card className="overflow-hidden rounded-[28px] border-0 bg-[#173a34] text-white shadow-[0_18px_55px_rgba(19,42,39,0.16)]"><CardContent className="p-7 sm:p-10"><div className="grid h-20 w-20 place-items-center rounded-[24px] bg-[#d9f56a] text-3xl font-bold text-[#173a34]">{profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full rounded-[24px] object-cover" /> : profile.displayName.charAt(0).toUpperCase()}</div><h1 className="mt-6 text-3xl font-bold tracking-tight">{profile.displayName}</h1><p className="mt-2 text-xl text-[#d9f56a]">{profile.professionName}</p><p className="mt-6 text-sm leading-7 text-white/70">{profile.bio || "Profissional autônomo pronto para ajudar você."}</p><div className="mt-8 space-y-3 text-sm text-white/70">{profile.serviceRegion && <p><MapPin className="mr-2 inline h-4 w-4 text-[#d9f56a]" />Atende em {profile.serviceRegion}</p>}{profile.whatsapp && <p><Share2 className="mr-2 inline h-4 w-4 text-[#d9f56a]" />{formatPhone(profile.whatsapp)}</p>}</div><Button onClick={() => setOpen(true)} className="mt-8 h-12 w-full rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e]">Solicitar serviço <ArrowRight className="ml-2 h-4 w-4" /></Button>{profile.whatsapp && <Button variant="outline" onClick={() => window.open(`https://wa.me/${profile.whatsapp?.replace(/\D/g, "")}`, "_blank")} className="mt-3 h-12 w-full rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10">Falar pelo WhatsApp</Button>}</CardContent></Card><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">Serviços</p><h2 className="mb-6 text-2xl font-bold text-[#173a34]">Como posso ajudar?</h2><div className="space-y-3">{services.length ? services.map(service => <Card key={service.id} className="rounded-[22px] border-0 bg-white shadow-[0_8px_26px_rgba(19,42,39,0.04)]"><CardContent className="flex items-center gap-4 p-5"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815]"><BriefcaseBusiness className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-[#284b42]">{service.name}</h3><p className="mt-1 text-sm text-[#82948e]">{service.description || modalityLabel[service.modality]}</p></div>{profile.showPrices && <strong className="text-[#173a34]">{money(service.priceCents)}</strong>}</CardContent></Card>) : <EmptyState icon={BriefcaseBusiness} title="Serviços em atualização" description="Entre em contato para saber mais." />}</div><p className="mt-8 text-center text-xs text-[#9aa9a3]">Ao solicitar, você não precisa criar uma conta.</p></div></div></main><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]"><DialogHeader><DialogTitle>{sent ? "Solicitação enviada" : "Solicitar serviço"}</DialogTitle><DialogDescription>{sent ? "Obrigado. O profissional recebeu seu pedido e entrará em contato." : `Conte para ${profile.displayName.split(" ")[0]} o que você precisa.`}</DialogDescription></DialogHeader>{sent ? <div className="py-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e3f3e8] text-[#3e885c]"><CheckCircle2 className="h-8 w-8" /></div><p className="mt-4 text-sm text-[#71867f]">Você já pode fechar esta janela.</p></div> : <div className="grid gap-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><Field label="Seu nome" value={form.requesterName} onChange={value => setForm({ ...form, requesterName: value })} /><Field label="WhatsApp ou telefone" value={form.requesterPhone} onChange={value => setForm({ ...form, requesterPhone: value })} /></div><Field label="E-mail (opcional)" value={form.requesterEmail} onChange={value => setForm({ ...form, requesterEmail: value })} /><FormSelect label="Serviço desejado" value={form.serviceId} onChange={value => setForm({ ...form, serviceId: value })} placeholder="Ainda não sei" options={services.map(s => ({ value: String(s.id), label: s.name }))} /><div><Label className="mb-2 block">O que você precisa?</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva o serviço, medidas, contexto…" className="min-h-28" /></div><Field label="Endereço (se necessário)" value={form.address} onChange={value => setForm({ ...form, address: value })} /><div><Label className="mb-2 block">Fotos ou anexos <span className="font-normal text-[#9bad9a]">(até 3 arquivos de 5 MB)</span></Label><Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={event => { const selected = Array.from(event.target.files || []).filter(file => file.size <= 5_000_000).slice(0, 3); setFiles(selected); }} className="rounded-xl border-[#dce5dc] bg-[#fbfcf9]" />{files.length > 0 && <p className="mt-2 text-xs text-[#82948e]"><Paperclip className="mr-1 inline h-3.5 w-3.5" />{files.length} arquivo(s) selecionado(s)</p>}</div><div className="grid gap-4 sm:grid-cols-2"><div><Label className="mb-2 block">Data desejada</Label><Input type="date" value={form.desiredAt} onChange={e => setForm({ ...form, desiredAt: e.target.value })} /></div><Field label="Horário preferencial" value={form.preferredTime} onChange={value => setForm({ ...form, preferredTime: value })} placeholder="Ex.: à tarde" /></div></div>}<DialogFooter>{!sent && <Button onClick={submit} disabled={create.isPending} className="rounded-xl bg-[#173a34] text-white"><Send className="mr-2 h-4 w-4" /> Enviar solicitação</Button>}</DialogFooter></DialogContent></Dialog></div>; }

export function PublicQuote({ token }: { token: string }) {
  const query = trpc.quote.getPublic.useQuery({ token });
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [refuseConfirmOpen, setRefuseConfirmOpen] = useState(false);
  const [changeText, setChangeText] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const respond = trpc.quote.respondPublic.useMutation({
    onSuccess: () => {
      query.refetch();
    }
  });

  if (query.isLoading) return <LoadingScreen />;
  if (!query.data) return <div className="grid min-h-screen place-items-center bg-[#f5f7f2] text-[#58716b]">Orçamento não encontrado.</div>;

  const { quote, profile, items } = query.data;

  const handleSendChangeRequest = () => {
    if (!changeText.trim()) return toast.error("Por favor, descreva o que deseja alterar.");
    respond.mutate({
      token,
      action: "alteracao_solicitada",
      changeRequestText: changeText.trim()
    }, {
      onSuccess: () => {
        setChangeModalOpen(false);
        setChangeText("");
        toast.success("Solicitação de alteração enviada ao profissional.");
      }
    });
  };

  const handleAcceptQuote = () => {
    if (!clientName.trim()) return toast.error("Informe seu nome completo.");
    if (!clientEmail.trim() || !clientEmail.includes("@")) return toast.error("Informe um e-mail válido.");
    respond.mutate({
      token,
      action: "aceito",
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim()
    }, {
      onSuccess: () => {
        setAcceptModalOpen(false);
        toast.success("Orçamento aceito com sucesso!");
      }
    });
  };

  const handleRefuseQuote = () => {
    setRefuseConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <img src="/logo.png" alt="MeuAutônomo" className="h-14 sm:h-16 w-auto object-contain" />
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#526d64] border border-[#dce5dc]">
            Proposta Digital
          </span>
        </div>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_18px_55px_rgba(19,42,39,0.08)]">
          <CardContent className="p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1eb] pb-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">Proposta de Serviço</p>
                <h1 className="mt-2 text-2xl font-bold text-[#173a34]">{profile?.displayName}</h1>
                <p className="mt-1 text-sm text-[#82948e]">{profile?.professionName}{profile?.city ? ` · ${profile.city}` : ""}</p>
              </div>
              <StatusBadge status={quote.status} />
            </div>

            {quote.description && (
              <div className="mt-6 rounded-2xl bg-[#f5f8f2] p-4 text-sm leading-6 text-[#526d64]">
                <strong className="text-[#284b42] block mb-1">Descrição dos serviços:</strong>
                {quote.description}
              </div>
            )}

            <div className="mt-7 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#82948e]">Itens orçados</p>
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f8f2] p-4">
                  <div>
                    <p className="font-semibold text-[#284b42]">{item.description}</p>
                    <p className="mt-1 text-xs text-[#82948e]">{item.quantity} × {money(item.unitPriceCents)}</p>
                  </div>
                  <strong className="text-[#173a34]">{money(item.totalCents)}</strong>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-[#edf1eb] pt-5 text-sm text-[#71867f]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(quote.subtotalCents)}</span>
              </div>
              {quote.discountCents > 0 && (
                <div className="flex justify-between text-[#8aa500]">
                  <span>Desconto aplicado</span>
                  <span>- {money(quote.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 text-xl font-bold text-[#173a34]">
                <span>Total da proposta</span>
                <span>{money(quote.totalCents)}</span>
              </div>
            </div>

            {/* Condições e Forma de Pagamento */}
            <div className="mt-6 rounded-2xl border border-[#dce5dc] bg-[#f8faf7] p-5">
              <div className="flex items-center gap-2 font-bold text-[#173a34]">
                <CreditCard className="h-5 w-5 text-[#8aa500]" />
                <span>Condições e Forma de Pagamento</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#4c6960] whitespace-pre-wrap font-medium">
                {quote.paymentTerms || "A combinar diretamente com o profissional (presencialmente na conclusão, máquina de cartão do prestador, dinheiro ou transferência)."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#627a6f]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#8aa500]"></span>
                <span>Pagamento direto ao prestador no local ou conforme acordado. Sem taxas online pela plataforma.</span>
              </div>
            </div>

            {quote.notes && (
              <div className="mt-6 rounded-2xl bg-[#fff8e7] p-4 text-sm leading-6 text-[#78673d]">
                <strong>Observações e Garantias</strong>
                <p className="mt-1">{quote.notes}</p>
              </div>
            )}

            {quote.validUntil && (
              <p className="mt-5 text-xs text-[#9aa9a3]">
                Esta proposta é válida até {new Date(quote.validUntil).toLocaleDateString("pt-BR")}.
              </p>
            )}

            {/* Aviso Jurídico de Transparência e Pagamento Direto */}
            <div className="mt-6 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-xs leading-5 text-[#64748b]">
              <div className="flex items-center gap-1.5 font-semibold text-[#334155] mb-1">
                <ShieldCheck className="h-4 w-4 text-[#3b82f6]" />
                <span>Transparência MeuAutônomo: Pagamento 100% Direto ao Profissional</span>
              </div>
              <p>
                A plataforma MeuAutônomo é uma ferramenta de tecnologia e gestão para profissionais autônomos. 
                <strong> Nós NÃO cobramos taxas ou comissões sobre os serviços, NÃO intermediamos transações financeiras e NÃO retemos o dinheiro contratado.</strong>
              </p>
              <p className="mt-1 text-[#64748b]">
                O valor total ({money(quote.totalCents)}) é pago diretamente ao prestador ({profile?.displayName}), seja presencialmente através da <strong>maquininha de cartão do próprio profissional</strong>, em dinheiro ou transferência bancária/PIX acordada entre as partes.
              </p>
            </div>

            {/* Status e Ações */}
            {quote.status === "aceito" ? (
              <div className="mt-8 rounded-2xl bg-[#e3f3e8] p-6 text-center text-[#284b42]">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#3e885c]" />
                <h3 className="text-xl font-bold text-[#173a34]">Orçamento Aceito com Sucesso!</h3>
                <p className="mt-2 text-sm leading-6 text-[#526d64]">
                  {quote.clientName ? `Obrigado, ${quote.clientName}! ` : ""}O profissional {profile?.displayName} já foi notificado da sua aprovação e entrará em contato para combinar a execução e o pagamento direto.
                </p>

                {quote.clientEmail && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-xs text-[#2b5543] border border-[#b8dfc4] shadow-sm">
                    <span className="text-base">📧</span>
                    <span>Cópia da confirmação e resumo da proposta registrados para <strong>{quote.clientEmail}</strong>.</span>
                  </div>
                )}

                {/* Resumo da Forma de Pagamento Acordada */}
                <div className="mt-6 rounded-2xl border border-[#b8dfc4] bg-white/90 p-4 text-left text-xs leading-5 text-[#2b5543]">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#173a34] mb-1">
                    <CreditCard className="h-4 w-4 text-[#2e6e4a]" />
                    <span>Como será feito o pagamento:</span>
                  </div>
                  <p className="font-medium text-[#173a34]">
                    {quote.paymentTerms || "A combinar diretamente com o profissional na entrega/conclusão."}
                  </p>
                  <p className="mt-1 text-[#526d64]">
                    Caso o acerto seja via cartão, o profissional levará sua própria máquina. Se for em dinheiro ou transferência, o pagamento é direto ao prestador no momento combinado.
                  </p>
                </div>

                {profile?.pixKey && (
                  <div className="mt-4 rounded-2xl border border-[#b8dfc4] bg-[#f0f9f3] p-5 text-left shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2e6e4a] text-white font-bold text-xs">
                          PIX
                        </div>
                        <div>
                          <h4 className="font-bold text-[#173a34]">Opção Direta via PIX (Se Combinado)</h4>
                          <p className="text-xs text-[#526d64]">
                            Chave {profile.pixKeyType ? profile.pixKeyType.toUpperCase() : "PIX"}: <strong className="font-mono text-xs text-[#173a34] bg-white px-2 py-0.5 rounded border border-[#c5e2ce]">{profile.pixKey}</strong>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(profile.pixKey || "");
                          toast.success("Chave PIX copiada! Abra o app do seu banco para pagar.");
                        }}
                        className="rounded-xl border-[#2e6e4a] bg-white font-semibold text-xs text-[#2e6e4a] hover:bg-[#e3f3e8]"
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar Chave PIX
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-white/80 px-3.5 py-2 text-xs text-[#38584f]">
                      <span>Valor desta proposta (pago 100% ao profissional):</span>
                      <strong className="text-sm font-bold text-[#173a34]">{money(quote.totalCents)}</strong>
                    </div>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-[#c5e2ce] bg-white/70 p-4 text-left">
                  <p className="text-xs font-semibold text-[#284b42]">
                    Precisa do comprovante ou precisa alterar algum item?
                  </p>
                  <p className="mt-1 text-xs text-[#627a6f]">
                    Você pode salvar uma via em PDF, solicitar ajustes ou falar diretamente com {profile?.displayName}.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="rounded-xl border-[#b3d7bf] bg-white text-xs text-[#284b42] hover:bg-[#f0f7f2]"
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> Salvar / Imprimir comprovante
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeModalOpen(true)}
                      className="rounded-xl border-[#b3d7bf] bg-white text-xs text-[#284b42] hover:bg-[#f0f7f2]"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Solicitar alteração na proposta
                    </Button>
                    {profile?.whatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const phone = profile.whatsapp?.replace(/\D/g, "");
                          const msg = encodeURIComponent(`Olá ${profile.displayName}, sobre o orçamento #${quote.id} que foi aceito: gostaria de tirar uma dúvida/solicitar um ajuste.`);
                          window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                        }}
                        className="rounded-xl border-[#b3d7bf] bg-white text-xs text-[#284b42] hover:bg-[#f0f7f2]"
                      >
                        <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#25D366]" /> Falar no WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : quote.status === "alteracao_solicitada" ? (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-950">
                <Clock3 className="mx-auto mb-3 h-9 w-9 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-900">Alteração Solicitada</h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Sua solicitação de ajuste: <span className="font-semibold italic">"{quote.changeRequest}"</span>
                </p>
                <p className="mt-2 text-xs text-amber-700">
                  O profissional ({profile?.displayName}) está revisando os detalhes e atualizará a proposta em breve aqui neste mesmo link.
                </p>
              </div>
            ) : quote.status === "recusado" ? (
              <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-950">
                <X className="mx-auto mb-2 h-8 w-8 text-rose-600" />
                <h3 className="text-lg font-bold text-rose-900">Orçamento Recusado</h3>
                <p className="mt-1 text-sm text-rose-700">Esta proposta foi marcada como recusada.</p>
              </div>
            ) : ["enviado", "rascunho"].includes(quote.status) ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => setAcceptModalOpen(true)}
                  className="h-12 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
                >
                  <Check className="mr-2 h-4 w-4" /> Aceitar orçamento
                </Button>
                <Button
                  onClick={() => setChangeModalOpen(true)}
                  variant="outline"
                  className="h-12 rounded-xl border-[#dce5dc] bg-white text-[#4c6960] hover:bg-[#f5f8f2]"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Solicitar alteração
                </Button>
                <Button
                  onClick={handleRefuseQuote}
                  variant="ghost"
                  className="h-10 text-xs text-[#9c4d43] sm:col-span-2"
                >
                  Recusar proposta
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Modal: Solicitar alteração */}
        <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg text-[#173a34]">Solicitar alteração no orçamento</DialogTitle>
              <DialogDescription>
                Informe a {profile?.displayName} o que você precisa ajustar (itens, valores, formas de pagamento ou data).
              </DialogDescription>
            </DialogHeader>
            <div className="py-3">
              <Label className="mb-2 block font-semibold text-[#284b42]">O que você gostaria de alterar?</Label>
              <Textarea
                rows={4}
                value={changeText}
                onChange={e => setChangeText(e.target.value)}
                placeholder="Ex.: Gostaria de parcelar em 3x sem juros, retirar o item 2 ou agendar para a próxima semana..."
                className="rounded-xl border-[#dce5dc]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setChangeModalOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button
                onClick={handleSendChangeRequest}
                disabled={respond.isPending}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
              >
                Enviar solicitação ao profissional
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Aceitar orçamento com Nome e E-mail */}
        <Dialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-lg text-[#173a34]">Confirmar aceite da proposta</DialogTitle>
              <DialogDescription>
                Informe seus dados para formalizar a aceitação e registrar o comprovante da proposta junto a {profile?.displayName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <Field
                label="Seu nome completo"
                value={clientName}
                onChange={setClientName}
                placeholder="Ex.: Maria Souza"
              />
              <Field
                label="Seu e-mail (para receber o comprovante)"
                value={clientEmail}
                onChange={setClientEmail}
                placeholder="exemplo@email.com"
              />
              <div className="rounded-xl bg-[#f5f8f2] p-3.5 text-xs leading-5 text-[#526d64] border border-[#dce5dc]">
                <ShieldCheck className="mr-1.5 inline h-4 w-4 text-[#8aa500]" />
                Ao confirmar o aceite, você aprova os itens e valores desta proposta. Uma via do comprovante será registrada para o seu e-mail ({clientEmail || "seu e-mail"}). O pagamento deste serviço será realizado diretamente com o profissional de acordo com as condições combinadas.
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setAcceptModalOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button
                onClick={handleAcceptQuote}
                disabled={respond.isPending}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
              >
                <Check className="mr-2 h-4 w-4" /> Confirmar e Aceitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Recusar orçamento */}
        <ConfirmModal
          open={refuseConfirmOpen}
          onOpenChange={setRefuseConfirmOpen}
          title="Recusar proposta de orçamento?"
          description={`Ao recusar, o profissional (${profile?.displayName}) será notificado. Se preferir fazer um ajuste em vez de recusar totalmente, você pode usar a opção 'Solicitar alteração'.`}
          confirmLabel="Sim, recusar proposta"
          variant="danger"
          onConfirm={() => {
            setRefuseConfirmOpen(false);
            respond.mutate({ token, action: "recusado" }, {
              onSuccess: () => toast.info("Orçamento marcado como recusado.")
            });
          }}
        />

        <p className="mt-6 text-center text-xs text-[#9aa9a3]">
          Enviado por {profile?.displayName} através da plataforma MeuAutônomo.
        </p>
      </div>
    </div>
  );
}
