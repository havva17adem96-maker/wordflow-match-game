import { useState, useEffect } from 'react';
import { WordButton } from './WordButton';
import { Word, parseCSV, shuffleArray } from '@/utils/wordParser';
import wordPoolCSV from '@/assets/word_pool.csv?raw';

interface GameState {
  leftWords: Word[];
  rightWords: Word[];
  selectedLeft: number | null;
  selectedRight: number | null;
  leftStates: ('default' | 'selected' | 'correct' | 'wrong')[];
  rightStates: ('default' | 'selected' | 'correct' | 'wrong')[];
}

export const WordMatchGame = () => {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [unusedWords, setUnusedWords] = useState<Word[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    leftWords: [],
    rightWords: [],
    selectedLeft: null,
    selectedRight: null,
    leftStates: Array(5).fill('default'),
    rightStates: Array(5).fill('default'),
  });

  // Load words from CSV
  useEffect(() => {
    const words = parseCSV(wordPoolCSV);
    if (words.length > 0) {
      setAllWords(words);
      startNewCycle(words);
    }
  }, []);

  const startNewCycle = (words: Word[]) => {
    const shuffled = shuffleArray(words);
    setUnusedWords(shuffled);
    loadNewPairs(shuffled, 5);
  };

  const loadNewPairs = (availableWords: Word[], count: number) => {
    const pairsToLoad = Math.min(count, availableWords.length);
    const wordsToUse = availableWords.slice(0, pairsToLoad);
    const remaining = availableWords.slice(pairsToLoad);

    const leftWords = [...wordsToUse];
    const rightWords = shuffleArray([...wordsToUse]);

    setGameState({
      leftWords,
      rightWords,
      selectedLeft: null,
      selectedRight: null,
      leftStates: Array(pairsToLoad).fill('default'),
      rightStates: Array(pairsToLoad).fill('default'),
    });
    setUnusedWords(remaining);
  };

  const handleLeftClick = (index: number) => {
    if (gameState.leftStates[index] === 'correct') return;

    const newStates = { ...gameState };
    
    // Deselect if already selected
    if (gameState.selectedLeft === index) {
      newStates.selectedLeft = null;
      newStates.leftStates[index] = 'default';
      setGameState(newStates);
      return;
    }

    // Reset previous selections
    if (gameState.selectedLeft !== null) {
      newStates.leftStates[gameState.selectedLeft] = 'default';
    }

    newStates.selectedLeft = index;
    newStates.leftStates[index] = 'selected';

    // Check if right side has selection
    if (gameState.selectedRight !== null) {
      checkMatch(index, gameState.selectedRight, newStates);
    } else {
      setGameState(newStates);
    }
  };

  const handleRightClick = (index: number) => {
    if (gameState.rightStates[index] === 'correct') return;

    const newStates = { ...gameState };
    
    // Deselect if already selected
    if (gameState.selectedRight === index) {
      newStates.selectedRight = null;
      newStates.rightStates[index] = 'default';
      setGameState(newStates);
      return;
    }

    // Reset previous selections
    if (gameState.selectedRight !== null) {
      newStates.rightStates[gameState.selectedRight] = 'default';
    }

    newStates.selectedRight = index;
    newStates.rightStates[index] = 'selected';

    // Check if left side has selection
    if (gameState.selectedLeft !== null) {
      checkMatch(gameState.selectedLeft, index, newStates);
    } else {
      setGameState(newStates);
    }
  };

  const checkMatch = (leftIndex: number, rightIndex: number, newStates: GameState) => {
    const leftWord = gameState.leftWords[leftIndex];
    const rightWord = gameState.rightWords[rightIndex];

    if (leftWord.id === rightWord.id) {
      // Correct match
      newStates.leftStates[leftIndex] = 'correct';
      newStates.rightStates[rightIndex] = 'correct';
      setGameState(newStates);

      // Remove matched pair and add new words after animation
      setTimeout(() => {
        replaceMatchedPair(leftIndex, rightIndex);
      }, 600);
    } else {
      // Wrong match
      newStates.leftStates[leftIndex] = 'wrong';
      newStates.rightStates[rightIndex] = 'wrong';
      setGameState(newStates);

      // Reset after showing wrong state
      setTimeout(() => {
        setGameState({
          ...gameState,
          selectedLeft: null,
          selectedRight: null,
          leftStates: gameState.leftStates.map((s, i) => i === leftIndex ? 'default' : s),
          rightStates: gameState.rightStates.map((s, i) => i === rightIndex ? 'default' : s),
        });
      }, 800);
    }
  };

  const replaceMatchedPair = (leftIndex: number, rightIndex: number) => {
    // Check if we need to start a new cycle
    if (unusedWords.length === 0) {
      startNewCycle(allWords);
      return;
    }

    // Get new word and update remaining pool
    const newWord = unusedWords[0];
    const remaining = unusedWords.slice(1);
    
    // Replace words at their exact positions (don't change other positions)
    const newLeftWords = [...gameState.leftWords];
    const newRightWords = [...gameState.rightWords];
    const newLeftStates = [...gameState.leftStates];
    const newRightStates = [...gameState.rightStates];
    
    newLeftWords[leftIndex] = newWord;
    newRightWords[rightIndex] = newWord;
    newLeftStates[leftIndex] = 'default';
    newRightStates[rightIndex] = 'default';

    setGameState({
      leftWords: newLeftWords,
      rightWords: newRightWords,
      selectedLeft: null,
      selectedRight: null,
      leftStates: newLeftStates,
      rightStates: newRightStates,
    });
    setUnusedWords(remaining);
  };

  if (gameState.leftWords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-muted-foreground">Loading words...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Word Match</h1>
        <p className="text-muted-foreground">Match English words with Turkish meanings</p>
      </header>

      <div className="flex-1 grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        {/* Left Column - English */}
        <div className="space-y-3">
          {gameState.leftWords.map((word, index) => (
            <WordButton
              key={`${word.id}-left-${index}`}
              word={word.english}
              state={gameState.leftStates[index]}
              onClick={() => handleLeftClick(index)}
              disabled={gameState.leftStates[index] === 'correct'}
            />
          ))}
        </div>

        {/* Right Column - Turkish */}
        <div className="space-y-3">
          {gameState.rightWords.map((word, index) => (
            <WordButton
              key={`${word.id}-right-${index}`}
              word={word.turkish}
              state={gameState.rightStates[index]}
              onClick={() => handleRightClick(index)}
              disabled={gameState.rightStates[index] === 'correct'}
            />
          ))}
        </div>
      </div>

      <footer className="text-center mt-8 text-sm text-muted-foreground">
        <p>Tap words to match • {unusedWords.length} words remaining in cycle</p>
      </footer>
    </div>
  );
};
