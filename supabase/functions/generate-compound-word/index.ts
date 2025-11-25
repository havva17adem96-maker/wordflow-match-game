import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompoundWord {
  word1: string;
  word2: string;
  compound: string;
  word1_tr: string;
  word2_tr: string;
  compound_tr: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Starting compound word generation...');

    // Get all existing compound words to avoid duplicates
    const { data: existingWords } = await supabaseClient
      .from('compound_words')
      .select('compound');

    const existingCompounds = existingWords?.map(w => w.compound.toLowerCase()) || [];
    console.log('Existing compounds:', existingCompounds);

    // Generate a new compound word using Lovable AI
    let attempts = 0;
    let newWord: CompoundWord | null = null;

    while (!newWord && attempts < 5) {
      attempts++;
      console.log(`Attempt ${attempts} to generate new word`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a language teacher creating compound word exercises. Generate a compound English word made from two simple English words, and provide Turkish translations.

IMPORTANT RULES:
1. Generate real English compound words (like "butterfly" from "butter" + "fly")
2. Use simple, common English words that learners would know
3. The compound must be a single real word in English
4. Avoid these already used compounds: ${existingCompounds.join(', ')}
5. Return ONLY a valid JSON object, no other text

Example format:
{
  "word1": "sun",
  "word2": "flower",
  "compound": "sunflower",
  "word1_tr": "güneş",
  "word2_tr": "çiçek",
  "compound_tr": "ayçiçeği"
}`
            },
            {
              role: 'user',
              content: 'Generate a new compound word.'
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response:', JSON.stringify(data));

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content in AI response');
        continue;
      }

      try {
        // Parse the JSON from AI response
        const generatedWord = JSON.parse(content.trim());
        
        // Validate the generated word
        if (!generatedWord.word1 || !generatedWord.word2 || !generatedWord.compound ||
            !generatedWord.word1_tr || !generatedWord.word2_tr || !generatedWord.compound_tr) {
          console.error('Invalid word structure:', generatedWord);
          continue;
        }

        // Check if compound already exists
        if (existingCompounds.includes(generatedWord.compound.toLowerCase())) {
          console.log('Compound already exists, trying again');
          continue;
        }

        newWord = generatedWord;
        console.log('Successfully generated new word:', newWord);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        continue;
      }
    }

    if (!newWord) {
      throw new Error('Failed to generate a valid compound word after 5 attempts');
    }

    // Save to database
    const { data: insertedWord, error: insertError } = await supabaseClient
      .from('compound_words')
      .insert({
        word1: newWord.word1,
        word2: newWord.word2,
        compound: newWord.compound,
        word1_tr: newWord.word1_tr,
        word2_tr: newWord.word2_tr,
        compound_tr: newWord.compound_tr,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Word saved to database:', insertedWord);

    return new Response(
      JSON.stringify(insertedWord),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-compound-word:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
