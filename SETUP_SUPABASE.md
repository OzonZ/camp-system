# Guild Camp System - Supabase Setup Guide

## Required Tables

Run the following SQL queries in your Supabase dashboard to create the required tables:

### 1. Guilds Table
```sql
CREATE TABLE guilds (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Unity', 'Roblox', 'WebApp'
  description TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Members Table
```sql
CREATE TABLE members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'leader' or 'member'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_members_guild ON members(guild_id);
```

### 3. Teams (Groups) Table
```sql
CREATE TABLE teams (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Unity', 'Roblox', 'WebApp'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_guild ON teams(guild_id);
```

### 4. Team Members Table
```sql
CREATE TABLE team_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
```

### 5. Quests Table
```sql
CREATE TABLE quests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '⚔️',
  points INT DEFAULT 50,
  guild_id BIGINT REFERENCES guilds(id) ON DELETE CASCADE, -- NULL = all guilds
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quests_guild ON quests(guild_id);
```

### 6. Guild Quests Progress Table
```sql
CREATE TABLE guild_quests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  quest_id BIGINT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  progress INT DEFAULT 0, -- 0-100
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guild_quests ON guild_quests(guild_id, quest_id);
```

### 7. Cards Table
```sql
CREATE TABLE cards (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  icon TEXT NOT NULL,
  name TEXT NOT NULL,
  effect TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Guild Cards Table
```sql
CREATE TABLE guild_cards (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guild_cards ON guild_cards(guild_id);
```

### 9. Competitions Table
```sql
CREATE TABLE competitions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Competition Participants Table
```sql
CREATE TABLE competition_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  guild_id BIGINT NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  guild_name TEXT NOT NULL,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comp_participants ON competition_participants(competition_id);
```

### 11. Activity Log Table
```sql
CREATE TABLE activity_log (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  actor_name TEXT NOT NULL,
  description TEXT NOT NULL,
  action_type TEXT, -- 'create_guild', 'join_guild', 'use_card', etc.
  guild_id BIGINT REFERENCES guilds(id) ON DELETE CASCADE,
  extra_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

## Initial Card Setup

Insert preset cards:
```sql
INSERT INTO cards (icon, name, effect) VALUES
  ('⚔️', 'แรงปาฐาน', '+30 point สำหรับกิลด์'),
  ('🛡️', 'โล่ป้องกัน', 'ป้องกัน -20 point'),
  ('✨', 'เวทมนตร์ทำให้บวช', 'คูณแต้ม x1.5'),
  ('💎', 'ทอพเพนเดิยม', '+50 point'),
  ('🔥', 'ไฟประลัยพิษ', '-15 point ให้อีกกิลด์'),
  ('🌙', 'พื้นพลังจันทร์', 'คืนสมาชิก 1 เควส');
```

## Row Level Security (Optional but Recommended)

Enable RLS on sensitive tables:
```sql
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_cards ENABLE ROW LEVEL SECURITY;
```

## Connection String

Use the Supabase URL and API key already configured in the HTML file.
