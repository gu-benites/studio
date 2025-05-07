import React, { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const StepHealthConcern: React.FC = () => {
  const {
    formData,
    updateFormData,
    nextStep
  } = useFormContext();
  const [healthConcern, setHealthConcern] = useState(formData.health_concern || '');
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthConcern.trim()) {
      setError('Por favor, informe sua preocupação de saúde');
      return;
    }
    updateFormData({
      health_concern: healthConcern
    });
    nextStep();
  };
  const handleQuickAction = (concern: string) => {
    setHealthConcern(concern);
    setError('');
  };
  return <div className="step-container px-0 text-center">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#7b61ff] to-[#ff5fa1] text-transparent bg-clip-text">
          Qual receita você quer criar hoje?
        </h1>
        <p className="text-gray-600 max-w-md mx-auto text-base leading-relaxed">Descreva sua principal preocupação de saúde para
uma receita de óleos essenciais adequada para você.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="rounded-2xl p-6 md:p-8 mb-6 py-0 px-0">
          <div className="mb-6 text-left">
            
            
            <div className="relative input-outer-wrapper">
              <div className="input-gradient-border p-[1px] rounded-[26px] transition-all duration-300 ease-in-out focus-within:bg-gradient-to-r focus-within:from-[#7b61ff] focus-within:to-[#ff5fa1] hover:bg-gradient-to-r hover:from-[#7b61ff] hover:to-[#ff5fa1]">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input id="health-concern" value={healthConcern} onChange={e => {
                  setHealthConcern(e.target.value);
                  setError('');
                }} placeholder="Por exemplo: dor de cabeça, insônia, ansiedade, etc." className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-3xl 
                    focus:outline-none focus:ring-0 bg-white" />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
          
          <Button type="submit" className="w-full bg-gradient-to-r from-[#7a5cff] to-[#f649a3] text-white font-semibold py-3.5 px-6 
            rounded-3xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
            transition-all duration-200 
            hover:-translate-y-1 hover:shadow-[0px_6px_18px_rgba(125,42,232,0.3)]
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a28eff]">
            Criar Receita
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="actions flex justify-center gap-3 md:gap-5 mt-8 flex-wrap">
          <div onClick={() => handleQuickAction("Relaxar")} className="action-button bg-white/60 hover:bg-white/80 border border-gray-200/80 text-gray-700 
            text-sm font-medium py-2.5 px-4 rounded-2xl cursor-pointer transition-colors duration-300">Relaxar</div>
          <div onClick={() => handleQuickAction("Dormir melhor")} className="action-button bg-white/60 hover:bg-white/80 border border-gray-200/80 text-gray-700 
            text-sm font-medium py-2.5 px-4 rounded-2xl cursor-pointer transition-colors duration-300">Dormir melhor</div>
          <div onClick={() => handleQuickAction("Alívio da tensão")} className="action-button bg-white/60 hover:bg-white/80 border border-gray-200/80 text-gray-700 
            text-sm font-medium py-2.5 px-4 rounded-2xl cursor-pointer transition-colors duration-300">Alívio da tensão</div>
        </div>

        <div className="warning mt-8 text-sm text-[#d1495b] bg-[#ffdada]/50 py-3 px-4 rounded-2xl">
          ⚠️ Estamos com alta demanda. Pode haver pequenos atrasos nas sugestões. Obrigada pela paciência!
        </div>
      </form>
    </div>;
};
export default StepHealthConcern;