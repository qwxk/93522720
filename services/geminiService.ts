
import { GoogleGenAI } from "@google/genai";
import { SurveyEntry } from "../types";

export const analyzeSurveyData = async (entries: SurveyEntry[]) => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (entries.length === 0) return "لا توجد بيانات كافية للتحليل حالياً.";

  const prompt = `
    Analyze the following survey data for LYPay (payment service).
    Summarize the overall satisfaction based on status.
    Identify any problematic banks or recurring issues in the rejection reasons.
    Provide actionable insights in Arabic.
    
    Data Summary:
    Total Entries: ${entries.length}
    Status Breakdown: ${JSON.stringify(
      entries.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {})
    )}
    Rejection Reasons: ${entries.filter(e => e.rejectionReason).map(e => e.rejectionReason).join(', ')}
  `;

  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "أنت محلل بيانات متخصص في القطاع المصرفي. قدم تحليلاً دقيقاً ومختصراً باللغة العربية الفصحى."
      }
    });

    // Access the text property directly (not a method)
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "حدث خطأ أثناء محاولة تحليل البيانات عبر الذكاء الاصطناعي.";
  }
};
