'use client';

import React from 'react';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Nav from '@/components/Nav';

const RulesPage = () => {
  const rules = [
    { title: "Bądź miły", desc: "Zakaz wyzywania, przedrzeźniania i dokuczania.", fine: "1-5 FC" },
    { title: "Szczerość", desc: "Zgłaszaj zadania tylko wtedy, gdy faktycznie je wykonałeś.", fine: "Cofnięcie nagrody + 10 FC mandatu" },
    { title: "Zasady Sklepu", desc: "Nagrody ze sklepu realizujemy po uzgodnieniu z rodzicami.", fine: "-" },
    { title: "Czystość", desc: "Dbaj o porządek w pokoju i częściach wspólnych.", fine: "Konfiskata 2 FC" }
  ];

  return (
    <PrivateRoute>
      <div className="min-h-screen w-full max-w-xl mx-auto flex flex-col items-center py-5 px-4 pb-32">
        <div className="w-full mb-8 text-center">
            <h1 className="text-4xl font-black mb-2">Zasady ⚖️</h1>
            <p className="opacity-60 text-sm">Regulamin naszej wspólnej zabawy</p>
        </div>

        <div className="card bg-neutral text-neutral-content shadow-2xl w-full border-t-8 border-warning">
          <div className="card-body p-6 sm:p-8">
            <h2 className="card-title text-2xl font-black mb-6 flex items-center gap-2">
              <span className="bg-warning text-warning-content px-3 py-1 rounded-lg rotate-[-2deg]">KODEKS</span>
              RODZINNY
            </h2>
            
            <div className="grid gap-6">
              {rules.map((rule, i) => (
                <div key={i} className="group relative bg-base-100/10 p-5 rounded-2xl border border-white/5 hover:border-warning/30 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-warning/20 text-warning text-xs font-black h-5 w-5 flex items-center justify-center rounded-full shrink-0">
                          {i + 1}
                        </span>
                        <h4 className="font-black text-base sm:text-lg text-white group-hover:text-warning transition-colors">
                          {rule.title}
                        </h4>
                      </div>
                      <p className="text-sm opacity-70 leading-relaxed font-medium">
                        {rule.desc}
                      </p>
                    </div>
                    {rule.fine !== '-' && (
                      <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 mt-1 sm:mt-0">
                        <span className="text-[10px] font-bold uppercase opacity-40">Potencjalna kara:</span>
                        <div className="badge badge-warning font-black p-2 h-auto text-[10px] sm:text-xs whitespace-nowrap">
                          {rule.fine}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-warning/10 border-2 border-dashed border-warning/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-bold text-warning text-sm uppercase mb-1">Ważna uwaga:</h4>
                  <p className="text-xs opacity-80 leading-tight italic">
                    Admin ma zawsze ostateczne zdanie w kwestii interpretacji zasad. Pamiętaj, że aplikacja służy do zabawy i wspólnej nauki!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 opacity-30 text-[10px] text-center uppercase tracking-widest font-black">
          Ostatnia aktualizacja: Styczeń 2026
        </div>
      </div>
      <Nav />
    </PrivateRoute>
  );
};

export default RulesPage;
