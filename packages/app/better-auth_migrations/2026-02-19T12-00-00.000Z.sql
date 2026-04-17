-- Team entity: owns the subscription and Turso database
create table "team" (
  "id" text not null primary key,
  "name" text not null,
  "ownerId" text not null references "user" ("id") on delete cascade,
  "plan" text not null default 'FREE',
  "stripeCustomerId" text,
  "stripeSubscriptionId" text,
  "tursoDbUrl" text,
  "tursoAuthToken" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create unique index "team_ownerId_idx" on "team" ("ownerId");
create index "team_stripeCustomerId_idx" on "team" ("stripeCustomerId");

-- Link users to teams
create table "team_member" (
  "id" text not null primary key,
  "teamId" text not null references "team" ("id") on delete cascade,
  "userId" text not null references "user" ("id") on delete cascade,
  "role" text not null default 'member',
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  unique ("teamId", "userId")
);

create index "team_member_userId_idx" on "team_member" ("userId");

-- Migrate existing user data into teams (one team per existing owner)
insert into "team" ("id", "name", "ownerId", "plan", "stripeCustomerId", "stripeSubscriptionId", "tursoDbUrl", "tursoAuthToken", "createdAt", "updatedAt")
select
  gen_random_uuid()::text,
  u."name" || '''s Team',
  u."id",
  coalesce(u."plan", 'FREE'),
  u."stripeCustomerId",
  u."stripeSubscriptionId",
  u."tursoDbUrl",
  u."tursoAuthToken",
  u."createdAt",
  u."updatedAt"
from "user" u
on conflict do nothing;

-- Add every existing user as owner-member of their own team
insert into "team_member" ("id", "teamId", "userId", "role")
select gen_random_uuid()::text, t."id", t."ownerId", 'owner'
from "team" t
on conflict do nothing;

-- Link existing accepted invites into team_member
insert into "team_member" ("id", "teamId", "userId", "role")
select
  gen_random_uuid()::text,
  t."id",
  ti."acceptedUserId",
  'member'
from "team_invite" ti
join "team" t on t."ownerId" = ti."ownerId"
where ti."status" = 'accepted' and ti."acceptedUserId" is not null
on conflict do nothing;

-- Point team_invite to teamId instead of ownerId for future use
alter table "team_invite" add column if not exists "teamId" text references "team" ("id") on delete cascade;

-- Backfill teamId on existing invites
update "team_invite" ti
set "teamId" = t."id"
from "team" t
where t."ownerId" = ti."ownerId";
