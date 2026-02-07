import { getGeminiService, isGeminiInitialized, TranslationVariant } from '@/services/gemini';
import { speechService } from '@/services/speech';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CommentWriterScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Gemini 초기화 확인
  useEffect(() => {
    if (!isGeminiInitialized()) {
      Alert.alert(
        'API 키 필요',
        'Gemini API 키를 먼저 설정해주세요.',
        [
          {
            text: '설정으로 이동',
            onPress: () => router.push('/(tabs)/settings'),
          },
          {
            text: '취소',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, []);

  // 음성 인식 시작
  const startListening = async () => {
    try {
      setIsListening(true);
      await speechService.startRecognition(
        'ko-KR',
        (result) => {
          if (result.isFinal) {
            setRecognizedText(result.text);
            setIsListening(false);
          }
        },
        (error) => {
          Alert.alert('오류', '음성 인식에 실패했습니다: ' + error.message);
          setIsListening(false);
        }
      );
    } catch (error: any) {
      Alert.alert('오류', '음성 인식을 시작할 수 없습니다: ' + error.message);
      setIsListening(false);
    }
  };

  // 음성 인식 중지
  const stopListening = async () => {
    await speechService.stopRecognition();
    setIsListening(false);
  };

  // 번역 시작
  const startTranslation = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '먼저 음성을 입력해주세요');
      return;
    }

    if (!isGeminiInitialized()) {
      Alert.alert('오류', 'Gemini API 키가 설정되지 않았습니다');
      return;
    }

    try {
      setIsTranslating(true);
      setTranslations([]);
      setSelectedIndex(null);

      const gemini = getGeminiService();
      const results = await gemini.translateToEnglish(recognizedText);
      
      setTranslations(results);
    } catch (error: any) {
      Alert.alert('오류', error.message || '번역에 실패했습니다');
    } finally {
      setIsTranslating(false);
    }
  };

  // 번역 선택 및 복사
  const selectAndCopy = async (index: number) => {
    setSelectedIndex(index);
    const selectedText = translations[index].text;
    
    // 클립보드 복사 (최신 API)
    await Clipboard.setStringAsync(selectedText);
    
    Alert.alert(
      '복사 완료! 📋',
      '클립보드에 복사되었습니다.\n블로그에 붙여넣기 하세요!',
      [
        {
          text: '확인',
          onPress: () => {
            // 초기화
            setTimeout(() => {
              setRecognizedText('');
              setTranslations([]);
              setSelectedIndex(null);
            }, 500);
          },
        },
      ]
    );
  };

  // 초기화
  const reset = () => {
    setRecognizedText('');
    setTranslations([]);
    setSelectedIndex(null);
  };

  // 정리 (메모리 관리)
  useEffect(() => {
    return () => {
      speechService.destroy();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>댓글 작성 도우미</Text>
        <TouchableOpacity onPress={reset} style={styles.resetButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
      >
        {/* Step 1: 음성 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 한글로 말씀하세요 🎤</Text>
          
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={isListening ? stopListening : startListening}
            disabled={isTranslating}
          >
            <Ionicons
              name={isListening ? 'stop-circle' : 'mic'}
              size={60}
              color="#fff"
            />
            <Text style={styles.micButtonText}>
              {isListening ? '🎙️ 듣는 중...' : '탭하여 말하기'}
            </Text>
          </TouchableOpacity>

          {recognizedText && (
            <View style={styles.recognizedBox}>
              <Text style={styles.recognizedLabel}>인식된 텍스트:</Text>
              <Text style={styles.recognizedText}>{recognizedText}</Text>
            </View>
          )}
        </View>

        {/* Step 2: 번역하기 */}
        {recognizedText && !isTranslating && translations.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 영어로 번역하기 🌐</Text>
            <TouchableOpacity
              style={styles.translateButton}
              onPress={startTranslation}
            >
              <Ionicons name="language" size={24} color="#fff" />
              <Text style={styles.translateButtonText}>번역 시작</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 번역 중 로딩 */}
        {isTranslating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e91e63" />
            <Text style={styles.loadingText}>
              AI가 손자에게 맞는{'\n'}표현으로 번역 중...
            </Text>
          </View>
        )}

        {/* Step 3: 번역 결과 선택 */}
        {translations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 마음에 드는 번역을 선택하세요 ✨</Text>
            
            {translations.map((variant, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.translationCard,
                  selectedIndex === index && styles.translationCardSelected,
                ]}
                onPress={() => selectAndCopy(index)}
              >
                <View style={styles.translationHeader}>
                  <Text style={styles.translationStyle}>
                    {variant.style} 스타일
                  </Text>
                  {selectedIndex === index && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.translationText}>{variant.text}</Text>
                <View style={styles.translationFooter}>
                  <Ionicons name="copy-outline" size={16} color="#aaa" />
                  <Text style={styles.translationFooterText}>
                    탭하여 복사
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={startTranslation}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>다시 만들기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  micButton: {
    backgroundColor: '#e91e63',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  micButtonActive: {
    backgroundColor: '#c2185b',
  },
  micButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  recognizedBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recognizedLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  recognizedText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 30,
  },
  translateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  translationCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  translationCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2f1a',
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  translationStyle: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '600',
  },
  translationText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 12,
  },
  translationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  translationFooterText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 4,
  },
  retryButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});