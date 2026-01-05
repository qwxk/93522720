
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SurveyEntry, TransactionStatus, TransactionType } from '../types';
import { BRAND_COLORS } from '../constants';

interface DashboardProps {
  entries: SurveyEntry[];
}

type TimeRange = 'all' | 'today' | 'week' | 'month';

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      if (timeRange === 'today') {
        return entryDate.toDateString() === now.toDateString();
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
      return true;
    });
  }, [entries, timeRange]);

  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const completed = filteredEntries.filter(e => e.status === TransactionStatus.COMPLETED).length;
    const rejected = total - completed;
    const stabilityRate = total > 0 ? (completed / total) * 100 : 0;

    // Amounts by type
    const amounts = filteredEntries.reduce((acc, curr) => {
      if (curr.status === TransactionStatus.COMPLETED) {
        acc[curr.transactionType] = (acc[curr.transactionType] || 0) + curr.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const bankGroups = filteredEntries.reduce((acc: Record<string, { total: number; completed: number; rejected: number }>, curr) => {
      if (!acc[curr.bankName]) acc[curr.bankName] = { total: 0, completed: 0, rejected: 0 };
      acc[curr.bankName].total += 1;
      if (curr.status === TransactionStatus.COMPLETED) {
        acc[curr.bankName].completed += 1;
      } else {
        acc[curr.bankName].rejected += 1;
      }
      return acc;
    }, {});

    const problematicBanksList = Object.keys(bankGroups)
      .map(bank => ({
        fullName: bank,
        rejected: bankGroups[bank].rejected,
        total: bankGroups[bank].total,
        rejectionRate: bankGroups[bank].total > 0 ? (bankGroups[bank].rejected / bankGroups[bank].total) * 100 : 0
      }))
      .filter(b => b.rejected > 0)
      .sort((a, b) => b.rejected - a.rejected)
      .slice(0, 5);

    return { total, completed, rejected, stabilityRate, amounts, problematicBanksList };
  }, [filteredEntries]);

  const COLORS = [BRAND_COLORS.lime, '#F43F5E'];
  const pieData = [
    { name: 'مكتملة', value: stats.completed },
    { name: 'مرفوضة', value: stats.rejected }
  ];

  const timeOptions: { label: string, value: TimeRange }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'اليوم', value: 'today' },
    { label: 'آخر 7 أيام', value: 'week' },
    { label: 'آخر 30 يوماً', value: 'month' }
  ];

  return (
    <section id="stats" className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-3xl font-black text-slate-900">إحصائيات الأداء</h2>
            <p className="text-slate-500 font-bold mt-1">تحليل التدفقات النقدية وكفاءة النظام</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  timeRange === opt.value 
                    ? 'bg-white text-[#17A3DD] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Type Values Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* QR Card */}
          <div className="bg-purple-50 p-8 rounded-[2rem] border border-purple-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl group-hover:bg-purple-200/50 transition-colors"></div>
             <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-purple-700/60 uppercase mb-1">إجمالي دفع QR</p>
                <p className="text-3xl font-black text-purple-900">
                  {(stats.amounts[TransactionType.QR_PAY] || 0).toLocaleString('ar-LY')}
                  <span className="text-xs mr-1 font-bold">د.ل</span>
                </p>
             </div>
          </div>

          {/* Transfer Card */}
          <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
             <div className="relative z-10">
                <div className="w-12 h-12 bg-[#17A3DD] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-sm font-black text-blue-700/60 uppercase mb-1">إجمالي التحويلات</p>
                <p className="text-3xl font-black text-blue-900">
                  {(stats.amounts[TransactionType.TRANSFER] || 0).toLocaleString('ar-LY')}
                  <span className="text-xs mr-1 font-bold">د.ل</span>
                </p>
             </div>
          </div>

          {/* Receive Card */}
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-colors"></div>
             <div className="relative z-10">
                <div className="w-12 h-12 bg-[#4EB3A7] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <p className="text-sm font-black text-emerald-700/60 uppercase mb-1">إجمالي الاستلام</p>
                <p className="text-3xl font-black text-emerald-900">
                  {(stats.amounts[TransactionType.RECEIVE] || 0).toLocaleString('ar-LY')}
                  <span className="text-xs mr-1 font-bold">د.ل</span>
                </p>
             </div>
          </div>
        </div>

        {/* Charts & Basic Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Efficiency Pie Chart */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-xl font-black text-slate-800 mb-8">كفاءة العمليات المكتملة</h3>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="h-64 w-full md:w-1/2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={75} 
                      outerRadius={105} 
                      paddingAngle={10} 
                      dataKey="value" 
                      stroke="none"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-800 leading-none">{stats.stabilityRate.toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-400 font-black mt-1 uppercase">استقرار</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">ناجحة</span>
                  <span className="text-xl font-black text-emerald-800">{stats.completed}</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-700">مرفوضة</span>
                  <span className="text-xl font-black text-rose-800">{stats.rejected}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">الإجمالي</span>
                  <span className="text-xl font-black text-slate-800">{stats.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection List */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-800">مشاكل فنية داخلية</h3>
             </div>
             <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.problematicBanksList.length > 0 ? stats.problematicBanksList.map((bank, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all hover:-translate-x-1">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">{idx+1}</span>
                      <span className="font-bold text-slate-700">{bank.fullName}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">الرفض</p>
                        <p className="font-black text-rose-500">{bank.rejected}</p>
                      </div>
                      <div className="text-left w-12">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">النسبة</p>
                        <p className="font-black text-slate-600">{bank.rejectionRate.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-bold">لا توجد حالات رفض مسجلة</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
