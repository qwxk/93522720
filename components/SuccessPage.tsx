
import React from 'react';

interface SuccessPageProps {
  onReset: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onReset }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20">
          <svg className="w-12 h-12 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4">تم الإرسال بنجاح!</h2>
        <p className="text-slate-500 font-bold leading-relaxed mb-8">
          شكراً لمساهمتك في تطوير خدمات الدفع الإلكتروني. تم تسجيل بياناتك بنجاح في قاعدة بيانات لي-باي.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onReset}
            className="w-full py-4 bg-[#17A3DD] hover:bg-[#1282b1] text-white font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة استبيان آخر
          </button>
          
          <button
            onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            مشاهدة النتائج الحية
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
