import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. [검증 완료] 브라우저 테스트에 성공한 그 키를 여기에 넣으세요.
// trim()으로 앞뒤 공백을 깎고, replace로 보이지 않는 줄바꿈 문자를 완전히 제거합니다.
const MY_SECRET_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim().replace(/[\r\n]/gm, '');
export interface TranslationVariant {
  text: string;
  style: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey || MY_SECRET_KEY);
    // 2. [명칭 수정] 목록에서 확인된 최신 안정화 모델인 'gemini-2.0-flash-001'을 사용합니다.
    // 임시로 gemini-2.0-flash로 변경함 429 에러 때문에 
    // 할당량 0 때문에 1.5로 바꿨음
    // 다시 latest를 붙였음
    // 다시 처음으로 되돌아 옴
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
  }

  async translateToEnglish(koreanText: string): Promise<TranslationVariant[]> {
    
    try {
      const prompt = `Translate "${koreanText}" into 3 conversational English styles for my 5th-grade grandson in Canada: 
      1. Friendly (casual), 2. Warm (emotional), 3. Fun (energetic). 
      Respond ONLY in this JSON format: {"variants": [{"style": "친근한", "text": "..."}, {"style": "따뜻한", "text": "..."}, {"style": "재미있는", "text": "..."}]}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('데이터 파싱 실패');

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.variants;
    } catch (error) {
      console.error('Gemini API 최종 통신 실패:', error);
      // 에러 시 무한 로딩 방지용 예비 문구
      return [
        { style: '안내', text: "Gemini가 잠시 쉬고 싶대요. 5초 뒤에 다시 시도해 볼까요? 😊" },
        { style: '안내', text: "방금 문장은 조금 어려웠나? 다시 한번 버튼을 눌러주세요! ✨" },
        { style: '안내', text: "교통 체증이 있네요! 잠시 후에 다시 번역 버튼을 눌러주세요. ❤️" },
      ];
    }
  }
}

let geminiService: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiService) {
    geminiService = new GeminiService(MY_SECRET_KEY);
  }
  return geminiService;
};

// 키가 적혀있으면 무조건 통과되도록 설정
export const isGeminiInitialized = (): boolean => {
  return !!MY_SECRET_KEY && MY_SECRET_KEY.length > 10;
};

export const initGeminiService = (key: string) => { };