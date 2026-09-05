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

// Administrador Oficial Padrão Global do Sistema
const DEFAULT_GLOBAL_ADMIN: AdminRecord = {
  exists: true,
  nome: 'Tamara Produções (Administrador)',
  email: 'maramaragomes00@gmail.com',
  senhaHash: 'e1659dde6d1bb21567e3cb15f90e992f4e9372fd696c821f263de1ed32ea3ef2', // SHA-256 de Tamara@2026!
  telefone: '(85) 99867-2404',
  twoFactorEnabled: false,
  twoFactorChannel: 'email',
  updatedAt: new Date().toISOString(),
};

// Armazenamento em memória persistente do processo
let inMemoryRecord: AdminRecord = { ...DEFAULT_GLOBAL_ADMIN };

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

export async function getAdminRecord(): Promise<AdminRecord> {
  // 1. Tentar Supabase se configurado
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('empresa')
        .select('admin_email, admin_senha_hash, admin_configured, two_factor_enabled, two_factor_channel, admin_nome, admin_telefone, updated_at')
        .limit(1)
        .maybeSingle();

      if (!error && data && data.admin_senha_hash) {
        return {
          exists: true,
          nome: data.admin_nome || inMemoryRecord.nome,
          email: data.admin_email || inMemoryRecord.email,
          senhaHash: data.admin_senha_hash,
          telefone: data.admin_telefone || inMemoryRecord.telefone,
          twoFactorEnabled: Boolean(data.two_factor_enabled),
          twoFactorChannel: data.two_factor_channel || 'email',
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    } catch {
      // Prossegue para o registro padrão
    }
  }

  return inMemoryRecord;
}

export async function saveAdminRecord(record: AdminRecord): Promise<boolean> {
  inMemoryRecord = { ...record };

  // Salvar no Supabase se configurado
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto.supabase.co')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
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
    } catch {
      // Prossegue
    }
  }

  return true;
}
