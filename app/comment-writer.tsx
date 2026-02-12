import { getGeminiService, isGeminiInitialized, TranslationVariant } from '@/services/gemini';
import { StorageService } from '@/services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CommentWriterScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [recognizedText, setRecognizedText] = useState(''); // 정상 선언됨
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isGeminiInitialized()) {
      Alert.alert('API 키 필요', 'Gemini API 키를 먼저 설정해주세요.', [
        { text: '설정으로 이동', onPress: () => router.push('/(tabs)/settings') },
        { text: '취소', onPress: () => router.back() },
      ]);
    }
  }, []);

  const startTranslation = async () => {
    if (!recognizedText.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      Keyboard.dismiss();
      setIsTranslating(true);
      setTranslations([]); // 결과만 지웁니다 (입력한 글자는 유지)

      const gemini = getGeminiService();
      const results = await gemini.translateToEnglish(recognizedText);
      setTranslations(results);

      if (results && results.length > 0) {
        await StorageService.saveChat(recognizedText, results[0].text);
      }
} catch (error: any) {
  // 시스템의 빨간 에러창 대신, 부드러운 알림창을 띄웁니다.
  Alert.alert(
    '잠시만요! 😊', 
    '지금 gemini가 너무 열심히 일해서 조금 숨이 찬가 봐요.\n\n5초만 쉬었다가 다시 [번역] 버튼을 눌러주시겠어요?',
    [{ text: '알겠어요', onPress: () => setIsTranslating(false) }]
  );
} finally {
  setIsTranslating(false);
}
  };

  const selectAndCopy = async (index: number) => {
    setSelectedIndex(index);
    await Clipboard.setStringAsync(translations[index].text);
    Alert.alert('복사 완료! 📋', '클립보드에 저장되었습니다.');
  };

  // 새로고침 버튼 눌렀을 때의 동작
  const handleReset = () => {
    // 입력한 글자까지 싹 지우고 싶을 때만 사용
    setRecognizedText(''); 
    setTranslations([]);
    setSelectedIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>댓글 작성 도우미</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.micSection}>
            <TouchableOpacity style={styles.bigMicButton} onPress={() => inputRef.current?.focus()}>
              <Ionicons name="mic" size={50} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.micHint}>한글로 말씀하시거나 입력하세요</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="클릭해서 내용을 입력하세요..."
                placeholderTextColor="#666"
                value={recognizedText}
                onChangeText={(text) => setRecognizedText(text)} // 명시적으로 연결
                multiline
              />
              {recognizedText.length > 0 && (
                <TouchableOpacity style={styles.sendButton} onPress={startTranslation}>
                  <Ionicons name="send" size={28} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isTranslating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>AI가 번역 중입니다... 잠시만 기다려주세요 😊</Text>
            </View>
          )}

          {translations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>번역 결과 (탭하여 복사)</Text>
              {translations.map((variant, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.translationCard, selectedIndex === index && styles.selectedCard]}
                  onPress={() => selectAndCopy(index)}
                >
                  <Text style={styles.variantStyle}>[{variant.style}]</Text>
                  <Text style={styles.translationText}>{variant.text}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace('/(tabs)')}
              >
                <Ionicons name="home" size={24} color="#fff" />
                <Text style={styles.homeButtonText}> 완료하고 홈으로 가기</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 스타일은 SmartStorm님이 올려주신 그대로 유지합니다 (생략 가능하나 확인차 포함)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#16213e' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  backButton: { padding: 5 },
  resetButton: { padding: 5 },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  micSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#16213e', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 15 },
  bigMicButton: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  micHint: { color: '#fff', fontSize: 18, marginTop: 10 },
  section: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 16, color: '#4CAF50', marginBottom: 10, fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#060f2b', borderRadius: 12, borderWidth: 1, borderColor: '#4CAF50' },
  textInput: { flex: 1, padding: 15, color: '#fff', fontSize: 22, minHeight: 120, textAlignVertical: 'top' },
  sendButton: { padding: 12 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { color: '#4CAF50', fontSize: 18, marginTop: 10, textAlign: 'center' },
  translationCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  selectedCard: { borderColor: '#4CAF50', backgroundColor: '#1a2f1a' },
  variantStyle: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  translationText: { fontSize: 20, color: '#fff', lineHeight: 28 },
  homeButton: { backgroundColor: '#4a90e2', padding: 18, borderRadius: 12, marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  homeButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
});