import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  professionalProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

import { getMockDb } from "./mockDb";

let _db: ReturnType<typeof drizzle> | any = null;

export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (process.env.DATABASE_URL) {
    if (!_db || _db.__isMock) {
      try {
        _db = drizzle(process.env.DATABASE_URL);
      } catch (error) {
        console.warn("[Database] Failed to connect to DATABASE_URL:", error);
        _db = getMockDb();
      }
    }
    return _db;
  }

  // Modo de Teste Local Demonstrativo
  if (!_db) {
    console.log("=============================================================================");
    console.log("⚠️ MODO DEMONSTRAÇÃO ATIVO (Sem DATABASE_URL)");
    console.log("👉 Usando dados de teste simulados em memória para desenvolvimento.");
    console.log("📌 LEMBRETE: Para conectar ao banco oficial de produção, defina a variável");
    console.log("   DATABASE_URL=mysql://USER:PASSWORD@HOST/DATABASE no seu arquivo .env");
    console.log("=============================================================================");
    _db = getMockDb();
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users);
  return result;
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return result[0];
}

export async function getProfileById(profileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.id, profileId))
    .limit(1);
  return result[0];
}

export async function getProfileBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.slug, slug))
    .limit(1);
  return result[0];
}

export async function createNotification(profileId: number, title: string, body: string, type: string) {
  const db = await getDb();
  if (!db) return;
  const { notifications } = await import("../drizzle/schema");
  await db.insert(notifications).values({ profileId, title, body, type });
}

export async function getUnreadNotificationCount(profileId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { notifications } = await import("../drizzle/schema");
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.profileId, profileId), eq(notifications.read, false)));
  return rows.length;
}

export async function getRecentNotifications(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const { notifications } = await import("../drizzle/schema");
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profileId))
    .orderBy(desc(notifications.createdAt))
    .limit(8);
}
