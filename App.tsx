
import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import SurveyForm from './components/SurveyForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import SuccessPage from './components/SuccessPage.tsx';
import CriticalAlert from './components/CriticalAlert.tsx';
import { SurveyEntry, TransactionType, TransactionStatus, SubscriptionType } from './types.ts';
import { dbService } from './services/dbService.ts';

export interface ProblematicBankInfo {
  bankName: string;
  issueTypes: string[];
  lastRejectionTime: string;
  rejectionCount: number;
}

export default function App() {
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [problematicBanks, setProblematicBanks] = useState<ProblematicBankInfo[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  // منطق التنبيه الحرج والمشاكل الفنية (نافذة 24 ساعة متحركة)
  const checkCriticalIssues = (allEntries: SurveyEntry[]) => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const recentEntries = allEntries.filter(e => 
      new Date(e.createdAt).getTime() > twentyFourHoursAgo
    );

    const bankStats: Record<string, { rejections: SurveyEntry[], completionsCount: number }> = {};
    
    recentEntries.forEach(entry => {
      if (!bankStats[entry.bankName]) {
        bankStats[entry.bankName] = { rejections: [], completionsCount: 0 };
      }
      
      if (entry.status === TransactionStatus.REJECTED) {
        bankStats[entry.bankName].rejections.push(entry);
      } else if (entry.status === TransactionStatus.COMPLETED) {
        bankStats[entry.bankName].completionsCount += 1;
      }
    });

    const issues: ProblematicBankInfo[] = [];

    Object.keys(bankStats).forEach(bank => {
      const stats = bankStats[bank];
      
      // قاعدة العرض: وجود رفض + أقل من حالتي اكتمال للتعافي
      if (stats.rejections.length > 0 && stats.completionsCount < 2) {
        const sortedRejections = [...stats.rejections].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const uniqueIssueTypes = Array.from(new Set(stats.rejections.map(e => e.transactionType)));
        
        issues.push({
          bankName: bank,
          issueTypes: uniqueIssueTypes,
          lastRejectionTime: sortedRejections[0].createdAt,
          rejectionCount: stats.rejections.length
        });
      }
    });
    
    issues.sort((a, b) => new Date(b.lastRejectionTime).getTime() - new Date(a.lastRejectionTime).getTime());

    setProblematicBanks(issues);
    if (issues.length > 0) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await dbService.initTable();
      const data = await dbService.getAllEntries();
      setEntries(data);
      checkCriticalIssues(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEntry = async (entry: SurveyEntry) => {
    const success = await dbService.addEntry(entry);
    if (success) {
      const updatedEntries = [entry, ...entries];
      setEntries(updatedEntries);
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      checkCriticalIssues(updatedEntries);
    } else {
      alert("عذراً، حدث خطأ أثناء الاتصال بقاعدة البيانات.");
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.TRANSFER: 
        return (
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 border border-blue-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case TransactionType.RECEIVE: 
        return (
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        );
      case TransactionType.QR_PAY: 
        return (
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M7 7h.01M17 7h.01M7 17h.01" />
            </svg>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      
      {showAlert && (
        <CriticalAlert 
          problematicBanks={problematicBanks} 
          onClose={() => setShowAlert(false)} 
        />
      )}

      <main className="flex-grow">
        <div className="bg-[#17A3DD] text-white py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-right">
            <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  نظام استطلاع <br /> خدمة <span className="text-[#A4CE39]">لي-باي</span>
                </h1>
                <p className="text-lg md:text-xl text-blue-50 font-medium leading-relaxed mb-8 opacity-90">
                  حلّل بيانات الدفع الإلكتروني، راقب استقرار المصارف، وساهم في تحسين التجربة المالية.
                </p>
                {!showSuccess && (
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <a href="#submit" className="px-8 py-3.5 bg-white text-[#17A3DD] rounded-xl font-bold text-lg hover:bg-[#A4CE39] hover:text-white transition-all shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ابدأ الآن
                      </a>
                      <a href="#stats" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        النتائج الحية
                      </a>
                  </div>
                )}
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#A4CE39] rounded-full blur-3xl"></div>
          </div>
        </div>

        {showSuccess ? (
          <SuccessPage onReset={() => setShowSuccess(false)} />
        ) : (
          <SurveyForm onSubmit={handleAddEntry} />
        )}
        
        <Dashboard entries={entries} problematicBanks={problematicBanks} />

        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="relative">
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-[#17A3DD] rounded-full"></div>
                    <h3 className="text-3xl font-black text-slate-900 pr-2">
                      سجل الاستطلاعات الأخيرة
                    </h3>
                    <p className="text-slate-500 font-bold mt-2 pr-2">متابعة دقيقة وشاملة لآخر العمليات المسجلة في النظام</p>
                </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative min-h-[400px]">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-[#17A3DD] rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-bold">جاري جلب البيانات من PostgreSQL...</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-400 font-black border-b border-slate-100">
                        <th className="px-8 py-6 text-xs uppercase tracking-wider">المصرف</th>
                        <th className="px-8 py-6 text-xs uppercase tracking-wider">نوع العملية</th>
                        <th className="px-8 py-6 text-xs uppercase tracking-wider text-center">الاشتراك</th>
                        <th className="px-8 py-6 text-xs uppercase tracking-wider">القيمة</th>
                        <th className="px-8 py-6 text-xs uppercase tracking-wider">الحالة</th>
                        <th className="px-8 py-6 text-xs uppercase tracking-wider">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-base group-hover:text-[#17A3DD] transition-colors">{entry.bankName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(entry.transactionType)}
                              <span className="text-slate-600 font-black">{entry.transactionType}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black inline-block min-w-[80px] ${
                              entry.subscriptionType === SubscriptionType.INDIVIDUAL 
                              ? 'bg-blue-100/50 text-[#17A3DD]' 
                              : 'bg-indigo-100/50 text-indigo-700'
                            }`}>
                              {entry.subscriptionType}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg">
                                {Number(entry.amount).toLocaleString('ar-LY')}
                                <span className="text-[10px] text-slate-400 mr-1 font-bold">د.ل</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black ${
                              entry.status === TransactionStatus.COMPLETED 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${entry.status === TransactionStatus.COMPLETED ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-start">
                              <span className="text-slate-700 font-black">{new Date(entry.createdAt).toLocaleDateString('ar-LY')}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{new Date(entry.createdAt).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
