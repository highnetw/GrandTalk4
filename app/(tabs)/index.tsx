import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // 버튼 펄스 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>GrandTalk</Text>
        <Text style={styles.subtitle}>손자 블로그에 영어 댓글 달기</Text>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* 큰 버튼 */}
        <TouchableOpacity 
          style={styles.micButtonContainer}
          onPress={() => router.push('/comment-writer')}
        >
          <Animated.View
            style={[
              styles.micButton,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="create" size={80} color="#fff" />
          </Animated.View>
          <Text style={styles.micButtonText}>탭하여 댓글 작성</Text>
        </TouchableOpacity>

        {/* 안내 문구 */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="mic" size={24} color="#4CAF50" />
            <Text style={styles.infoText}>한글 음성 인식</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="sparkles" size={24} color="#2196F3" />
            <Text style={styles.infoText}>AI가 3가지 번역 제공</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="copy" size={24} color="#FF9800" />
            <Text style={styles.infoText}>클립보드에 바로 복사</Text>
          </View>
        </View>

        {/* 빠른 시작 가이드 */}
        <View style={styles.quickGuide}>
          <Text style={styles.quickGuideTitle}>💡 사용 방법</Text>
          <Text style={styles.quickGuideText}>
            1. 버튼을 눌러 한글로 말하세요{'\n'}
            2. AI가 3가지 영어 번역을 만듭니다{'\n'}
            3. 마음에 드는 번역을 선택하세요{'\n'}
            4. 클립보드에 복사되어 바로 붙여넣기!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  micButtonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  micButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e91e63',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  micButtonText: {
    marginTop: 20,
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  quickGuide: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  quickGuideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  quickGuideText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },
});