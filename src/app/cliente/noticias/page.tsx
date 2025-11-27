'use client';

import IndustryNewsFeed from '@/components/cliente/IndustryNewsFeed';

export default function NoticiasPage() {
  return (
    <div className="pb-20">
      <IndustryNewsFeed industry="marketing_digital" clientName="Sua Empresa" />
    </div>
  );
}

