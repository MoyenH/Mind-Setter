/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Brain, 
  ChevronRight, 
  Info, 
  Loader2, 
  MinusCircle, 
  PlusCircle, 
  Scale, 
  Sparkles, 
  XCircle 
} from 'lucide-react';
import { analyzeDecision, DecisionAnalysis, DecisionOption, ImpactItem } from './services/geminiService';

export default function App() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DecisionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzeDecision(query);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again or rephrase your decision.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
            <Brain className="w-6 h-6" />
            <span>Mind Setter</span>
          </div>
          <p className="hidden sm:block text-xs font-mono text-slate-500 uppercase tracking-widest">
            Decision Intelligence v1.0
          </p>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-5xl mx-auto">
        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Settle your mind, <span className="text-indigo-600">choose wisely.</span>
            </h1>
            <p className="text-slate-500 text-lg mb-8">
              Input any decision or comparison. Our AI breaks it down into weighted facts, helping you see the logic behind your choice.
            </p>

            <form onSubmit={handleAnalyze} className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Should I buy a Tesla or a BMW? / Should I quit my job?"
                className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 pr-32"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <p className="text-slate-500 font-medium animate-pulse">Computing pros, cons, and weighted impacts...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-center flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4 uppercase tracking-widest text-xs">
                <Sparkles className="w-4 h-4" />
                Executive Summary
              </div>
              <h2 className="text-2xl font-bold mb-4">{result.summary}</h2>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Info className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-slate-600 italic">"{result.analyticalNote}"</p>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className={`grid gap-6 ${result.options.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {result.options.map((option, idx) => (
                <OptionCard key={idx} option={option} />
              ))}
            </div>

            {/* Recommendation */}
            <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-6 h-6" />
                  <span className="font-bold text-xl">The Recommendation</span>
                </div>
                <p className="text-indigo-50 text-xl leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
              <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-500/20" />
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer Meta */}
      <footer className="mt-20 py-10 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2 grayscale brightness-125 opacity-50">
            <Brain className="w-5 h-5" />
            <span className="font-bold">Mind Setter</span>
          </div>
          <p className="text-slate-400 text-xs">Always verify AI suggestions with your own research and intuition.</p>
        </div>
      </footer>
    </div>
  );
}

const OptionCard = ({ option }: { option: DecisionOption; key?: any }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-xl font-bold text-slate-800">{option.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Strength</span>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center relative">
             <span className="font-mono font-bold text-indigo-600 text-sm">{option.overallScore}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6 flex-1">
        {/* Pros */}
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-4">
            <PlusCircle className="w-4 h-4" />
            Critical Advantages
          </div>
          <div className="space-y-3">
            {option.pros.map((pro, i) => (
              <ImpactItemView key={i} item={pro} type="pro" />
            ))}
          </div>
        </div>

        {/* Cons */}
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wider mb-4">
            <MinusCircle className="w-4 h-4" />
            Significant Drawbacks
          </div>
          <div className="space-y-3">
            {option.cons.map((con, i) => (
              <ImpactItemView key={i} item={con} type="con" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ImpactItemView = ({ item, type }: { item: ImpactItem; type: 'pro' | 'con'; key?: any }) => {
  const scoreColors = {
    pro: 'bg-emerald-100 text-emerald-700',
    con: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className={`p-4 rounded-xl border border-slate-100 transition-all hover:border-slate-200 bg-white ${type === 'pro' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'}`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="text-slate-700 font-medium leading-snug">{item.text}</p>
        <span className={`shrink-0 font-mono text-xs px-2 py-0.5 rounded-full ${scoreColors[type]}`}>
          {item.score}/5
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <ChevronRight className="w-3 h-3" />
        {item.category}
      </div>
    </div>
  );
};
