"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// GUIDED TOUR - VALLE AI
// Tour guiado para primeira visita do cliente
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// ============================================

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector do elemento alvo
  position: "top" | "bottom" | "left" | "right" | "center";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo à Valle 360!",
    description: "Vamos fazer um tour rápido para você conhecer todas as funcionalidades disponíveis.",
    position: "center",
  },
  {
    id: "dashboard",
    title: "Seu Dashboard",
    description: "Aqui você encontra uma visão geral do desempenho das suas campanhas, métricas importantes e insights da Val.",
    position: "center",
  },
  {
    id: "intelligence",
    title: "Central de Inteligência",
    description: "Acesse análises detalhadas sobre desempenho, seu setor, concorrentes e insights personalizados da IA.",
    position: "center",
  },
  {
    id: "approvals",
    title: "Aprovações",
    description: "Revise e aprove materiais criados pela nossa equipe. Mantenha seus projetos sempre em dia!",
    position: "center",
  },
  {
    id: "val",
    title: "Conheça a Val",
    description: "A Val é sua assistente IA. Clique no botão flutuante para tirar dúvidas e receber sugestões.",
    position: "center",
  },
  {
    id: "finish",
    title: "Pronto para começar!",
    description: "Você já conhece o básico. Explore à vontade e conte com a gente para qualquer dúvida!",
    position: "center",
  },
];

export function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verificar se é a primeira visita
    const hasSeenTour = localStorage.getItem("valle_tour_completed");
    if (!hasSeenTour) {
      // Esperar um pouco para o dashboard carregar
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("valle_tour_completed", "true");
    setIsOpen(false);
  };

  const skipTour = () => {
    localStorage.setItem("valle_tour_completed", "true");
    setIsOpen(false);
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed z-[101] w-[90%] max-w-md",
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
          >
            <div className="bg-white dark:bg-[#0a0f1a] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header com ilustração */}
              <div className="bg-gradient-to-br from-[#001533] to-[#1672d6] p-6 text-center">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="size-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4"
                >
                  <Sparkles className="size-8 text-white" />
                </motion.div>
                
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === currentStep 
                          ? "w-8 bg-white" 
                          : index < currentStep 
                            ? "w-1.5 bg-white/60" 
                            : "w-1.5 bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-[#001533] dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#001533]/70 dark:text-white/70">
                    {step.description}
                  </p>
                </motion.div>

                {/* Step counter */}
                <p className="text-sm text-[#001533]/50 dark:text-white/50 mt-4">
                  Passo {currentStep + 1} de {tourSteps.length}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="text-sm text-[#001533]/50 dark:text-white/50 hover:text-[#001533] dark:hover:text-white transition-colors"
                >
                  Pular tour
                </button>

                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      className="border-[#001533]/20"
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Voltar
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-[#1672d6] hover:bg-[#1260b5] text-white"
                  >
                    {isLastStep ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Começar
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="size-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Botão para reiniciar o tour (pode ser usado em configurações)
export function RestartTourButton() {
  const handleRestart = () => {
    localStorage.removeItem("valle_tour_completed");
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestart}
      className="border-[#1672d6]/30 text-[#1672d6]"
    >
      <Sparkles className="size-4 mr-2" />
      Refazer Tour
    </Button>
  );
}

