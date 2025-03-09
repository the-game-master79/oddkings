-- Add image_url column to casino_games table
ALTER TABLE casino_games
ADD COLUMN image_url VARCHAR(500);

-- Update existing rows with default S3 images based on game path
UPDATE casino_games
SET image_url = CASE 
    WHEN path = 'plinko' THEN 'https://qbwfitonbkorftjacqzp.supabase.co/storage/v1/object/public/deposit-qr-codes//plinko.png'
    WHEN path = 'mines' THEN 'https://qbwfitonbkorftjacqzp.supabase.co/storage/v1/object/public/deposit-qr-codes//dimonds.png'
    ELSE NULL
END;
