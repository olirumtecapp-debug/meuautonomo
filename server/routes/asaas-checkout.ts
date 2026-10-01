import { Request, Response } from "express";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";

const ASAAS_API_URL = "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

const PLAN_CONFIG = {
  solo: { value: 49.9, description: "MeuAutônomo PRO Solo – Acesso Vitalício" },
  team: { value: 89.9, description: "MeuAutônomo PRO Equipe – Acesso Vitalício" },
} as const;

async function asaasRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.errors?.[0]?.description || data?.message || `Asaas ${res.status}`
    );
  }
  return data;
}

async function getOrCreateAsaasCustomer(
  email: string,
  name: string,
  cpfCnpj?: string
): Promise<string> {
  const cleanCpf = cpfCnpj ? cpfCnpj.replace(/\D/g, "") : undefined;

  // Busca cliente existente pelo e-mail
  const searchData = await asaasRequest(
    `/customers?email=${encodeURIComponent(email)}&limit=1`,
    "GET"
  );
  if (searchData?.data?.length > 0) {
    const existing = searchData.data[0];
    // Se o cliente existe mas ainda não tinha CPF e recebemos agora, atualiza no Asaas
    if (cleanCpf && (!existing.cpfCnpj || existing.cpfCnpj !== cleanCpf)) {
      try {
        await asaasRequest(`/customers/${existing.id}`, "POST", {
          cpfCnpj: cleanCpf,
        });
      } catch (e: any) {
        console.warn("[Asaas] Aviso ao atualizar CPF do cliente existente:", e?.message);
      }
    }
    return existing.id as string;
  }

  // Cria novo cliente no Asaas
  const createPayload: any = {
    name: name || "Cliente MeuAutônomo",
    email,
    notificationDisabled: false,
  };
  if (cleanCpf) {
    createPayload.cpfCnpj = cleanCpf;
  }

  const created = await asaasRequest("/customers", "POST", createPayload);
  return created.id as string;
}

/**
 * POST /api/asaas/create-pix
 * Body: { plan: "solo" | "team", cpf?: string }
 * Autenticação via cookie de sessão (padrão do projeto)
 * Retorna: { encodedImage, payload, invoiceUrl, paymentId }
 */
export async function createPixPayment(req: Request, res: Response) {
  try {
    const plan = req.body?.plan as "solo" | "team";
    const rawCpf = (req.body?.cpf as string) || "";
    const cleanCpf = rawCpf.replace(/\D/g, "");

    if (!plan || !PLAN_CONFIG[plan]) {
      return res.status(400).json({ error: "Plano inválido. Use 'solo' ou 'team'." });
    }

    if (!cleanCpf || (cleanCpf.length !== 11 && cleanCpf.length !== 14)) {
      return res.status(400).json({
        error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para registrar a cobrança PIX.",
      });
    }

    if (!ASAAS_API_KEY) {
      return res.status(500).json({ error: "Chave do Asaas não configurada no servidor." });
    }

    // Autentica o usuário pelo cookie de sessão (mesmo padrão do tRPC)
    let authUser: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
    try {
      authUser = await sdk.authenticateRequest(req as any);
    } catch {
      return res.status(401).json({ error: "Sessão inválida. Faça login novamente." });
    }

    const db = await getDb();

    // Busca dados do usuário no banco para ter email e nome
    const userRows = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!userRows.length || !userRows[0].email) {
      return res.status(404).json({ error: "Usuário não encontrado ou sem e-mail cadastrado." });
    }
    const user = userRows[0];

    // Busca ou cria cliente no Asaas com CPF/CNPJ
    const asaasCustomerId = await getOrCreateAsaasCustomer(
      user.email!,
      user.name || user.email!,
      cleanCpf
    );

    // Data de vencimento = amanhã (PIX expira em 24h)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Cria cobrança PIX
    const config = PLAN_CONFIG[plan];
    const payment = await asaasRequest("/payments", "POST", {
      customer: asaasCustomerId,
      billingType: "PIX",
      value: config.value,
      dueDate: dueDateStr,
      description: config.description,
      externalReference: String(user.id), // crítico: identifica o usuário no webhook
    });

    // Busca QR Code em base64 + payload Copia e Cola
    const pixData = await asaasRequest(
      `/payments/${payment.id}/pixQrCode`,
      "GET"
    );

    return res.status(200).json({
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      encodedImage: pixData.encodedImage,   // base64 da imagem do QR Code
      payload: pixData.payload,             // código Copia e Cola PIX
      expirationDate: pixData.expirationDate,
    });
  } catch (error: any) {
    console.error("[Asaas CreatePix Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao gerar cobrança PIX." });
  }
}

/**
 * GET /api/asaas/payment-status/:paymentId
 * Verifica se o pagamento foi confirmado (polling)
 */
export async function getPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId obrigatório." });
    }

    if (!ASAAS_API_KEY) {
      return res.status(500).json({ error: "Chave do Asaas não configurada." });
    }

    const payment = await asaasRequest(`/payments/${paymentId}`, "GET");

    const confirmed =
      payment.status === "RECEIVED" ||
      payment.status === "CONFIRMED" ||
      payment.status === "AVAILABLE";

    return res.status(200).json({
      status: payment.status,
      confirmed,
      value: payment.value,
    });
  } catch (error: any) {
    console.error("[Asaas PaymentStatus Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao consultar pagamento." });
  }
}
