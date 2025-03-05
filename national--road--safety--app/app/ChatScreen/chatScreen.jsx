import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";
import { fetchAIResponse } from "../Service/DeepSeekService"; // Ensure DeepSeekService is correctly configured
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../Service/firebaseConnection"; // Ensure Firebase is correctly configured

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

    const messagesRef = collection(db, "chatMessages");

    // Function to send messages and save to Firebase
    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = { role: "user", content: inputText, timestamp: new Date() };
        setMessages([...messages, userMessage]);

        await addDoc(messagesRef, userMessage); // Save user message to Firestore

        const aiResponse = await fetchAIResponse(inputText);
        const aiMessage = { role: "assistant", content: aiResponse, timestamp: new Date() };

        await addDoc(messagesRef, aiMessage); // Save AI response to Firestore
        setMessages([...messages, userMessage, aiMessage]);
        setInputText("");
    };

    // Fetch messages in real time
    useEffect(() => {
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => doc.data());
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text style={item.role === "user" ? styles.userMessage : styles.aiMessage}>
                        {item.content}
                    </Text>
                )}
            />
            <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
            />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    userMessage: { alignSelf: "flex-end", backgroundColor: "#d1e7fd", padding: 8, margin: 4, borderRadius: 5 },
    aiMessage: { alignSelf: "flex-start", backgroundColor: "#f0f0f0", padding: 8, margin: 4, borderRadius: 5 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default ChatScreen;