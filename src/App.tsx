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
    <div className="min-h-screen bg-paper-bg text-paper-text selection:bg-red-100 selection:text-red-900 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-paper-bg/80 backdrop-blur-md border-b border-paper-text">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif italic text-2xl tracking-tight">
            <span>Mind Setter</span>
          </div>
          <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
            Issue No. 042 — Decision Matrix
          </p>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-5xl mx-auto">
        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-20 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-red block mb-2">The Inquiry Engine</span>
            <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-6 tracking-tight leading-[1.1]">
              Refining the path to an <span className="italic">informed</span> choice.
            </h1>
            <p className="text-paper-text/60 text-lg mb-10 font-medium leading-relaxed max-w-lg">
              Deconstruct complex variables through weighted analysis. Enter your query to begin the evaluation.
            </p>

            <form onSubmit={handleAnalyze} className="relative group border-b-2 border-paper-text pb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Current decision..."
                className="w-full px-0 py-2 rounded-none bg-transparent font-serif italic text-2xl focus:outline-none placeholder:text-paper-text/20 pr-32"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !query.trim()}
                className="absolute right-0 bottom-4 px-8 py-3 bg-paper-text text-paper-bg font-serif italic text-lg hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
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
            <div className="bg-transparent editorial-border mb-12">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-red block mb-2">Executive Summary</span>
              <h2 className="text-4xl font-serif font-bold mb-6 leading-tight max-w-3xl">{result.summary}</h2>
              <div className="max-w-xl">
                 <p className="text-sm font-medium opacity-50 italic leading-relaxed">"{result.analyticalNote}"</p>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className={`grid gap-12 ${result.options.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {result.options.map((option, idx) => (
                <OptionCard key={idx} option={option} />
              ))}
            </div>

            {/* Recommendation */}
            <div className="mt-20 pt-12 editorial-border border-b border-paper-text pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="max-w-xl">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 block mb-2">Final Verdict</span>
                <p className="text-3xl font-serif italic leading-[1.3]">
                  {result.recommendation}
                </p>
              </div>
              <div className="flex gap-12 shrink-0">
                <div>
                  <div className="text-[9px] uppercase font-bold opacity-40 mb-1">Analytic Depth</div>
                  <div className="text-xs font-semibold uppercase">High Fidelity</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold opacity-40 mb-1">Status</div>
                  <div className="text-xs font-semibold uppercase">Evaluated</div>
                </div>
              </div>
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
    <div className="flex flex-col h-full bg-transparent">
      <div className="editorial-border mb-8 flex items-baseline justify-between">
        <h3 className="text-2xl font-serif font-bold uppercase tracking-tight">{option.name}</h3>
        <div className="flex flex-col items-end">
          <span className="text-[24px] font-serif italic text-accent-red">{option.overallScore}</span>
          <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">Weighting Index</span>
        </div>
      </div>
      
      <div className="space-y-12 flex-1">
        {/* Pros */}
        <section>
          <div className="flex items-center justify-between border-b border-paper-text/10 pb-2 mb-6">
            <span className="text-xs uppercase tracking-tighter font-black">Arguments For</span>
            <span className="italic font-serif text-[10px] opacity-40">Pro Component</span>
          </div>
          <div className="space-y-8 italic font-serif">
            {option.pros.map((pro, i) => (
              <ImpactItemView key={i} item={pro} type="pro" index={i + 1} />
            ))}
          </div>
        </section>

        {/* Cons */}
        <section>
          <div className="flex items-center justify-between border-b border-paper-text/10 pb-2 mb-6">
            <span className="text-xs uppercase tracking-tighter font-black">Arguments Against</span>
            <span className="italic font-serif text-[10px] opacity-40">Con Component</span>
          </div>
          <div className="space-y-8 italic font-serif">
            {option.cons.map((con, i) => (
              <ImpactItemView key={i} item={con} type="con" index={i + 1} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ImpactItemView = ({ item, type, index }: { item: ImpactItem; type: 'pro' | 'con'; key?: any; index: number }) => {
  return (
    <div className="group rounded-none bg-transparent">
      <div className="text-[9px] font-mono font-bold opacity-30 mb-1 flex items-center justify-between">
        <span>{String(index).padStart(2, '0')} / {item.category.toUpperCase()}</span>
        <span className={type === 'pro' ? 'text-emerald-700' : 'text-rose-700'}>
          {item.score} UNIT IMPACT
        </span>
      </div>
      <p className="text-lg leading-snug">
        {item.text}
      </p>
    </div>
  );
};
