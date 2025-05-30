-- ============================================
-- XTRACK - COMPLETE SUPABASE SQL SETUP
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (User Extended Info)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  box_name TEXT,
  height_cm INTEGER,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F')),
  units_preference TEXT DEFAULT 'metric' CHECK (units_preference IN ('metric', 'imperial')),
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BENCHMARKS TABLE (CrossFit WODs/Tests)
-- ============================================
CREATE TABLE benchmarks (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'Girls', 'Heroes', 'Open', 'Strength', 'Custom'
  type TEXT NOT NULL, -- 'Time', 'Rounds', 'Reps', 'Load'
  description TEXT,
  movements JSONB, -- ["Thrusters", "Pull-ups"]
  rx_weights JSONB, -- {"M": {"Thrusters": 43}, "F": {"Thrusters": 30}}
  scaling_options TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. BENCHMARK RESULTS TABLE
-- ============================================
CREATE TABLE benchmark_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  benchmark_id BIGINT REFERENCES benchmarks ON DELETE CASCADE NOT NULL,
  result TEXT NOT NULL, -- "8:45", "18 rounds", "120kg"
  result_seconds INTEGER, -- For time-based WODs (for comparisons)
  result_numeric DECIMAL, -- For rounds/reps/weight (for comparisons)
  scale TEXT DEFAULT 'RX' CHECK (scale IN ('RX', 'RX+', 'Scaled')),
  notes TEXT,
  date DATE NOT NULL,
  is_pr BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, benchmark_id, date) -- Prevent duplicate entries same day
);

-- ============================================
-- 4. STRENGTH RECORDS TABLE
-- ============================================
CREATE TABLE strength_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  exercise TEXT NOT NULL,
  weight DECIMAL NOT NULL,
  reps INTEGER DEFAULT 1, -- 1RM, 3RM, 5RM, etc
  estimated_1rm DECIMAL, -- Calculated 1RM if reps > 1
  date DATE NOT NULL,
  notes TEXT,
  is_pr BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. BODY METRICS TABLE (Weight, Health)
-- ============================================
CREATE TABLE body_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  weight DECIMAL, -- kg
  body_fat_percent DECIMAL CHECK (body_fat_percent >= 0 AND body_fat_percent <= 100),
  muscle_mass_kg DECIMAL,
  resting_hr INTEGER CHECK (resting_hr > 0 AND resting_hr < 200),
  blood_pressure_sys INTEGER CHECK (blood_pressure_sys > 0 AND blood_pressure_sys < 300),
  blood_pressure_dia INTEGER CHECK (blood_pressure_dia > 0 AND blood_pressure_dia < 200),
  vo2_max DECIMAL CHECK (vo2_max > 0 AND vo2_max < 100),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- One entry per day
);

-- ============================================
-- 6. BODY MEASUREMENTS TABLE (Circumferences)
-- ============================================
CREATE TABLE body_measurements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  bicep_cm DECIMAL,
  chest_cm DECIMAL,
  waist_cm DECIMAL,
  hips_cm DECIMAL,
  thigh_cm DECIMAL,
  neck_cm DECIMAL,
  forearm_cm DECIMAL,
  calf_cm DECIMAL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- One measurement session per day
);

-- ============================================
-- 7. USER GOALS TABLE (Optional)
-- ============================================
CREATE TABLE user_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'weight', 'benchmark', 'strength'
  target_value TEXT NOT NULL,
  current_value TEXT,
  target_date DATE,
  achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. INSERT CROSSFIT BENCHMARKS DATA
-- ============================================

