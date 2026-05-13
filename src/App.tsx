/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Stars, 
  Book, 
  Smartphone, 
  Lightbulb, 
  Utensils, 
  Activity, 
  Snowflake, 
  Droplets, 
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Sun
} from 'lucide-react';

type QuestionStep = 'intro' | 'profile' | 'day-rating' | 'nutrition' | 'recovery' | 'cycle' | 'outro';

interface FormData {
  name: string;
  gender: 'M' | 'F' | null;
  dayRating: number | null;
  nutrition: string; // 1-5
  physio: boolean | null;
  stretching: boolean | null;
  coldBath: boolean | null;
  cycle: boolean | null;
  cyclePain: boolean | null;
  spreadsheetUrl: string;
}

const NUTRITION_OPTIONS = [
  { value: '1', label: 'Ho saltato dei pasti' },
  { value: '2', label: 'Ho seguito i pasti ma non il piano' },
  { value: '3', label: 'Ho rispettato un parametro' },
  { value: '4', label: 'Ho rispettato due parametri' },
  { value: '5', label: 'Ho rispettato tutti i parametri' },
];

export default function App() {
  const [step, setStep] = useState<QuestionStep>('intro');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: null,
    dayRating: null,
    nutrition: '',
    physio: null,
    stretching: null,
    coldBath: null,
    cycle: null,
    cyclePain: null,
    spreadsheetUrl: 'https://script.google.com/macros/s/AKfycbwy5fuHFgCTMJyBbRFCo87i5I_S_E7OrODrLmgTQe_PZ322x_puY0OD1b78HAocq1-G/exec',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const nextStep = useCallback(() => {
    switch (step) {
      case 'intro': setStep('profile'); break;
      case 'profile': setStep('day-rating'); break;
      case 'day-rating': setStep('nutrition'); break;
      case 'nutrition': setStep('recovery'); break;
      case 'recovery': 
        if (formData.gender === 'F') {
          setStep('cycle');
        } else {
          setStep('outro');
        }
        break;
      case 'cycle': setStep('outro'); break;
    }
  }, [step, formData.gender]);

  const prevStep = useCallback(() => {
    switch (step) {
      case 'profile': setStep('intro'); break;
      case 'day-rating': setStep('profile'); break;
      case 'nutrition': setStep('day-rating'); break;
      case 'recovery': setStep('nutrition'); break;
      case 'cycle': setStep('recovery'); break;
    }
  }, [step]);

  const updateData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitToSheets = async () => {
    if (!formData.spreadsheetUrl) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Basic payload preparation
      const payload = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        gender: formData.gender === 'M' ? 'Maschio' : 'Femmina',
        dayRating: formData.dayRating,
        nutrition: NUTRITION_OPTIONS.find(o => o.value === formData.nutrition)?.label || formData.nutrition,
        physio: formData.physio ? 'Sì' : 'No',
        stretching: formData.stretching ? 'Sì' : 'No',
        coldBath: formData.coldBath ? 'Sì' : 'No',
        cycle: formData.gender === 'F' ? (formData.cycle ? 'Sì' : 'No') : 'N/A',
        cyclePain: formData.gender === 'F' && formData.cycle ? (formData.cyclePain ? 'Sì' : 'No') : 'N/A',
      };

      await fetch(formData.spreadsheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setSubmitStatus('success');
    } catch (error) {
      console.error('Errore durante l\'invio:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 'profile': return formData.name.trim().length > 0 && formData.gender !== null;
      case 'day-rating': return formData.dayRating !== null;
      case 'nutrition': return formData.nutrition !== '';
      case 'recovery': return formData.physio !== null && formData.stretching !== null && formData.coldBath !== null;
      case 'cycle': 
        if (formData.cycle === false) return true;
        return formData.cycle !== null && formData.cyclePain !== null;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-night-950 text-moon-light font-sans relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 gradient-glow pointer-events-none" />
      <div className="absolute top-10 right-10 opacity-20 animate-pulse">
        <Stars size={120} className="text-star-gold" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <Moon size={200} className="text-white" />
      </div>

      <main className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <h1 className="font-serif text-5xl md:text-6xl italic mb-4">Buona Notte</h1>
              <p className="text-lg text-moon-light/80 leading-relaxed max-w-lg mx-auto">
                Saluta il telefono 15 minuti prima di addormentarti, magari leggi un buon libro.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <AdviceCard 
                  icon={<Lightbulb className="text-star-gold" />}
                  text="Luminosità adeguata e soffusa"
                />
                <AdviceCard 
                  icon={<Smartphone className="text-red-400" />}
                  text="Via il telefono 15 min prima"
                />
                <AdviceCard 
                  icon={<Book className="text-blue-300" />}
                  text="Leggi un buon libro"
                />
              </div>

              <button 
                onClick={nextStep}
                className="mt-12 px-8 py-4 bg-night-800 border border-night-700 hover:bg-night-700 rounded-full transition-all flex items-center gap-2 mx-auto group"
              >
                Inizia Questionario
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'profile' && (
            <StepContainer 
              title="Raccontaci di te" 
              onNext={nextStep} 
              onPrev={prevStep}
              isValid={isStepValid()}
              icon={<User className="text-star-gold" />}
            >
              <div className="space-y-10">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest opacity-50 block text-center">Il tuo nome</label>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Esempio: Marco"
                    value={formData.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-night-700 focus:border-star-gold outline-none py-4 text-3xl text-center transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest opacity-50 block text-center">Sesso</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateData('gender', 'M')}
                      className={`flex-1 py-6 rounded-xl border-2 transition-all ${
                        formData.gender === 'M' 
                          ? 'bg-star-gold/10 border-star-gold text-star-gold' 
                          : 'bg-night-900/50 border-night-700 hover:border-night-600'
                      }`}
                    >
                      Maschio
                    </button>
                    <button
                      onClick={() => updateData('gender', 'F')}
                      className={`flex-1 py-6 rounded-xl border-2 transition-all ${
                        formData.gender === 'F' 
                          ? 'bg-star-gold/10 border-star-gold text-star-gold' 
                          : 'bg-night-900/50 border-night-700 hover:border-night-600'
                      }`}
                    >
                      Femmina
                    </button>
                  </div>
                </div>
              </div>
            </StepContainer>
          )}

          {step === 'day-rating' && (
            <StepContainer 
              title="È stata una bella giornata?" 
              onNext={nextStep} 
              onPrev={prevStep}
              isValid={isStepValid()}
              icon={<Sun className="text-star-gold" />}
            >
              <div className="space-y-12">
                <div className="flex justify-between items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateData('dayRating', num)}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all ${
                        formData.dayRating === num
                          ? 'bg-star-gold border-star-gold text-night-950 scale-110 shadow-lg shadow-star-gold/20'
                          : 'border-night-700 hover:border-night-500'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest opacity-40 px-2">
                  <span>Pessima</span>
                  <span>Neutra</span>
                  <span>Superlativa</span>
                </div>
              </div>
            </StepContainer>
          )}

          {step === 'nutrition' && (
            <StepContainer 
              title="Piano Nutrizionale" 
              subtitle="Dieta, Idratazione, Integrazione"
              onNext={nextStep} 
              onPrev={prevStep}
              isValid={isStepValid()}
              icon={<Utensils className="text-star-gold" />}
            >
              <div className="space-y-3">
                {NUTRITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateData('nutrition', opt.value)}
                    className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                      formData.nutrition === opt.value 
                        ? 'bg-star-gold/10 border-star-gold text-star-gold' 
                        : 'bg-night-900/50 border-night-700 hover:border-night-600'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="font-mono opacity-50">{opt.value}</span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {step === 'recovery' && (
            <StepContainer 
              title="Recupero e Benessere" 
              onNext={nextStep} 
              onPrev={prevStep}
              isValid={isStepValid()}
              icon={<Activity className="text-star-gold" />}
            >
              <div className="space-y-8">
                <RecoveryItem 
                  title="Fisioterapia o Massaggio?"
                  subtitle="Qualunque tipo di massaggio di scarico"
                  value={formData.physio}
                  onChange={(v) => updateData('physio', v)}
                />
                <RecoveryItem 
                  title="Stretching e Mobilità?"
                  subtitle="Seduta defaticante"
                  value={formData.stretching}
                  onChange={(v) => updateData('stretching', v)}
                />
                <RecoveryItem 
                  title="Bagno Freddo?"
                  value={formData.coldBath}
                  onChange={(v) => updateData('coldBath', v)}
                />
              </div>
            </StepContainer>
          )}

          {step === 'cycle' && (
            <StepContainer 
              title="Ciclo Mestruale" 
              onNext={nextStep} 
              onPrev={prevStep}
              isValid={isStepValid()}
              icon={<Droplets className="text-star-gold" />}
            >
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-sm opacity-60 block text-center italic">È presente il ciclo mestruale?</label>
                  <YesNoSmall value={formData.cycle} onChange={(v) => {
                    updateData('cycle', v);
                    if (!v) updateData('cyclePain', null);
                  }} />
                </div>

                <AnimatePresence>
                  {formData.cycle === true && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <label className="text-sm opacity-60 block text-center italic border-t border-night-800 pt-6">È doloroso?</label>
                      <YesNoSmall value={formData.cyclePain} onChange={(v) => updateData('cyclePain', v)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StepContainer>
          )}

          {step === 'outro' && (
            <motion.div
              key="outro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="flex justify-center">
                <CheckCircle size={80} className="text-green-400" />
              </div>
              <h2 className="font-serif text-4xl">Grazie, {formData.name}!</h2>
              <p className="text-xl text-moon-light/70 italic">
                Il tuo corpo ti ringrazierà domani.
              </p>

              <div className="bg-night-900/50 p-6 rounded-2xl border border-night-800 space-y-4 max-w-sm mx-auto">
                <div className="flex items-center gap-2 text-sm text-moon-light/60 justify-center">
                  <Book size={16} />
                  <span>Salvataggio Dati</span>
                </div>
                
                <button
                  onClick={submitToSheets}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-star-gold text-night-950 disabled:opacity-30'
                  }`}
                >
                  {isSubmitting ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Activity size={20} />
                    </motion.div>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle size={20} />
                      Dati Inviati!
                    </>
                  ) : (
                    <>
                      <ChevronRight size={20} />
                      Invia Dati a Fogli Google
                    </>
                  )}
                </button>
                {submitStatus === 'error' && (
                  <p className="text-xs text-red-400 text-center">Si è verificato un errore durante l'invio.</p>
                )}
                {submitStatus === 'success' && (
                  <p className="text-xs text-green-400 text-center">Dati salvati con successo sul foglio.</p>
                )}
              </div>

              <div className="pt-8">
                <p className="text-star-gold/80 flex items-center justify-center gap-2">
                  <Moon size={20} />
                  Sogni d'oro e buon riposo
                </p>
              </div>
              <button 
                onClick={() => {
                  setStep('intro');
                  setFormData({
                    name: '',
                    gender: null,
                    dayRating: null,
                    nutrition: '',
                    physio: null,
                    stretching: null,
                    coldBath: null,
                    cycle: null,
                    cyclePain: null,
                    spreadsheetUrl: formData.spreadsheetUrl,
                  });
                  setSubmitStatus('idle');
                }}
                className="text-sm opacity-40 hover:opacity-100 transition-opacity underline underline-offset-4"
              >
                Ricomincia questionario
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Bar (bottom) */}
      {step !== 'intro' && step !== 'outro' && (
        <div className="fixed bottom-0 left-0 w-full h-1 bg-night-900">
          <motion.div 
            className="h-full bg-star-gold"
            initial={{ width: 0 }}
            animate={{ width: `${(getStepIndex(step) / (formData.gender === 'F' ? 4 : 3)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function AdviceCard({ icon, text }: { icon: ReactNode, text: string }) {
  return (
    <div className="p-6 bg-night-900/30 rounded-2xl border border-night-800 flex flex-col items-center gap-4 text-center">
      <div className="p-3 bg-night-800 rounded-full">
        {icon}
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

function StepContainer({ 
  title, 
  subtitle, 
  children, 
  onNext, 
  onPrev, 
  isValid,
  icon
}: { 
  title: string;
  subtitle?: string;
  children: ReactNode; 
  onNext: () => void; 
  onPrev: () => void;
  isValid: boolean;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="text-center space-y-4">
        {icon && <div className="flex justify-center mb-6">{icon}</div>}
        <h2 className="text-4xl font-serif">{title}</h2>
        {subtitle && <p className="text-moon-light/50">{subtitle}</p>}
      </div>

      <div className="py-8">
        {children}
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={onPrev}
          className="flex items-center gap-2 text-moon-light/60 hover:text-moon-light transition-colors"
        >
          <ChevronLeft />
          Indietro
        </button>
        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-3 rounded-full flex items-center gap-2 transition-all ${
            isValid 
              ? 'bg-star-gold text-night-950 font-bold hover:scale-105 active:scale-95' 
              : 'bg-night-800 text-moon-light/30 cursor-not-allowed'
          }`}
        >
          Continua
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean | null, onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-12 rounded-2xl border-2 transition-all text-2xl font-serif ${
          value === true 
            ? 'bg-star-gold/10 border-star-gold text-star-gold' 
            : 'bg-night-900/50 border-night-700 hover:border-night-600'
        }`}
      >
        Sì
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-12 rounded-2xl border-2 transition-all text-2xl font-serif ${
          value === false 
            ? 'bg-night-900/50 border-night-700 hover:border-night-600' 
            : 'bg-night-900/50 border-night-700 hover:border-night-600'
        } ${value === false ? 'border-red-400 text-red-400 bg-red-400/5' : ''}`}
      >
        No
      </button>
    </div>
  );
}

function getStepIndex(step: QuestionStep): number {
  const steps: QuestionStep[] = ['profile', 'day-rating', 'nutrition', 'recovery', 'cycle'];
  return steps.indexOf(step) + 1;
}

function RecoveryItem({ 
  title, 
  subtitle, 
  value, 
  onChange 
}: { 
  title: string; 
  subtitle?: string; 
  value: boolean | null; 
  onChange: (v: boolean) => void 
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-night-900/30 rounded-2xl border border-night-800">
      <div className="flex-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {subtitle && <p className="text-sm opacity-50">{subtitle}</p>}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            value === true ? 'bg-star-gold text-night-950 border-star-gold' : 'border-night-700 opacity-40 hover:opacity-100'
          }`}
        >
          Sì
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            value === false ? 'bg-red-400/20 text-red-400 border-red-400' : 'border-night-700 opacity-40 hover:opacity-100'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function YesNoSmall({ value, onChange }: { value: boolean | null, onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3 max-w-[200px] mx-auto">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-4 rounded-xl border-2 transition-all ${
          value === true 
            ? 'bg-star-gold/10 border-star-gold text-star-gold' 
            : 'bg-night-900/50 border-night-700 hover:border-night-600'
        }`}
      >
        Sì
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-4 rounded-xl border-2 transition-all ${
          value === false 
            ? 'bg-red-400/10 border-red-400 text-red-400' 
            : 'bg-night-900/50 border-night-700 hover:border-night-600'
        }`}
      >
        No
      </button>
    </div>
  );
}
