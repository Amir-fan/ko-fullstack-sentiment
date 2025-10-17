import React, {useEffect, useMemo, useState} from 'react';
import {Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View} from 'react-native';
import { API_BASE_URL } from './config';


function useStoredUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Simple in-memory for demo; could be AsyncStorage if needed
  }, []);
  return [user, setUser];
}

async function registerNickname(nickname) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({nickname}),
  });
  if (!res.ok) throw new Error('register_failed');
  return await res.json();
}

async function fetchMessages(userId) {
  const res = await fetch(`${API_BASE_URL}/messages?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

async function sendMessage(userId, text) {
  const res = await fetch(`${API_BASE_URL}/message`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId, text}),
  });
  if (!res.ok) throw new Error('send_failed');
  return await res.json();
}

export default function App() {
  const [user, setUser] = useStoredUser();
  const [nickname, setNickname] = useState('');
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchMessages(user.userId).then(setItems).catch(() => {});
  }, [user]);

  const onRegister = async () => {
    setError('');
    const name = nickname.trim();
    if (!name) return setError('Enter nickname');
    try {
      const data = await registerNickname(name);
      setUser(data);
    } catch (e) {
      setError('Register failed');
    }
  };

  const onSend = async () => {
    setError('');
    const content = text.trim();
    if (!content || !user) return;
    try {
      const saved = await sendMessage(user.userId, content);
      setItems(prev => [...prev, saved]);
      setText('');
    } catch (e) {
      setError("Couldn't send. Try again.");
    }
  };

  const onLogout = () => {
    setItems([]);
    setUser(null);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>KO Sentiment Chat</Text>
        <View style={styles.row}>
          <TextInput style={styles.input} placeholder="Nickname" value={nickname} onChangeText={setNickname} />
          <Button title="Enter" onPress={onRegister} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        <Text style={styles.title}>Hello, {user.nickname}</Text>
        <Button title="Logout" onPress={onLogout} />
      </View>
      <FlatList
        data={items}
        keyExtractor={m => String(m.id)}
        renderItem={({item}) => (
          <View style={styles.messageRow}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.sentiment}>{item?.sentiment?.label} {typeof item?.sentiment?.score === 'number' ? `(${item.sentiment.score.toFixed(2)})` : ''}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{paddingVertical: 8}}
      />
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Message" value={text} onChangeText={setText} />
        <Button title="Send" onPress={onSend} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  title: {fontSize: 18, fontWeight: '600', marginBottom: 12},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  input: {flex: 1, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 8, height: 40, borderRadius: 4},
  messageRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8},
  messageText: {fontSize: 16},
  sentiment: {fontSize: 12, opacity: 0.7},
  sep: {height: 1, backgroundColor: '#eee'},
  error: {marginTop: 8, color: 'red'},
});


