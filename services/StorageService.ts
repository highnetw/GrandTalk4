import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. 대화 기록의 형태를 정의합니다.
export interface ChatHistory {
  id: string;
  korean: string;
  english: string;
  timestamp: number;
}

const STORAGE_KEY = '@grandtalk_history';

export const StorageService = {
  // 기록 저장하기
  async saveChat(korean: string, english: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        korean,
        english,
        timestamp: Date.now(),
      };
      
      // 최신 대화가 맨 위로 오게 저장
      const updatedHistory = [newChat, ...history];
      
      // 너무 많이 저장되면 느려질 수 있으니 최근 50개만 유지
      const limitedHistory = updatedHistory.slice(0, 50);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('저장 실패:', error);
    }
  },

  // 기록 불러오기
  async getHistory(): Promise<ChatHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('불러오기 실패:', error);
      return [];
    }
  },

  // 기록 전체 삭제 (필요할 때 사용)
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  }
};