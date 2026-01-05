
import { neon } from '@neondatabase/serverless';
import { SurveyEntry, SubscriptionType, TransactionType, TransactionStatus } from '../types';

const connectionString = 'postgresql://neondb_owner:npg_EAYFQJ8he7bL@ep-floral-bush-ahw8x81o-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

export const dbService = {
  // تهيئة الجدول إذا لم يكن موجوداً
  async initTable() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS survey_entries (
          id TEXT PRIMARY KEY,
          subscription_type TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          amount NUMERIC NOT NULL,
          bank_name TEXT NOT NULL,
          status TEXT NOT NULL,
          rejection_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Database table initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  },

  // جلب كافة السجلات
  async getAllEntries(): Promise<SurveyEntry[]> {
    try {
      const result = await sql`
        SELECT * FROM survey_entries 
        ORDER BY created_at DESC 
        LIMIT 50;
      `;
      
      return result.map(row => ({
        id: row.id,
        subscriptionType: row.subscription_type as SubscriptionType,
        transactionType: row.transaction_type as TransactionType,
        amount: Number(row.amount),
        bankName: row.bank_name,
        status: row.status as TransactionStatus,
        rejectionReason: row.rejection_reason,
        createdAt: new Date(row.created_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
  },

  // إضافة سجل جديد
  async addEntry(entry: SurveyEntry): Promise<boolean> {
    try {
      await sql`
        INSERT INTO survey_entries (
          id, subscription_type, transaction_type, amount, bank_name, status, rejection_reason, created_at
        ) VALUES (
          ${entry.id}, 
          ${entry.subscriptionType}, 
          ${entry.transactionType}, 
          ${entry.amount}, 
          ${entry.bankName}, 
          ${entry.status}, 
          ${entry.rejectionReason || null},
          ${entry.createdAt}
        );
      `;
      return true;
    } catch (error) {
      console.error('Error adding entry:', error);
      return false;
    }
  }
};
