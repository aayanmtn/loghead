create table "team_invite" (
  "id" text not null primary key,
  "ownerId" text not null references "user" ("id") on delete cascade,
  "email" text not null,
  "name" text not null,
  "status" text not null default 'pending',
  "acceptedUserId" text references "user" ("id") on delete set null,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null
);

create index "team_invite_ownerId_idx" on "team_invite" ("ownerId");
