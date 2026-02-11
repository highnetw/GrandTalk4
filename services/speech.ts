// import Voice from '@react-native-voice/voice'; // ← 이 줄을 과감히 삭제하거나 주석 처리하세요!
import * as Speech from 'expo-speech';

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechService {
  private isListening: boolean = false;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor() {
    this.setupVoiceRecognition();
  }

  private setupVoiceRecognition() {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  private onSpeechStart = () => {
    console.log('✅ 음성 인식 시작');
    this.isListening = true;
  };

  private onSpeechEnd = () => {
    console.log('✅ 음성 인식 종료');
    this.isListening = false;
  };

  private onSpeechResults = (event: any) => {
    console.log('✅ 음성 인식 결과:', event.value);
    if (event.value && event.value.length > 0 && this.onResultCallback) {
      this.onResultCallback({
        text: event.value[0],
        confidence: 0.9,
        isFinal: true,
      });
    }
  };

  private onSpeechError = (event: any) => {
    console.error('❌ 음성 인식 에러:', event.error);
    if (this.onErrorCallback) {
      this.onErrorCallback(new Error(event.error?.message || '음성 인식 오류'));
    }
  };

  async startRecognition(
    language: 'ko-KR' | 'en-US',
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.onResultCallback = onResult;
      this.onErrorCallback = onError || null;

      console.log('🎤 음성 인식 시작 시도...');

      // Voice 초기화 확인
      const available = await Voice.isAvailable();
      console.log('Voice 사용 가능:', available);

      if (!available) {
        throw new Error('음성 인식을 사용할 수 없습니다');
      }

      // 음성 인식 시작
      await Voice.start(language);
      this.isListening = true;
      console.log('✅ Voice.start() 호출 완료');

    } catch (error: any) {
      console.error('❌ 음성 인식 시작 실패:', error);
      this.isListening = false;
      if (onError) {
        onError(error);
      }
    }
  }

  async stopRecognition(): Promise<void> {
    try {
      console.log('🛑 음성 인식 중지');
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('❌ 음성 인식 중지 실패:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      console.log('🧹 음성 인식 정리');
      await Voice.destroy();
      Voice.removeAllListeners();
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
    } catch (error) {
      console.error('❌ 음성 인식 정리 실패:', error);
    }
  }

  async speak(text: string, language: 'ko' | 'en'): Promise<void> {
    try {
      await Speech.speak(text, {
        language: language === 'ko' ? 'ko-KR' : 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('❌ TTS 오류:', error);
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// ✅ 싱글톤 인스턴스 생성
export const speechService = new SpeechService();
console.log('✅ speechService 초기화 완료');