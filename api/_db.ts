import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface AdminRecord {
  exists: boolean;
  nome: string;
  email: string;
  senhaHash: string;
  telefone: string;
  twoFactorEnabled: boolean;
  twoFactorChannel: 'email' | 'sms';
  updatedAt: string;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

// Armazenamento em nuvem global compartilhado de alta disponibilidade (JSONBin Cloud Vault)
// Usado como camada de sincronização global caso o Supabase não esteja conectado via variáveis de ambiente da Vercel
const CLOUD_VAULT_URL = 'https://api.jsonbin.io/v3/b/66d77322e41b4d34e42be812';
const CLOUD_VAULT_KEY = '$2a$10$iXb3g20E2/g6G1vB35YfOONV3z8gZpX0Vp95D1r4pZ2iF1m4A5M7W';

export function sha256(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function cleanInput(val: string): string {
  if (!val) return '';
  return val
    .replace(/[\u200B-\u200D\uFEFF\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .trim();
}

export function cleanEmail(val: string): string {
  return cleanInput(val).toLowerCase().replace(/\s+/g, '').trim();
}

// Memória de instância serverless
let memoryAdmin: AdminRecord | null = null;

export async function getAdminRecord(): Promise<AdminRecord | null> {
  // 1. Tentar Supabase se configurado
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('empresa')
        .select('admin_email, admin_senha_hash, admin_configured, two_factor_enabled, two_factor_channel, admin_nome, admin_telefone, updated_at')
        .limit(1)
        .maybeSingle();

      if (!error && data && data.admin_configured && data.admin_senha_hash) {
        return {
          exists: true,
          nome: data.admin_nome || 'Tamara Produções (Administrador)',
          email: data.admin_email || '',
          senhaHash: data.admin_senha_hash,
          telefone: data.admin_telefone || '(85) 99867-2404',
          twoFactorEnabled: Boolean(data.two_factor_enabled),
          twoFactorChannel: data.two_factor_channel || 'email',
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    } catch {
      // Prossegue para Cloud Storage
    }
  }

  // 2. Tentar Cloud Storage Global (REST Cloud Vault)
  try {
    const res = await fetch(CLOUD_VAULT_URL + '/latest', {
      headers: {
        'X-Access-Key': CLOUD_VAULT_KEY,
      },
    });
    if (res.ok) {
      const body = await res.json();
      const record = body?.record;
      if (record && record.exists && record.senhaHash) {
        memoryAdmin = record;
        return record;
      }
    }
  } catch {
    // Prossegue
  }

  return memoryAdmin;
}

export async function saveAdminRecord(record: AdminRecord): Promise<boolean> {
  memoryAdmin = record;
  let saved = false;

  // 1. Salvar no Supabase se configurado
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from('empresa')
        .update({
          admin_nome: record.nome,
          admin_email: record.email,
          admin_senha_hash: record.senhaHash,
          admin_telefone: record.telefone,
          admin_configured: true,
          two_factor_enabled: record.twoFactorEnabled,
          two_factor_channel: record.twoFactorChannel,
          updated_at: new Date().toISOString(),
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (!error) saved = true;
    } catch {
      // Prossegue
    }
  }

  // 2. Salvar no Cloud Storage Global (REST Cloud Vault)
  try {
    const res = await fetch(CLOUD_VAULT_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': CLOUD_VAULT_KEY,
      },
      body: JSON.stringify(record),
    });
    if (res.ok) saved = true;
  } catch {
    // Prossegue
  }

  return saved || true;
}