-- Girls WODs
INSERT INTO benchmarks (name, category, type, description, movements, rx_weights) VALUES
('Fran', 'Girls', 'Time', '21-15-9 Thrusters and Pull-ups', '["Thrusters", "Pull-ups"]', '{"M": {"Thrusters": 43}, "F": {"Thrusters": 30}}'),
('Helen', 'Girls', 'Time', '3 rounds: 400m Run, 21 KB Swings, 12 Pull-ups', '["Run", "Kettlebell Swings", "Pull-ups"]', '{"M": {"KB": 24}, "F": {"KB": 16}}'),
('Grace', 'Girls', 'Time', '30 Clean and Jerks for time', '["Clean and Jerk"]', '{"M": {"Clean and Jerk": 60}, "F": {"Clean and Jerk": 43}}'),
('Isabel', 'Girls', 'Time', '30 Snatches for time', '["Snatch"]', '{"M": {"Snatch": 60}, "F": {"Snatch": 43}}'),
('Annie', 'Girls', 'Time', '50-40-30-20-10 Double Unders and Sit-ups', '["Double Unders", "Sit-ups"]', '{}'),
('Eva', 'Girls', 'Time', '5 rounds: 800m Run, 30 KB Swings, 30 Pull-ups', '["Run", "Kettlebell Swings", "Pull-ups"]', '{"M": {"KB": 32}, "F": {"KB": 24}}'),
('Kelly', 'Girls', 'Time', '5 rounds: 400m Run, 30 Box Jumps, 30 Wall Balls', '["Run", "Box Jumps", "Wall Ball"]', '{"M": {"Box": 24, "Wall Ball": 9}, "F": {"Box": 20, "Wall Ball": 6}}'),
('Lauren', 'Girls', 'Time', '30-25-20-15-10-5 Ring Dips and Back Squats', '["Ring Dips", "Back Squat"]', '{"M": {"Back Squat": 60}, "F": {"Back Squat": 43}}'),
('Nancy', 'Girls', 'Time', '5 rounds: 400m Run, 15 Overhead Squats', '["Run", "Overhead Squat"]', '{"M": {"Overhead Squat": 43}, "F": {"Overhead Squat": 30}}'),
('Jackie', 'Girls', 'Time', '1000m Row, 50 Thrusters, 30 Pull-ups', '["Row", "Thrusters", "Pull-ups"]', '{"M": {"Thrusters": 20}, "F": {"Thrusters": 15}}'),
('Karen', 'Girls', 'Time', '150 Wall Balls for time', '["Wall Ball"]', '{"M": {"Wall Ball": 9}, "F": {"Wall Ball": 6}}'),
('Lynne', 'Girls', 'Rounds', 'Max rounds: Bodyweight Bench Press, Pull-ups', '["Bench Press", "Pull-ups"]', '{}'),
('Nicole', 'Girls', 'Rounds', '20min AMRAP: 400m Run, max Pull-ups', '["Run", "Pull-ups"]', '{}'),
('Elizabeth', 'Girls', 'Time', '21-15-9 Cleans and Ring Dips', '["Clean", "Ring Dips"]', '{"M": {"Clean": 60}, "F": {"Clean": 43}}'),
('Diane', 'Girls', 'Time', '21-15-9 Deadlifts and Handstand Push-ups', '["Deadlift", "Handstand Push-ups"]', '{"M": {"Deadlift": 102}, "F": {"Deadlift": 70}}'),
('Cindy', 'Girls', 'Rounds', '20min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Air Squats', '["Pull-ups", "Push-ups", "Air Squats"]', '{}'),
('Mary', 'Girls', 'Rounds', '20min AMRAP: 5 Handstand Push-ups, 10 Pistols, 15 Pull-ups', '["Handstand Push-ups", "Pistol Squats", "Pull-ups"]', '{}'),
('Erin', 'Girls', 'Time', '5 rounds: 15 Dumbbell Split Cleans, 21 Pull-ups', '["Dumbbell Split Clean", "Pull-ups"]', '{"M": {"DB": 18}, "F": {"DB": 12}}'),
('Tabatha', 'Girls', 'Rounds', '20min Tabata: Air Squats, total reps', '["Air Squats"]', '{}'),
('Amanda', 'Girls', 'Time', '9-7-5 Muscle-ups and Snatches', '["Muscle-ups", "Snatch"]', '{"M": {"Snatch": 61}, "F": {"Snatch": 43}}'),
('Chelsea', 'Girls', 'Rounds', '30min EMOM: 5 Pull-ups, 10 Push-ups, 15 Air Squats', '["Pull-ups", "Push-ups", "Air Squats"]', '{}');

