-- ============================================
-- XTRACK CARDIO ACTIVITIES - DATABASE MIGRATION
-- ============================================

-- ============================================
-- CARDIO ACTIVITIES TABLE
-- ============================================
CREATE TABLE cardio_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('run', 'bike', 'rower', 'skierg', 'assault_bike', 'echo_bike', 'air_bike', 'swim', 'other')),
  name TEXT, -- Custom activity name
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  distance_km DECIMAL CHECK (distance_km > 0),
  elevation_gain_m INTEGER CHECK (elevation_gain_m >= 0),
  avg_heart_rate INTEGER CHECK (avg_heart_rate > 0 AND avg_heart_rate < 250),
  max_heart_rate INTEGER CHECK (max_heart_rate > 0 AND max_heart_rate < 250),  avg_power_watts INTEGER CHECK (avg_power_watts > 0), -- For cycling/rower
  avg_pace_per_km INTERVAL, -- For running (e.g., '00:04:30' for 4:30/km)
  avg_pace_per_500m INTERVAL, -- For rowing/skiing (e.g., '00:01:45' for 1:45/500m)
  stroke_rate INTEGER CHECK (stroke_rate > 0 AND stroke_rate < 60), -- For rower/skierg (strokes per minute)
  calories_burned INTEGER CHECK (calories_burned > 0),
  total_calories INTEGER CHECK (total_calories > 0), -- Total calories displayed on machine
  strava_activity_id BIGINT, -- For future Strava integration
  strava_imported BOOLEAN DEFAULT false,
  notes TEXT,
  is_pr BOOLEAN DEFAULT false, -- Personal record flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_cardio_activities_user_date ON cardio_activities(user_id, date DESC);
CREATE INDEX idx_cardio_activities_user_type ON cardio_activities(user_id, activity_type);
CREATE INDEX idx_cardio_activities_strava ON cardio_activities(strava_activity_id) WHERE strava_activity_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE cardio_activities ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own cardio activities
CREATE POLICY "Users can manage own cardio activities" ON cardio_activities FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to check and mark Personal Records for cardio
CREATE OR REPLACE FUNCTION check_cardio_personal_record()
RETURNS TRIGGER AS $$
DECLARE
  is_new_pr BOOLEAN := false;
BEGIN
  -- Check for distance PR (longest distance for this activity type)
  IF NEW.distance_km IS NOT NULL THEN
    SELECT NEW.distance_km > COALESCE(MAX(distance_km), 0)
    INTO is_new_pr
    FROM cardio_activities 
    WHERE user_id = NEW.user_id 
      AND activity_type = NEW.activity_type 
      AND id != COALESCE(NEW.id, -1)
      AND distance_km IS NOT NULL;
  END IF;
  
  -- If not a distance PR, check for duration PR (longest duration for this activity type)
  IF NOT is_new_pr THEN
    SELECT NEW.duration_minutes > COALESCE(MAX(duration_minutes), 0)
    INTO is_new_pr
    FROM cardio_activities 
    WHERE user_id = NEW.user_id 
      AND activity_type = NEW.activity_type 
      AND id != COALESCE(NEW.id, -1);
  END IF;
  
  NEW.is_pr = is_new_pr;
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cardio PR detection
CREATE TRIGGER cardio_activities_pr_check
  BEFORE INSERT OR UPDATE ON cardio_activities
  FOR EACH ROW
  EXECUTE FUNCTION check_cardio_personal_record();

-- ============================================
-- UPDATE HELPER VIEW
-- ============================================

-- Update the user_latest_stats view to include cardio data
DROP VIEW IF EXISTS user_latest_stats;

CREATE OR REPLACE VIEW user_latest_stats AS
SELECT 
  p.id as user_id,
  p.name,
  p.box_name,
  bm.weight as latest_weight,
  bm.body_fat_percent,
  bm.date as weight_date,
  (SELECT COUNT(*) FROM benchmark_results br WHERE br.user_id = p.id AND br.is_pr = true) as total_prs,
  (SELECT COUNT(*) FROM strength_records sr WHERE sr.user_id = p.id AND sr.is_pr = true) as strength_prs,
  (SELECT COUNT(*) FROM cardio_activities ca WHERE ca.user_id = p.id AND ca.is_pr = true) as cardio_prs,
  (SELECT COUNT(*) FROM cardio_activities ca WHERE ca.user_id = p.id AND ca.date >= CURRENT_DATE - INTERVAL '30 days') as monthly_cardio_sessions
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM body_metrics 
  WHERE user_id = p.id 
  ORDER BY date DESC 
  LIMIT 1
) bm ON true;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- You can uncomment these to add some sample cardio activities
-- Make sure to replace the user_id with actual user IDs from your auth.users table

/*
INSERT INTO cardio_activities (user_id, activity_type, name, date, duration_minutes, distance_km, elevation_gain_m, avg_heart_rate, notes) VALUES
('YOUR_USER_ID_HERE', 'run', '5K Morning Run', '2024-01-15', 25, 5.0, 50, 165, 'Felt great today!'),
('YOUR_USER_ID_HERE', 'bike', 'Bike Commute', '2024-01-15', 45, 15.2, 120, 145, 'Traffic was heavy'),
('YOUR_USER_ID_HERE', 'rower', '2K Row Test', '2024-01-14', 8, 2.0, NULL, 175, 'New 2K PR! 7:45'),
('YOUR_USER_ID_HERE', 'skierg', '1K SkiErg', '2024-01-13', 4, 1.0, NULL, 180, 'Brutal workout'),
('YOUR_USER_ID_HERE', 'assault_bike', '20 Cal Bike', '2024-01-12', 3, NULL, NULL, 185, 'Part of WOD'),
('YOUR_USER_ID_HERE', 'run', '10K Training', '2024-01-11', 55, 10.0, 80, 170, 'New distance PR!');
*/

-- ============================================
-- CARDIO MIGRATION COMPLETE!
-- ============================================
