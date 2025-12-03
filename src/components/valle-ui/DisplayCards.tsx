"use client";

import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Users, FileText, BarChart3 } from "lucide-react";
import { ReactNode } from "react";

// ============================================
// DISPLAY CARDS - VALLE AI
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// Baseado em: https://21st.dev/r/Codehagen/display-cards
// ============================================

interface DisplayCardProps {
  className?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-white" />,
  title = "Destaque",
  description = "Descubra conteúdos incríveis",
  date = "Agora mesmo",
  iconClassName = "bg-[#1672d6]",
  titleClassName = "text-[#1672d6]",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        // Layout base
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between",
        // Estilo do card - usando cores Valle AI
        "rounded-xl border-2 border-[#001533]/10 bg-white/90 dark:bg-[#001533]/90",
        "backdrop-blur-sm px-4 py-3",
        // Transições
        "transition-all duration-500",
        // Efeito de fade à direita
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem]",
        "after:bg-gradient-to-l after:from-white dark:after:from-[#001533] after:to-transparent after:content-['']",
        // Hover states
        "hover:border-[#1672d6]/30 hover:bg-white dark:hover:bg-[#001533]",
        "hover:shadow-lg hover:shadow-[#1672d6]/10",
        // Flex children
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      {/* Header com ícone e título */}
      <div>
        <span className={cn(
          "relative inline-block rounded-full p-1.5",
          iconClassName
        )}>
          {icon}
        </span>
        <p className={cn("text-lg font-semibold", titleClassName)}>{title}</p>
      </div>
      
      {/* Descrição */}
      <p className="whitespace-nowrap text-base text-[#001533] dark:text-white/90">
        {description}
      </p>
      
      {/* Data */}
      <p className="text-sm text-[#001533]/60 dark:text-white/60">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export function DisplayCards({ cards }: DisplayCardsProps) {
  // Cards padrão com visual Valle AI
  const defaultCards: DisplayCardProps[] = [
    {
      icon: <TrendingUp className="size-4 text-white" />,
      title: "Crescimento",
      description: "Suas métricas subiram 23% este mês",
      date: "Atualizado há 2h",
      iconClassName: "bg-[#1672d6]",
      titleClassName: "text-[#1672d6]",
      className: cn(
        "[grid-area:stack] hover:-translate-y-10",
        // Overlay escuro quando não está em hover
        "before:absolute before:w-full before:h-full before:rounded-xl",
        "before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0",
        "before:transition-opacity before:duration-500",
        "hover:before:opacity-0",
        // Grayscale removido no hover
        "grayscale-[30%] hover:grayscale-0"
      ),
    },
    {
      icon: <Users className="size-4 text-white" />,
      title: "Engajamento",
      description: "1.2k novas interações com seu conteúdo",
      date: "Atualizado há 5h",
      iconClassName: "bg-[#001533]",
      titleClassName: "text-[#001533] dark:text-white",
      className: cn(
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1",
        "before:absolute before:w-full before:h-full before:rounded-xl",
        "before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0",
        "before:transition-opacity before:duration-500",
        "hover:before:opacity-0",
        "grayscale-[30%] hover:grayscale-0"
      ),
    },
    {
      icon: <BarChart3 className="size-4 text-white" />,
      title: "Resultados",
      description: "ROI de 320% nas campanhas ativas",
      date: "Atualizado agora",
      iconClassName: "bg-[#1672d6]",
      titleClassName: "text-[#1672d6]",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

// Exportar também o card individual para uso customizado
export { DisplayCard };
export type { DisplayCardProps, DisplayCardsProps };
