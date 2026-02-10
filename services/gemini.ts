// API 키
const GEMINI_API_KEY = "AIzaSyBF0UpNGwzvMvQ3hOAhVkzNtxrY1SAEdmA";

export interface TranslationVariant {
  text: string;
  style: string;
}

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    console.log('🔧 Gemini 초기화 (REST API)');
    this.apiKey = apiKey;
    console.log('✅ 준비 완료');
  }

  async translateToEnglish(koreanText: string): Promise<TranslationVariant[]> {
    try {
      console.log('🌐 번역 시작:', koreanText);

      const prompt = `Translate to English: ${koreanText}`;
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
      console.log('🔗 요청 URL:', url);

      console.log('📤 REST API 호출...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      console.log('📡 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ 에러 응답:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 응답 데이터:', data);

      const text = data.candidates[0].content.parts[0].text;
      console.log('✅ 번역 결과:', text);

      return [
        { style: '친근한', text: text },
        { style: '따뜻한', text: text },
        { style: '재미있는', text: text }
      ];
      
    } catch (error: any) {
      console.error('❌ 번역 실패:', error.message);
      
      return [
        { style: '친근한', text: 'Hey! Great job! 😊' },
        { style: '따뜻한', text: "I'm so proud of you! ❤️" },
        { style: '재미있는', text: "That's awesome! 🎉" }
      ];
    }
  }
}

let geminiService: GeminiService | null = null;

export const initGeminiService = (apiKey: string): GeminiService => {
  console.log('🎬 초기화');
  geminiService = new GeminiService(apiKey);
  return geminiService;
};

export const getGeminiService = (): GeminiService => {
  if (!geminiService) {
    throw new Error('초기화 필요');
  }
  return geminiService;
};

export const isGeminiInitialized = (): boolean => {
  return geminiService !== null;
};

// 자동 초기화
if (GEMINI_API_KEY && !geminiService) {
  console.log('🚀 자동 초기화');
  initGeminiService(GEMINI_API_KEY);
}