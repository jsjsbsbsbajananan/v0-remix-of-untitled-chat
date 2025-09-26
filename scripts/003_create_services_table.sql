-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de horários de trabalho dos profissionais
CREATE TABLE IF NOT EXISTS professional_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Domingo, 1 = Segunda, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  lunch_start_time TIME,
  lunch_end_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de bloqueios de horários específicos
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  is_full_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir alguns serviços de exemplo
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Corte Masculino', 'Corte de cabelo masculino tradicional', 35.00, 30),
('Barba', 'Aparar e modelar barba', 25.00, 20),
('Corte + Barba', 'Corte de cabelo + barba completo', 55.00, 45),
('Sobrancelha', 'Design de sobrancelha masculina', 15.00, 15),
('Corte Infantil', 'Corte de cabelo para crianças até 12 anos', 25.00, 25);

-- Inserir horários de trabalho padrão para os profissionais existentes
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, lunch_start_time, lunch_end_time)
SELECT 
  id as professional_id,
  generate_series(1, 6) as day_of_week, -- Segunda a Sábado
  '08:00'::time as start_time,
  '18:00'::time as end_time,
  '12:00'::time as lunch_start_time,
  '13:00'::time as lunch_end_time
FROM professionals
WHERE is_active = true;
