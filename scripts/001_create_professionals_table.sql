-- Create professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  specialties TEXT[],
  experience_years INTEGER DEFAULT 0,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_professionals_active ON public.professionals(is_active);
CREATE INDEX IF NOT EXISTS idx_professionals_rating ON public.professionals(rating DESC);

-- Insert some sample professionals
INSERT INTO public.professionals (name, description, specialties, experience_years, photo_url, rating, total_reviews) VALUES
('João Silva', 'Especialista em cortes clássicos e modernos. Mais de 10 anos de experiência no mercado.', ARRAY['Corte Masculino', 'Barba', 'Bigode'], 10, '/professional-barber-headshot.jpg', 4.8, 127),
('Maria Santos', 'Profissional dedicada com foco em atendimento personalizado e técnicas inovadoras.', ARRAY['Corte Feminino', 'Coloração', 'Tratamentos'], 8, '/professional-barber-headshot-male.jpg', 4.9, 89),
('Carlos Oliveira', 'Barbeiro tradicional com técnicas clássicas e modernas. Especialista em barbas.', ARRAY['Barba', 'Bigode', 'Corte Clássico'], 15, '/barber-shop.png', 4.7, 203),
('Ana Costa', 'Estilista criativa com experiência em cortes modernos e colorações exclusivas.', ARRAY['Corte Moderno', 'Coloração', 'Penteados'], 6, '/hairdresser.png', 4.6, 156);