-- Hero WODs (Selection of most famous)
INSERT INTO benchmarks (name, category, type, description, movements, rx_weights) VALUES
('Murph', 'Heroes', 'Time', '1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Air Squats, 1 mile Run', '["Run", "Pull-ups", "Push-ups", "Air Squats"]', '{}'),
('DT', 'Heroes', 'Time', '5 rounds: 12 Deadlifts, 9 Hang Power Cleans, 6 Push Jerks', '["Deadlift", "Hang Power Clean", "Push Jerk"]', '{"M": {"Weight": 70}, "F": {"Weight": 47.5}}'),
('Randy', 'Heroes', 'Time', '75 Snatches for time', '["Snatch"]', '{"M": {"Snatch": 34}, "F": {"Snatch": 25}}'),
('JT', 'Heroes', 'Time', '21-15-9 Handstand Push-ups, Ring Dips, Push-ups', '["Handstand Push-ups", "Ring Dips", "Push-ups"]', '{}'),
('Michael', 'Heroes', 'Time', '3 rounds: 800m Run, 50 Back Extensions, 50 Sit-ups', '["Run", "Back Extensions", "Sit-ups"]', '{}'),
('Daniel', 'Heroes', 'Time', '50 Burpees, 400m Run, 100 Push-ups, 400m Run, 150 Air Squats, 400m Run, 200 Sit-ups, 400m Run', '["Burpees", "Run", "Push-ups", "Air Squats", "Sit-ups"]', '{}'),
('Josh', 'Heroes', 'Time', '21-15-9 Overhead Squats and L Pull-ups', '["Overhead Squat", "L Pull-ups"]', '{"M": {"Overhead Squat": 43}, "F": {"Overhead Squat": 30}}'),
('Jason', 'Heroes', 'Time', '100 Squats, 5 Muscle-ups, 75 Squats, 10 Muscle-ups, 50 Squats, 15 Muscle-ups, 25 Squats, 20 Muscle-ups', '["Air Squats", "Muscle-ups"]', '{}');

