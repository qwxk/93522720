
import React, { useState } from 'react';
import { SubscriptionType, TransactionType, TransactionStatus, SurveyEntry } from '../types.ts';
import { LIBYAN_BANKS } from '../constants.ts';

interface SurveyFormProps {
  onSubmit: (entry: SurveyEntry) => Promise<void>;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(SubscriptionType.INDIVIDUAL);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.TRANSFER);
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>(LIBYAN_BANKS[0]);
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.COMPLETED);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const entry: SurveyEntry = {
      id: crypto.randomUUID(),
      subscriptionType,
      transactionType,
      amount: parseFloat(amount) || 0,
      bankName,
      status,
      rejectionReason: status === TransactionStatus.REJECTED ? rejectionReason : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await onSubmit(entry);
      setAmount('');
      setRejectionReason('');
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="submit" className="py-12 -mt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-slate-50">
            <h2 className="text-2xl font-black text-gray-900">نموذج الاستبيان</h2>
            <p className="text-slate-500 font-medium mt-1">يرجى تعبئة البيانات المطلوبة بدقة ليتم حفظها في قاعدة البيانات.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع الاشتراك</label>
                <div className="flex gap-2">
                  {Object.values(SubscriptionType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSubscriptionType(type)}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                        subscriptionType === type 
                          ? 'border-[#17A3DD] bg-[#17A3DD] text-white' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع العملية</label>
                <div className="flex gap-2">
                  {Object.values(TransactionType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransactionType(type)}
                      className={`flex-1 py-3 px-1 rounded-xl border-2 font-bold text-xs transition-all ${
                        transactionType === type 
                          ? 'border-[#4EB3A7] bg-[#4EB3A7] text-white' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">القيمة (د.ل)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#17A3DD] focus:ring-0 outline-none transition-all font-bold"
                  placeholder="مثال: 150"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المصرف</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#17A3DD] focus:ring-0 outline-none transition-all font-bold"
                >
                  {LIBYAN_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">حالة العملية</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(TransactionStatus.COMPLETED)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                    status === TransactionStatus.COMPLETED 
                      ? 'border-[#A4CE39] bg-[#A4CE39] text-white' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  {TransactionStatus.COMPLETED}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(TransactionStatus.REJECTED)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                    status === TransactionStatus.REJECTED 
                      ? 'border-rose-500 bg-rose-500 text-white' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  {TransactionStatus.REJECTED}
                </button>
              </div>
            </div>

            {status === TransactionStatus.REJECTED && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">سبب الرفض</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 outline-none transition-all"
                  placeholder="لماذا تم رفض العملية؟"
                  rows={2}
                ></textarea>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all flex items-center justify-center gap-3 ${
                isSubmitting ? 'bg-slate-300' : 'bg-[#17A3DD] hover:bg-[#1282b1] shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'جاري الحفظ في PostgreSQL...' : 'إرسال الاستطلاع'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SurveyForm;
