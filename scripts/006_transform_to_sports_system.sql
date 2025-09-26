-- Transform services table to courts (quadras)
ALTER TABLE services RENAME TO courts;

-- Add new columns for courts
ALTER TABLE courts 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'society',
ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS photos TEXT[], 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Update existing data
UPDATE courts SET 
  category = 'society',
  price_per_hour = 50.00,
  status = 'available'
WHERE category IS NULL;

-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  modality VARCHAR(100) NOT NULL,
  format VARCHAR(50) NOT NULL, -- '1x1', '2x2', '5x5'
  rules VARCHAR(50) DEFAULT 'best_of_1', -- 'best_of_1', 'best_of_3'
  court_id UUID REFERENCES courts(id),
  scheduled_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'cancelled'
  max_players INTEGER DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create battle participants table
CREATE TABLE IF NOT EXISTS battle_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  team_name VARCHAR(100),
  joined_at TIMESTAMP DEFAULT NOW(),
  side INTEGER CHECK (side IN (1, 2)) -- team 1 or team 2
);

-- Create battle results table
CREATE TABLE IF NOT EXISTS battle_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  team1_confirmed BOOLEAN DEFAULT FALSE,
  team2_confirmed BOOLEAN DEFAULT FALSE,
  winner_side INTEGER CHECK (winner_side IN (1, 2)),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user stats table for ranking
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  ranking_points INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create court schedules table (replacing professionals)
CREATE TABLE IF NOT EXISTS court_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create reservations table (rename from bookings if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    ALTER TABLE bookings RENAME TO reservations;
  ELSE
    CREATE TABLE reservations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      court_id UUID REFERENCES courts(id),
      reservation_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      total_price DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END $$;

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID REFERENCES courts(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  fixed_price DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  days_of_week INTEGER[], -- array of days (0-6)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policies for battles (everyone can read, authenticated users can participate)
CREATE POLICY "Anyone can view battles" ON battles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create battles" ON battles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their battles" ON battles FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM battle_participants WHERE battle_id = battles.id));

-- Policies for battle participants
CREATE POLICY "Anyone can view participants" ON battle_participants FOR SELECT USING (true);
CREATE POLICY "Users can join battles" ON battle_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON battle_participants FOR UPDATE USING (auth.uid() = user_id);

-- Policies for battle results
CREATE POLICY "Anyone can view results" ON battle_results FOR SELECT USING (true);
CREATE POLICY "Participants can update results" ON battle_results FOR ALL USING (
  EXISTS (SELECT 1 FROM battle_participants WHERE battle_id = battle_results.battle_id AND user_id = auth.uid())
);

-- Policies for user stats
CREATE POLICY "Anyone can view stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

-- Policies for court schedules
CREATE POLICY "Anyone can view schedules" ON court_schedules FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage schedules" ON court_schedules FOR ALL USING (auth.role() = 'authenticated');

-- Policies for reservations
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON reservations FOR UPDATE USING (auth.uid() = user_id);

-- Policies for promotions
CREATE POLICY "Anyone can view promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage promotions" ON promotions FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO courts (name, description, category, price_per_hour, status) VALUES
('Quadra Society 1', 'Quadra de society com grama sintética', 'society', 60.00, 'available'),
('Quadra Futvôlei', 'Quadra de futvôlei na areia', 'futvolei', 40.00, 'available'),
('Quadra Tênis', 'Quadra de tênis oficial', 'tenis', 80.00, 'available');

-- Insert sample schedules (Monday to Sunday, 6AM to 10PM)
INSERT INTO court_schedules (court_id, day_of_week, start_time, end_time)
SELECT 
  c.id,
  generate_series(0, 6) as day_of_week,
  '06:00'::time as start_time,
  '22:00'::time as end_time
FROM courts c;

-- Insert sample battles
INSERT INTO battles (name, modality, format, rules, status) VALUES
('Batalha Society 2x2', 'Society', '2x2', 'best_of_1', 'waiting'),
('Torneio Futvôlei 1x1', 'Futvôlei', '1x1', 'best_of_3', 'waiting'),
('Liga Society 5x5', 'Society', '5x5', 'best_of_1', 'waiting');