-- Strength Benchmarks
INSERT INTO benchmarks (name, category, type, description, movements, rx_weights) VALUES
('Back Squat 1RM', 'Strength', 'Load', 'One Rep Max Back Squat', '["Back Squat"]', '{}'),
('Front Squat 1RM', 'Strength', 'Load', 'One Rep Max Front Squat', '["Front Squat"]', '{}'),
('Deadlift 1RM', 'Strength', 'Load', 'One Rep Max Deadlift', '["Deadlift"]', '{}'),
('Bench Press 1RM', 'Strength', 'Load', 'One Rep Max Bench Press', '["Bench Press"]', '{}'),
('Overhead Press 1RM', 'Strength', 'Load', 'One Rep Max Overhead Press', '["Overhead Press"]', '{}'),
('Clean 1RM', 'Strength', 'Load', 'One Rep Max Clean', '["Clean"]', '{}'),
('Jerk 1RM', 'Strength', 'Load', 'One Rep Max Jerk', '["Jerk"]', '{}'),
('Clean & Jerk 1RM', 'Strength', 'Load', 'One Rep Max Clean and Jerk', '["Clean and Jerk"]', '{}'),
('Snatch 1RM', 'Strength', 'Load', 'One Rep Max Snatch', '["Snatch"]', '{}');

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to calculate estimated 1RM
CREATE OR REPLACE FUNCTION calculate_estimated_1rm(weight DECIMAL, reps INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  -- Epley formula: 1RM = weight * (1 + reps/30)
  IF reps = 1 THEN
    RETURN weight;
  ELSIF reps <= 10 THEN
    RETURN ROUND(weight * (1 + reps::DECIMAL/30), 1);
  ELSE
    -- For high reps, use different formula
    RETURN ROUND(weight * (1 + reps::DECIMAL/40), 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update estimated 1RM on strength records
CREATE OR REPLACE FUNCTION update_strength_estimated_1rm()
RETURNS TRIGGER AS $$
BEGIN
  NEW.estimated_1rm = calculate_estimated_1rm(NEW.weight, NEW.reps);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate estimated 1RM
CREATE TRIGGER strength_records_estimate_1rm
  BEFORE INSERT OR UPDATE ON strength_records
  FOR EACH ROW
  EXECUTE FUNCTION update_strength_estimated_1rm();

-- Function to check and mark Personal Records
CREATE OR REPLACE FUNCTION check_personal_record()
RETURNS TRIGGER AS $$
DECLARE
  is_new_pr BOOLEAN := false;
BEGIN
  -- For strength records
  IF TG_TABLE_NAME = 'strength_records' THEN
    SELECT NEW.estimated_1rm > COALESCE(MAX(estimated_1rm), 0)
    INTO is_new_pr
    FROM strength_records 
    WHERE user_id = NEW.user_id 
      AND exercise = NEW.exercise 
      AND id != COALESCE(NEW.id, -1);
      
    NEW.is_pr = is_new_pr;
  END IF;
  
  -- For benchmark results (time-based - lower is better)
  IF TG_TABLE_NAME = 'benchmark_results' THEN
    -- Check if this benchmark is time-based
    IF EXISTS(SELECT 1 FROM benchmarks WHERE id = NEW.benchmark_id AND type = 'Time') THEN
      SELECT NEW.result_seconds < COALESCE(MIN(result_seconds), 999999)
      INTO is_new_pr
      FROM benchmark_results 
      WHERE user_id = NEW.user_id 
        AND benchmark_id = NEW.benchmark_id 
        AND id != COALESCE(NEW.id, -1)
        AND result_seconds IS NOT NULL;
    ELSE
      -- For rounds/reps - higher is better
      SELECT NEW.result_numeric > COALESCE(MAX(result_numeric), 0)
      INTO is_new_pr
      FROM benchmark_results 
      WHERE user_id = NEW.user_id 
        AND benchmark_id = NEW.benchmark_id 
        AND id != COALESCE(NEW.id, -1)
        AND result_numeric IS NOT NULL;
    END IF;
    
    NEW.is_pr = is_new_pr;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for PR detection
CREATE TRIGGER strength_records_pr_check
  BEFORE INSERT OR UPDATE ON strength_records
  FOR EACH ROW
  EXECUTE FUNCTION check_personal_record();

CREATE TRIGGER benchmark_results_pr_check
  BEFORE INSERT OR UPDATE ON benchmark_results
  FOR EACH ROW
  EXECUTE FUNCTION check_personal_record();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Benchmarks table is public (everyone can read)
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Benchmarks (public read)
CREATE POLICY "Anyone can view benchmarks" ON benchmarks FOR SELECT TO authenticated USING (true);

-- Benchmark Results
CREATE POLICY "Users can manage own benchmark results" ON benchmark_results FOR ALL USING (auth.uid() = user_id);

-- Strength Records
CREATE POLICY "Users can manage own strength records" ON strength_records FOR ALL USING (auth.uid() = user_id);

-- Body Metrics
CREATE POLICY "Users can manage own body metrics" ON body_metrics FOR ALL USING (auth.uid() = user_id);

-- Body Measurements
CREATE POLICY "Users can manage own measurements" ON body_measurements FOR ALL USING (auth.uid() = user_id);

-- User Goals
CREATE POLICY "Users can manage own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 11. INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for common queries
CREATE INDEX idx_benchmark_results_user_date ON benchmark_results(user_id, date DESC);
CREATE INDEX idx_benchmark_results_user_benchmark ON benchmark_results(user_id, benchmark_id);
CREATE INDEX idx_strength_records_user_exercise ON strength_records(user_id, exercise);
CREATE INDEX idx_strength_records_user_date ON strength_records(user_id, date DESC);
CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, date DESC);
CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, date DESC);
CREATE INDEX idx_benchmarks_category ON benchmarks(category);

-- ============================================
-- 12. HELPER VIEWS (Optional)
-- ============================================

-- View for latest user stats
CREATE OR REPLACE VIEW user_latest_stats AS
SELECT 
  p.id as user_id,
  p.name,
  p.box_name,
  bm.weight as latest_weight,
  bm.body_fat_percent,
  bm.date as weight_date,
  (SELECT COUNT(*) FROM benchmark_results br WHERE br.user_id = p.id AND br.is_pr = true) as total_prs,
  (SELECT COUNT(*) FROM strength_records sr WHERE sr.user_id = p.id AND sr.is_pr = true) as strength_prs
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM body_metrics 
  WHERE user_id = p.id 
  ORDER BY date DESC 
  LIMIT 1
) bm ON true;

-- ============================================
-- SETUP COMPLETE! 
-- ============================================

-- After running this script:
-- 1. Go to Supabase Auth settings and enable Email auth
-- 2. Set your site URL in Auth settings
-- 3. Copy your project URL and anon key for the frontend
-- 4. Users can now sign up and all tables will be auto-populated