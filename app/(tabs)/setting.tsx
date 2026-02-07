import { initGeminiService } from '@/services/gemini';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_KEY_STORAGE = '@gemini_api_key';

export default function SettingsScreen() {
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [largeText, setLargeText] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  
  // API 키 관련
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // API 키 불러오기
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const saved = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (saved) {
        setApiKey(saved);
        setIsApiKeySet(true);
        // Gemini 서비스 초기화
        initGeminiService(saved);
      }
    } catch (error) {
      console.error('API 키 불러오기 실패:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('오류', 'API 키를 입력해주세요');
      return;
    }

    try {
      // API 키 저장
      await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      
      // Gemini 서비스 초기화
      initGeminiService(apiKey.trim());
      
      setIsApiKeySet(true);
      Alert.alert('성공', 'API 키가 저장되었습니다! ✅');
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      Alert.alert('오류', 'API 키 저장에 실패했습니다');
    }
  };

  const deleteApiKey = async () => {
    Alert.alert(
      '확인',
      'API 키를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(API_KEY_STORAGE);
              setApiKey('');
              setIsApiKeySet(false);
              Alert.alert('완료', 'API 키가 삭제되었습니다');
            } catch (error) {
              Alert.alert('오류', 'API 키 삭제에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* API 키 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Gemini API 설정</Text>
          
          <View style={styles.apiKeyContainer}>
            <Text style={styles.apiKeyLabel}>API 키</Text>
            <View style={styles.apiKeyInputRow}>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Gemini API 키를 입력하세요"
                placeholderTextColor="#666"
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Ionicons
                  name={showApiKey ? 'eye-off' : 'eye'}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            {isApiKeySet && (
              <View style={styles.apiKeyStatus}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.apiKeyStatusText}>API 키 설정됨</Text>
              </View>
            )}

            <View style={styles.apiKeyButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveApiKey}
              >
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>

              {isApiKeySet && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={deleteApiKey}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.apiKeyHelp}>
              💡 Google AI Studio에서 무료 API 키를 받으세요:{'\n'}
              https://aistudio.google.com/apikey
            </Text>
          </View>
        </View>

        {/* 일반 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일반</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>자동 번역</Text>
                <Text style={styles.settingDescription}>
                  음성 인식 후 자동으로 번역
                </Text>
              </View>
            </View>
            <Switch
              value={autoTranslate}
              onValueChange={setAutoTranslate}
              trackColor={{ false: '#555', true: '#4CAF50' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high" size={24} color="#2196F3" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>음성 읽기 (TTS)</Text>
                <Text style={styles.settingDescription}>
                  번역된 텍스트를 음성으로 읽기
                </Text>
              </View>
            </View>
            <Switch
              value={ttsEnabled}
              onValueChange={setTtsEnabled}
              trackColor={{ false: '#555', true: '#4CAF50' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="text" size={24} color="#FF9800" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>큰 글씨</Text>
                <Text style={styles.settingDescription}>
                  어르신이 보기 편한 큰 글씨 사용
                </Text>
              </View>
            </View>
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{ false: '#555', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* 개인정보 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="save" size={24} color="#9C27B0" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>대화 기록 저장</Text>
                <Text style={styles.settingDescription}>
                  대화 내용을 기기에 저장
                </Text>
              </View>
            </View>
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: '#555', true: '#4CAF50' }}
            />
          </View>
        </View>

        {/* 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoText}>버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoText}>개발자</Text>
            <Text style={styles.infoValue}>GrandTalk Team</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  // API 키 관련 스타일
  apiKeyContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  apiKeyLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  apiKeyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  apiKeyInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
  },
  apiKeyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  apiKeyStatusText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
  },
  apiKeyButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  apiKeyHelp: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  // 기존 설정 스타일
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
  },
  infoValue: {
    fontSize: 16,
    color: '#aaa',
  },
});