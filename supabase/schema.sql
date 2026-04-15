-- Vaulter (금고지기) Supabase schema v1
-- Scope: server-side non-sensitive data only
-- Sensitive financial rows remain local (.vault/.bak + IndexedDB)

create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'analysis_mode') then
    create type public.analysis_mode as enum ('student', 'single_income', 'multi_income');
  end if;
  if not exists (select 1 from pg_type where typname = 'credit_event_type') then
    create type public.credit_event_type as enum ('signup_bonus', 'charge', 'local_ai', 'cloud_ai', 'ocr_premium', 'refund', 'invite_reward', 'manual_adjust');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'ai_tier') then
    create type public.ai_tier as enum ('tier1_local_router', 'tier2_low_cost', 'tier3_high_reasoning');
  end if;
end
$$;

-- ==========================================================
-- Core domain tables mapped from src/types/schema.ts
-- ==========================================================

-- Enums for strict domain states
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tx_type') then
    create type public.tx_type as enum ('INCOME', 'EXPENSE', 'TRANSFER');
  end if;
  if not exists (select 1 from pg_type where typname = 'tx_status') then
    create type public.tx_status as enum ('PENDING', 'CONFIRMED');
  end if;
  if not exists (select 1 from pg_type where typname = 'vault_review_status') then
    create type public.vault_review_status as enum ('NEEDS_REVIEW', 'COMPLETED');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_tier') then
    create type public.user_tier as enum ('FREE', 'PRO');
  end if;
end
$$;

-- Transaction (데이터 원장)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tx_date date not null,
  amount numeric(14,2) not null,
  merchant text not null,
  category text not null default '',
  tx_type public.tx_type not null,
  ai_confidence numeric(3,2) not null default 0.0 check (ai_confidence >= 0 and ai_confidence <= 1),
  status public.tx_status not null default 'PENDING',
  is_internal boolean not null default false,
  linked_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_date on public.transactions(user_id, tx_date desc);
create index if not exists idx_transactions_user_status on public.transactions(user_id, status);

-- Goal & Budget - Goal
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  emoji text not null default '🎯',
  target_amount numeric(14,2) not null check (target_amount >= 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  deadline_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_goals_user_deadline on public.goals(user_id, deadline_date);

-- Goal & Budget - RecurringBill
create table if not exists public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(14,2) not null check (amount >= 0),
  due_date smallint not null check (due_date between 1 and 31),
  reminder_rules text[] not null default array['D-7','D-1','D-DAY']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recurring_bills_user_due_date on public.recurring_bills(user_id, due_date);

-- VaultDocument (비밀금고 파일)
create table if not exists public.vault_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_url text not null,
  upload_date timestamptz not null default now(),
  parsed_data jsonb,
  review_status public.vault_review_status not null default 'NEEDS_REVIEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vault_documents_user_upload_date on public.vault_documents(user_id, upload_date desc);

-- Optional FK link: transactions.linked_document_id -> vault_documents.id
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_linked_document_id_fkey'
  ) then
    alter table public.transactions
      add constraint transactions_linked_document_id_fkey
      foreign key (linked_document_id)
      references public.vault_documents(id)
      on delete set null;
  end if;
end
$$;

-- Auto timestamp trigger function (must exist before any trigger creation)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- updated_at triggers for new tables
drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_recurring_bills_updated_at on public.recurring_bills;
create trigger trg_recurring_bills_updated_at
before update on public.recurring_bills
for each row execute function public.set_updated_at();

drop trigger if exists trg_vault_documents_updated_at on public.vault_documents;
create trigger trg_vault_documents_updated_at
before update on public.vault_documents
for each row execute function public.set_updated_at();

-- RLS for new core tables
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.recurring_bills enable row level security;
alter table public.vault_documents enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'transactions' and policyname = 'transactions_owner_all') then
    create policy transactions_owner_all on public.transactions
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'goals' and policyname = 'goals_owner_all') then
    create policy goals_owner_all on public.goals
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'recurring_bills' and policyname = 'recurring_bills_owner_all') then
    create policy recurring_bills_owner_all on public.recurring_bills
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'vault_documents' and policyname = 'vault_documents_owner_all') then
    create policy vault_documents_owner_all on public.vault_documents
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end
$$;

