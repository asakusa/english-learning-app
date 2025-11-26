import React, { useState, useEffect, useRef } from 'react';
import { Scene, WordItem, LearningState } from '../types';
import { generateVocabularyForScene, generateImageForWord } from '../services/geminiService';

interface LearningViewProps {
  scene: Scene;
  onComplete: (points: number, wordsCount: number) => void;
  onBack: () => void;
}

const LearningView: React.FC<LearningViewProps> = ({ scene, onComplete, onBack }) => {
  const [state, setState] = useState<LearningState>(LearningState.LOADING);
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Image generation states
  const [currentDisplayImage, setCurrentDisplayImage] = useState<string>(scene.imageUrl);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchWords = async () => {
      setState(LearningState.LOADING);
      const generatedWords = await generateVocabularyForScene(scene.title);
      setWords(generatedWords);
      setState(LearningState.ACTIVE);
    };
    fetchWords();
  }, [scene]);

  // Handle Image Generation for current word
  useEffect(() => {
    const loadSpecificImage = async () => {
      if (words.length === 0) return;

      // Reset to default scene image first if we don't have a cached one
      if (generatedImages[currentIndex]) {
        setCurrentDisplayImage(generatedImages[currentIndex]);
        return;
      } else {
        setCurrentDisplayImage(scene.imageUrl);
      }

      const currentWord = words[currentIndex];
      
      setIsImageLoading(true);
      const specificImage = await generateImageForWord(currentWord.english, scene.title);
      setIsImageLoading(false);

      if (specificImage) {
        setGeneratedImages(prev => ({...prev, [currentIndex]: specificImage}));
        setCurrentDisplayImage(specificImage);
      }
    };

    if (state === LearningState.ACTIVE) {
      loadSpecificImage();
    }
  }, [currentIndex, words, state, scene.imageUrl, scene.title, generatedImages]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setState(LearningState.COMPLETED);
    }
  };

  const handleFinish = () => {
    // Award 50 points per session, count all words
    onComplete(50, words.length);
  };

  const speakText = (e: React.MouseEvent, text: string, lang: 'en-US' | 'ja-JP') => {
    e.stopPropagation(); // Prevent card flip
    if ('speechSynthesis' in window) {
      // Cancel previous speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for learning
      
      // Select appropriate voice if available (iOS/Android handling)
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(lang));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    }
  };

  if (state === LearningState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-pulse">
        <div className="w-24 h-24 bg-indigo-200 rounded-full mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Generating Context...</h2>
        <p className="text-gray-500 mt-2">AI is creating a specialized vocabulary list for "{scene.title}"</p>
      </div>
    );
  }

  if (state === LearningState.COMPLETED) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center shadow-lg transform transition-all animate-bounce">
          <span className="text-6xl">🎉</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Excellent!</h2>
          <p className="text-gray-600 mt-2">You've learned {words.length} new words related to {scene.title}.</p>
        </div>
        <button 
          onClick={handleFinish}
          className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
        >
          Collect Rewards
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between bg-white shadow-sm z-10">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm font-semibold text-gray-500">
          {currentIndex + 1} / {words.length}
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div 
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-between cursor-pointer transition-all duration-500 relative"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ minHeight: '500px' }}
        >
           {/* Dynamic Top Image */}
           <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 relative bg-gray-100">
              <img 
                src={currentDisplayImage} 
                className={`w-full h-full object-cover transition-all duration-700 ${isImageLoading ? 'blur-sm scale-105 opacity-80' : 'blur-0 scale-100 opacity-100'}`} 
                alt="Context" 
              />
              {/* Image Loader Overlay */}
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                  <div className="bg-white/90 p-2 rounded-full shadow-lg flex items-center space-x-2">
                    <svg className="w-4 h-4 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-semibold text-indigo-800">Generating visual...</span>
                  </div>
                </div>
              )}
           </div>

           <div className="flex-1 flex flex-col items-center justify-center w-full text-center space-y-6">
              {!isFlipped ? (
                // Front: English
                <div className="animate-fade-in-up w-full flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-bold text-indigo-900">{currentWord.english}</h2>
                    <button 
                      onClick={(e) => speakText(e, currentWord.english, 'en-US')}
                      className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm active:scale-95"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                       </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-8">Tap to reveal</p>
                </div>
              ) : (
                // Back: Japanese + Chinese + Sentence
                <div className="animate-fade-in-up w-full">
                  <div className="mb-6 flex flex-col items-center">
                    <div className="flex items-center gap-3 justify-center mb-1">
                      <h2 className="text-3xl font-bold text-gray-900">{currentWord.japanese}</h2>
                      <button 
                        onClick={(e) => speakText(e, currentWord.japanese, 'ja-JP')}
                        className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors active:scale-95"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 6.293a1 1 0 011.414 0 3 3 0 010 4.242 1 1 0 01-1.414-1.414 1 1 0 000-1.414 1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                      </button>
                    </div>
                    <p className="text-indigo-600 font-medium">{currentWord.kana}</p>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-4">
                     <p className="text-lg font-bold text-orange-800">{currentWord.chinese}</p>
                  </div>

                  <div className="text-left bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100 flex items-start justify-between gap-2">
                    <span className="italic">"{currentWord.sentence}"</span>
                    <button 
                        onClick={(e) => speakText(e, currentWord.sentence, 'en-US')}
                        className="text-gray-400 hover:text-indigo-600 flex-shrink-0"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                         </svg>
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t border-gray-100">
        <button 
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>Next Word</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LearningView;