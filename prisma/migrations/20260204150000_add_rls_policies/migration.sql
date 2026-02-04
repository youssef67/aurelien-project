-- Enable Row Level Security on tables
-- This migration must be applied after the tables are created

-- Enable RLS on suppliers table
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stores table
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;

-- Policies for suppliers table
CREATE POLICY "Users can view own supplier profile" ON "suppliers"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own supplier profile" ON "suppliers"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own supplier profile" ON "suppliers"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for stores table
CREATE POLICY "Users can view own store profile" ON "stores"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own store profile" ON "stores"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own store profile" ON "stores"
  FOR INSERT WITH CHECK (auth.uid() = id);
