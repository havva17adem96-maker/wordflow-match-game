-- Create compound_words table to store generated words
CREATE TABLE public.compound_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word1 TEXT NOT NULL,
  word2 TEXT NOT NULL,
  compound TEXT NOT NULL UNIQUE,
  word1_tr TEXT NOT NULL,
  word2_tr TEXT NOT NULL,
  compound_tr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.compound_words ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read compound words
CREATE POLICY "Anyone can read compound words"
ON public.compound_words
FOR SELECT
USING (true);

-- Create policy to allow service role to insert compound words
CREATE POLICY "Service role can insert compound words"
ON public.compound_words
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_compound_words_compound ON public.compound_words(compound);