import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CompoundWord {
  id: string;
  word1: string;
  word2: string;
  compound: string;
  word1_tr: string;
  word2_tr: string;
  compound_tr: string;
}

type CardState = 'front' | 'back';

export const CompoundWordGame = () => {
  const [currentWord, setCurrentWord] = useState<CompoundWord | null>(null);
  const [leftCardState, setLeftCardState] = useState<CardState>('front');
  const [rightCardState, setRightCardState] = useState<CardState>('front');
  const [mergedState, setMergedState] = useState<'hidden' | 'front' | 'back'>('hidden');
  const [allWords, setAllWords] = useState<CompoundWord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNextWord();
  }, []);

  const loadNextWord = async () => {
    setLoading(true);
    try {
      // TODO: Call edge function to get a new compound word from AI
      // For now, using mock data
      const mockWord: CompoundWord = {
        id: Date.now().toString(),
        word1: 'butter',
        word2: 'fly',
        compound: 'butterfly',
        word1_tr: 'tereyağı',
        word2_tr: 'uçmak',
        compound_tr: 'kelebek'
      };
      
      setCurrentWord(mockWord);
      setLeftCardState('front');
      setRightCardState('front');
      setMergedState('hidden');
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load word",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleLeftCardClick = () => {
    if (leftCardState === 'front') {
      setLeftCardState('back');
      checkMerge('left');
    }
  };

  const handleRightCardClick = () => {
    if (rightCardState === 'front') {
      setRightCardState('back');
      checkMerge('right');
    }
  };

  const checkMerge = (clickedCard: 'left' | 'right') => {
    const otherCardRevealed = clickedCard === 'left' ? rightCardState === 'back' : leftCardState === 'back';
    
    if (otherCardRevealed) {
      // Both cards are revealed, merge them
      setTimeout(() => {
        setMergedState('front');
        if (currentWord) {
          setAllWords(prev => [...prev, currentWord]);
        }
      }, 500);
    }
  };

  const handleMergedCardClick = () => {
    if (mergedState === 'front') {
      setMergedState('back');
    } else if (mergedState === 'back') {
      // Load next word after showing back
      setTimeout(() => {
        loadNextWord();
      }, 1000);
    }
  };

  if (loading || !currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Compound Words</h1>
        <p className="text-muted-foreground">Combine words to create new meanings</p>
      </header>

      <div className="flex-1 flex items-center justify-center">
        {mergedState === 'hidden' ? (
          <div className="flex gap-8 items-center">
            {/* Left Card */}
            <Card
              onClick={handleLeftCardClick}
              className={cn(
                "w-48 h-64 flex items-center justify-center cursor-pointer transition-all duration-500 transform hover:scale-105",
                leftCardState === 'back' && "bg-primary text-primary-foreground"
              )}
              style={{
                transformStyle: 'preserve-3d',
                transform: leftCardState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <div className="text-2xl font-bold text-center" style={{
                transform: leftCardState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {leftCardState === 'front' ? currentWord.word1 : currentWord.word1_tr}
              </div>
            </Card>

            {/* Right Card */}
            <Card
              onClick={handleRightCardClick}
              className={cn(
                "w-48 h-64 flex items-center justify-center cursor-pointer transition-all duration-500 transform hover:scale-105",
                rightCardState === 'back' && "bg-primary text-primary-foreground"
              )}
              style={{
                transformStyle: 'preserve-3d',
                transform: rightCardState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              <div className="text-2xl font-bold text-center" style={{
                transform: rightCardState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {rightCardState === 'front' ? currentWord.word2 : currentWord.word2_tr}
              </div>
            </Card>
          </div>
        ) : (
          /* Merged Card */
          <Card
            onClick={handleMergedCardClick}
            className={cn(
              "w-64 h-80 flex items-center justify-center cursor-pointer transition-all duration-500 transform hover:scale-105 animate-scale-in",
              mergedState === 'back' && "bg-success text-success-foreground"
            )}
            style={{
              transformStyle: 'preserve-3d',
              transform: mergedState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div className="text-3xl font-bold text-center" style={{
              transform: mergedState === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
              {mergedState === 'front' ? currentWord.compound : currentWord.compound_tr}
            </div>
          </Card>
        )}
      </div>

      <footer className="text-center mt-8 pb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              All Words ({allWords.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Learned Words</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {allWords.map((word) => (
                <Card key={word.id} className="p-4">
                  <div className="text-lg font-semibold text-primary mb-2">
                    {word.word1} + {word.word2} = {word.compound}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {word.word1_tr} + {word.word2_tr} = {word.compound_tr}
                  </div>
                </Card>
              ))}
              {allWords.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No words learned yet. Start playing!
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </footer>
    </div>
  );
};
