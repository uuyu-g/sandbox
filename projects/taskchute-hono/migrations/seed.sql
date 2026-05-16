-- Manual-run seed; not registered with wrangler migrations.
-- weekdays_mask: bit 0 = Sunday ... bit 6 = Saturday
-- 62 = 0b0111110 = Mon-Fri, 127 = all days.

INSERT INTO routine_templates
  (title, section, estimate_minutes, position, weekdays_mask, active, note, created_at, updated_at)
VALUES
  ('朝のストレッチ', 'morning', 10, 0, 62, 1, NULL, unixepoch() * 1000, unixepoch() * 1000),
  ('日報を書く',     'night',   10, 0, 62, 1, NULL, unixepoch() * 1000, unixepoch() * 1000),
  ('部屋の片付け',   'night',   15, 1, 127, 1, NULL, unixepoch() * 1000, unixepoch() * 1000);
