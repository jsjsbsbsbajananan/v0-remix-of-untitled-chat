-- Add more sample professionals with better data
INSERT INTO public.professionals (name, description, specialties, experience_years, photo_url, rating, total_reviews) VALUES
('Roberto Almeida', 'Barbeiro experiente especializado em cortes clássicos e modernos. Atendimento personalizado e técnicas tradicionais.', ARRAY['Corte Clássico', 'Barba Tradicional', 'Relaxamento'], 12, '/professional-barber-headshot.jpg', 4.9, 245),
('Fernanda Lima', 'Cabeleireira e visagista com especialização em coloração e tratamentos capilares. Sempre atualizada com as últimas tendências.', ARRAY['Coloração', 'Tratamentos', 'Corte Feminino', 'Penteados'], 7, '/professional-barber-headshot-male.jpg', 4.8, 178),
('Marcos Pereira', 'Barbeiro master com vasta experiência em todos os tipos de corte. Especialista em barbas artísticas e cortes premium.', ARRAY['Todos os Estilos', 'Barba Artística', 'Cortes Premium', 'Design'], 18, '/barber-shop.png', 5.0, 312),
('Juliana Santos', 'Profissional dedicada com foco em atendimento de qualidade. Especialista em cortes modernos e técnicas inovadoras.', ARRAY['Cortes Modernos', 'Luzes', 'Mechas', 'Alisamentos'], 5, '/hairdresser.png', 4.7, 134);
