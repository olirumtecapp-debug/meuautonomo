import { describe, expect, it, vi } from "vitest";
import { checkServiceSpelling } from "../client/src/utils/serviceSpellcheck";
import type { TrpcContext } from "./_core/context";

const dbState = {
  inserts: [] as unknown[],
  updates: [] as unknown[],
};

const profile = {
  id: 7,
  userId: 11,
  slug: "ana-eletrica",
  displayName: "Ana Elétrica",
  professionName: "Eletricista",
  showPrices: true,
  bookingEnabled: true,
};

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => {
      const query: any = {
        where: () => query,
        orderBy: () => query,
        limit: async () => [],
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve([]).then(resolve, reject),
      };
      return { from: () => query };
    },
    insert: () => ({
      values: async (values: unknown) => {
        dbState.inserts.push(values);
        return [{ insertId: dbState.inserts.length }];
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        dbState.updates.push(values);
        return {
          where: async () => [{ affectedRows: 1 }],
        };
      },
    }),
  })),
  getProfileByUserId: vi.fn(async () => profile),
  getProfileBySlug: vi.fn(async () => profile),
  createNotification: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async (_key: string, _body: Buffer, mimeType: string) => ({
    url: `https://storage.test/file.${mimeType.split("/")[1]}`,
  })),
}));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 11,
      openId: "integration-user",
      name: "Ana Elétrica",
      email: "ana@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("Simulação Completa do Sistema MeuAutônomo", () => {
  it("Simulação 1: Correção ortográfica de termos de serviços e diagnósticos", () => {
    const tests = [
      { input: "analises", expected: "Análises" },
      { input: "analises clinicas", expected: "Análises clínicas" },
      { input: "diagnostico", expected: "Diagnóstico" },
      { input: "avaliacao", expected: "Avaliação" },
      { input: "relatorio", expected: "Relatório" },
      { input: "sessao", expected: "Sessão" },
      { input: "eletrecista", expected: "Eletricista" },
    ];

    for (const test of tests) {
      const result = checkServiceSpelling(test.input);
      expect(result.hasCorrection).toBe(true);
      expect(result.correctedText).toBe(test.expected);
    }
  });

  it("Simulação 2: Cliente envia solicitação de orçamento pela página pública", async () => {
    const caller = appRouter.createCaller(createContext());
    const res = await caller.request.createPublic({
      slug: profile.slug,
      requesterName: "Carlos Cliente",
      requesterPhone: "11988887777",
      description: "Preciso de um laudo técnico para instalação elétrica residencial.",
    });

    expect(res).toMatchObject({ success: true });
  });

  it("Simulação 3: Autônomo monta orçamento com itens e envia para o cliente", async () => {
    const caller = appRouter.createCaller(createContext());
    const quote = await caller.quote.create({
      description: "Orçamento de Laudo e Diagnóstico Elétrico",
      discountCents: 2000,
      sendNow: true,
      items: [
        { description: "Visita e Diagnóstico", quantity: 1, unitPriceCents: 15000 },
        { description: "Elaboração de Relatório Técnico", quantity: 1, unitPriceCents: 20000 },
      ],
    });

    expect(quote).toMatchObject({ success: true, quoteId: expect.any(Number) });
  });

  it("Simulação 4: Validação dos planos Asaas PIX oficiais (Solo e Team)", async () => {
    const plansConfig = await import("./routes/asaas-plans-config.json");
    expect(plansConfig.default.solo).toBeDefined();
    expect(plansConfig.default.solo.paymentId).toBe("pay_zhlfko0mdc480t69");

    expect(plansConfig.default.team).toBeDefined();
    expect(plansConfig.default.team.paymentId).toBe("pay_44zhds3co79fyqe4");
  });

  it("Simulação 5: Verificação de ausência de contas fictícias no banco", async () => {
    const fs = await import("fs");
    if (fs.existsSync("server/data/db-store.json")) {
      const data = JSON.parse(fs.readFileSync("server/data/db-store.json", "utf8"));
      const fakeAdmin = data.users.find(
        (u: any) => u.email === "admin@meuautonomo.com.br" || u.name === "Administrador Geral"
      );
      expect(fakeAdmin).toBeUndefined();
    }
  });
});
