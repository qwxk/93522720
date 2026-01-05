
import React from 'react';
import { ProblematicBankInfo } from '../App.tsx';

interface CriticalAlertProps {
  problematicBanks: ProblematicBankInfo[];
  onClose: () => void;
}

const CriticalAlert: React.FC<CriticalAlertProps> = ({ problematicBanks, onClose }) => {
  if (problematicBanks.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-rose-100 animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="bg-rose-500 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-black">تنبيه فني عاجل</h3>
          <p className="text-rose-100 text-sm font-bold mt-1">تم رصد مشاكل متكررة في الـ 24 ساعة الماضية</p>
        </div>
        
        <div className="p-8">
          <p className="text-slate-600 font-bold text-center mb-6 leading-relaxed">
            بناءً على تقارير المستخدمين، لوحظ تعثر في خدمات لي-باي مع المصارف التالية:
          </p>
          
          <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {problematicBanks.map((info, index) => (
              <div key={index} className="flex flex-col gap-2 p-5 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800 font-black">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {info.bankName}
                  </div>
                  <div className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-rose-200 text-rose-400">
                    {info.rejectionCount} حالات رفض
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {info.issueTypes.map((type, i) => (
                    <span key={i} className="px-3 py-1 bg-white text-rose-600 rounded-lg text-[11px] font-bold border border-rose-100 shadow-sm">
                      تعثر {type}
                    </span>
                  ))}
                  <div className="mr-auto text-[10px] font-bold text-rose-400 opacity-60">
                    آخر تعثر: {new Date(info.lastRejectionTime).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlert;