-- User profile
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  nickname text,
  analysis_mode public.analysis_mode not null default 'single_income',
  tier public.user_tier not null default 'FREE',
  locale text not null default 'ko-KR',
  timezone text not null default 'Asia/Seoul',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User credit balance (single row per user)
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12,1) not null default 0.0,
  updated_at timestamptz not null default now(),
  check (balance >= 0)
);

-- Credit ledger
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type public.credit_event_type not null,
  amount numeric(12,1) not null, -- + recharge / - usage
  balance_after numeric(12,1) not null,
  description text,
  source_ref text, -- payment id, ai request id, invite code etc.
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_ledger_user_created_at on public.credit_ledger(user_id, created_at desc);

-- Payments (Toss)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'toss',
  provider_payment_id text unique,
  amount_krw integer not null check (amount_krw > 0),
  credited_amount numeric(12,1) not null check (credited_amount > 0),
  status public.payment_status not null default 'pending',
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_payments_user_requested_at on public.payments(user_id, requested_at desc);

-- Device links for "single-device principle" UX
create table if not exists public.device_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_fingerprint text not null,
  label text, -- e.g., "Merlin-PC"
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, device_fingerprint)
);

-- Non-sensitive vault manifest index (no raw transaction data)
create table if not exists public.vault_manifests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_vault_id text not null, -- local generated id
  manifest_version integer not null default 1,
  file_hash text, -- optional checksum for sync hints
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_vault_id)
);

-- AI usage logs (for cost control + observability)
create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier public.ai_tier not null,
  prompt_kind text not null, -- route/search/parse/advice
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  latency_ms integer,
  credit_charged numeric(12,1) not null default 0.0,
  success boolean not null default true,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_ai_requests_user_created_at on public.ai_requests(user_id, created_at desc);

-- Invite loop
create table if not exists public.invite_codes (
  code text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  reward_credit numeric(12,1) not null default 10.0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.invite_claims (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.invite_codes(code) on delete cascade,
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  invitee_user_id uuid not null references auth.users(id) on delete cascade,
  rewarded_at timestamptz not null default now(),
  unique (code, invitee_user_id)
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_vault_manifests_updated_at on public.vault_manifests;
create trigger trg_vault_manifests_updated_at
before update on public.vault_manifests
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.payments enable row level security;
alter table public.device_links enable row level security;
alter table public.vault_manifests enable row level security;
alter table public.ai_requests enable row level security;
alter table public.invite_codes enable row level security;
alter table public.invite_claims enable row level security;

-- User-owned read/write policies
do $$
begin
  -- profiles
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'profiles_owner_all') then
    create policy profiles_owner_all on public.profiles
      for all using (id = auth.uid()) with check (id = auth.uid());
  end if;

  -- user_credits
  if not exists (select 1 from pg_policies where tablename = 'user_credits' and policyname = 'credits_owner_read') then
    create policy credits_owner_read on public.user_credits
      for select using (user_id = auth.uid());
  end if;

  -- credit_ledger
  if not exists (select 1 from pg_policies where tablename = 'credit_ledger' and policyname = 'credit_ledger_owner_read') then
    create policy credit_ledger_owner_read on public.credit_ledger
      for select using (user_id = auth.uid());
  end if;

  -- payments
  if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'payments_owner_read') then
    create policy payments_owner_read on public.payments
      for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'payments_owner_insert') then
    create policy payments_owner_insert on public.payments
      for insert with check (user_id = auth.uid());
  end if;

  -- device_links
  if not exists (select 1 from pg_policies where tablename = 'device_links' and policyname = 'device_links_owner_all') then
    create policy device_links_owner_all on public.device_links
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  -- vault_manifests
  if not exists (select 1 from pg_policies where tablename = 'vault_manifests' and policyname = 'vault_manifests_owner_all') then
    create policy vault_manifests_owner_all on public.vault_manifests
      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  -- ai_requests
  if not exists (select 1 from pg_policies where tablename = 'ai_requests' and policyname = 'ai_requests_owner_read') then
    create policy ai_requests_owner_read on public.ai_requests
      for select using (user_id = auth.uid());
  end if;

  -- invite tables
  if not exists (select 1 from pg_policies where tablename = 'invite_codes' and policyname = 'invite_codes_owner_all') then
    create policy invite_codes_owner_all on public.invite_codes
      for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'invite_claims' and policyname = 'invite_claims_related_read') then
    create policy invite_claims_related_read on public.invite_claims
      for select using (inviter_user_id = auth.uid() or invitee_user_id = auth.uid());
  end if;
end
$$;

