import { getGeminiService, isGeminiInitialized, TranslationVariant } from '@/services/gemini';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CommentWriterScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isGeminiInitialized()) {
      Alert.alert(
        'API 키 필요',
        'Gemini API 키를 먼저 설정해주세요.',
        [
          { text: '설정으로 이동', onPress: () => router.push('/(tabs)/settings') },
          { text: '취소', onPress: () => router.back() },
        ]
      );
    }
  }, []);

  const handleMicPress = () => {
    setRecognizedText('');
    setTranslations([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const startTranslation = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '한글 내용을 입력하거나 말씀해 주세요.');
      return;
    }

    try {
      Keyboard.dismiss();
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

  const selectAndCopy = async (index: number) => {
    setSelectedIndex(index);
    const selectedText = translations[index].text;
    await Clipboard.setStringAsync(selectedText);

    Alert.alert(
      '복사 완료! 📋',
      '클립보드에 복사되었습니다.',
      [{ text: '확인' }]
    );
  };

  const reset = () => {
    setRecognizedText('');
    setTranslations([]);
    setSelectedIndex(null);
  };

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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* 마이크 버튼 섹션: 안내 문구 삭제하고 버튼만 깔끔하게 배치 */}
        <View style={styles.micSection}>
          <TouchableOpacity style={styles.bigMicButton} onPress={handleMicPress}>
            <Ionicons name="mic" size={50} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 입력 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>한글 입력</Text>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="마이크 버튼을 누르거나 직접 입력하세요"
            placeholderTextColor="#666"
            value={recognizedText}
            onChangeText={setRecognizedText}
            multiline
            numberOfLines={4}
            showSoftInputOnFocus={true}
          />
        </View>

        {/* 번역 실행 버튼 */}
        {recognizedText.trim().length > 0 && !isTranslating && translations.length === 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.translateButton} onPress={startTranslation}>
              <Ionicons name="language" size={24} color="#fff" />
              <Text style={styles.translateButtonText}>영어로 번역하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 로딩 표시 */}
        {isTranslating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e91e63" />
            <Text style={styles.loadingText}>AI 번역 중...</Text>
          </View>
        )}

        {/* 번역 결과 */}
        {translations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>번역 결과 (탭하여 복사)</Text>
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
                  <Text style={styles.translationStyle}>{variant.style}</Text>
                  {selectedIndex === index && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
                </View>
                <Text style={styles.translationText}>{variant.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#16213e' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backButton: { padding: 8 },
  resetButton: { padding: 8 },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  
  micSection: { 
    alignItems: 'center', 
    paddingVertical: 30, 
    backgroundColor: '#16213e', 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25, 
    marginBottom: 10 
  },
  bigMicButton: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#e91e63', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8 
  },

  section: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#aaa', marginBottom: 8 },
  
  textInput: { 
    backgroundColor: '#060f2b', 
    borderRadius: 12, 
    padding: 16, 
    color: '#fff', 
    fontSize: 20, 
    minHeight: 120, 
    textAlignVertical: 'top', 
    borderWidth: 1, 
    borderColor: '#4CAF50' 
  },
  
  translateButton: { 
    backgroundColor: '#2196F3', 
    borderRadius: 12, 
    padding: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10
  },
  translateButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 8 },
  
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  
  translationCard: { 
    backgroundColor: '#16213e', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  translationCardSelected: { borderColor: '#4CAF50', backgroundColor: '#1a2f1a' },
  translationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  translationStyle: { fontSize: 16, color: '#e91e63', fontWeight: 'bold', textTransform: 'uppercase' },
  translationText: { fontSize: 24, color: '#fff', lineHeight: 26 },
});