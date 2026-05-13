CREATE TABLE routine_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'morning' CHECK (section IN ('morning','noon','night')),
  estimate_minutes INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  weekdays_mask INTEGER NOT NULL DEFAULT 127 CHECK (weekdays_mask BETWEEN 0 AND 127),
  active INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'morning' CHECK (section IN ('morning','noon','night')),
  estimate_minutes INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  scheduled_on TEXT NOT NULL,
  started_at INTEGER,
  finished_at INTEGER,
  done INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  routine_template_id INTEGER REFERENCES routine_templates(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_tasks_on_scheduled_on_section_position
  ON tasks(scheduled_on, section, position);

CREATE INDEX idx_tasks_on_routine_template_id
  ON tasks(routine_template_id);
