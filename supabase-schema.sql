-- 在 Supabase SQL Editor 中执行以下 SQL

-- 创建 tasks 表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新任务',
  importance INTEGER NOT NULL DEFAULT 50,
  is_important BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0,
  hue INTEGER NOT NULL DEFAULT 200,
  content JSONB NOT NULL DEFAULT '{"type":"text","text":""}',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at BIGINT NOT NULL DEFAULT 0
);

-- 按用户查询索引
CREATE INDEX tasks_user_id_idx ON tasks(user_id);

-- 启用 RLS（行级安全）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 用户只能读写自己的任务
CREATE POLICY "Users can read own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- 启用 Realtime（同步功能）
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
