-- Repair: ensure every accepted invite has a corresponding team_member row
-- This handles cases where users signed up before the team architecture was in place
insert into "team_member" ("id", "teamId", "userId", "role")
select
  gen_random_uuid()::text,
  ti."teamId",
  ti."acceptedUserId",
  'member'
from "team_invite" ti
where
  ti."status" = 'accepted'
  and ti."acceptedUserId" is not null
  and ti."teamId" is not null
on conflict ("teamId", "userId") do nothing;

-- Also repair: any user who has no team_member row at all should get a personal team
-- (covers edge cases where databaseHook failed silently)
insert into "team" ("id", "name", "ownerId", "plan", "createdAt", "updatedAt")
select
  gen_random_uuid()::text,
  u."name" || '''s Team',
  u."id",
  'FREE',
  now(),
  now()
from "user" u
where not exists (
  select 1 from "team_member" tm where tm."userId" = u."id"
)
on conflict do nothing;

insert into "team_member" ("id", "teamId", "userId", "role")
select
  gen_random_uuid()::text,
  t."id",
  t."ownerId",
  'owner'
from "team" t
where not exists (
  select 1 from "team_member" tm where tm."userId" = t."ownerId"
)
on conflict ("teamId", "userId") do nothing;
