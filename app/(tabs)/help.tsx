import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>도움말 화면 (작업 예정)</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, color: '#fff' },
});