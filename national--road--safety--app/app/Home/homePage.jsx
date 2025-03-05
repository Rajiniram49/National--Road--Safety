import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../Service/firebaseConnection';
import ChatScreen from '../ChatScreen/chatScreen';


export default function homePage() {

    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [user, setUser] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatbotVisible, setChatbotVisible] = useState(false);
    const [input, setInput] = useState('');



    const handleProfileClick = () => {
        setModalVisible(true);
    };

    const handleOptionSelect = (option) => {
        setModalVisible(false);
        Alert.alert(`You selected: ${option}`);
    };

    const handleCommunity = () => {
        router.push('/commuity/communityPage');
        setModalVisible(false);
    };


    const handleRaiseTicket = () => {
        router.push('/Raiseissue/raiseIssue');
        setModalVisible(false);
    };

    const handleViewTicket = () => {
        router.push('/Issueraised/issueRaisedpage');
        setModalVisible(false);
    };

    const logoutuser = () => {
        signOut(auth)
            .then(() => {
                router.push('/');
            });
    };

    // fetch who is logged in
    const whologgedin = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            if (user) {
                setUser(user);
                console.log("login", user);
            }
        } catch (error) {
            console.log("Error fetching user", error);
        }
    }

    const sendMessage = async () => {
        if (input.trim() === '') return;
    
        const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
        setMessages([...messages, userMessage]);
        setInput('');
    
        // Use your API key
        const API_KEY = "AIzaSyA-iQuHepP1KC5Y9eDV3_MxTe6EDlDHW08";
        const MODEL_NAME = "gemini-1.5-pro"; // Try "gemini-1.5-pro" if 1.0 isn't found
    
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: input }] }]
                })
            });
    
            const data = await response.json();
            console.log("Gemini API Response:", data); // Debugging log
    
            if (data?.error) {
                console.warn("API Error:", data.error.message);
                throw new Error(data.error.message);
            }
    
            const botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to assist you!";
    
            setTimeout(() => {
                const botResponse = { id: messages.length + 2, text: botResponseText, sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
            }, 1000);
            
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages((prevMessages) => [...prevMessages, { id: messages.length + 2, text: "Sorry, something went wrong.", sender: 'bot' }]);
        }
    };
    
    
    
    
    
    

    useEffect(() => {
        whologgedin();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={logoutuser} style={styles.backButton}>
                    <AntDesign name="logout" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Home Page</Text>
            </View>

            <Text style={styles.subHeader}>
                Empowering you to report issues and track progress in your community.
            </Text>

            {/* Step 1: Sign Up / Log In */}
            <View style={styles.stepContainer}>
                <Text style={styles.stepNumber}>1</Text>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Sign Up / Log In</Text>
                    <Text style={styles.stepDescription}>
                        Create an account or log in to access your personalized dashboard.
                    </Text>
                </View>
            </View>

            {/* Step 2: Raise a Ticket */}
            <View style={styles.stepContainer}>
                <Text style={styles.stepNumber}>2</Text>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Raise a Ticket</Text>
                    <Text style={styles.stepDescription}>
                        Navigate to the "Raise Ticket" section, fill in the details about your issue, attach a photo if needed, and submit your ticket.
                    </Text>
                </View>
            </View>

            {/* Step 3: Ticket Review */}
            <View style={styles.stepContainer}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Ticket Review</Text>
                    <Text style={styles.stepDescription}>
                        Our team reviews your submission and routes it to the appropriate department.
                    </Text>
                </View>
            </View>

            {/* Step 4: Track Ticket Status */}
            <View style={styles.stepContainer}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Track Ticket Status</Text>
                    <Text style={styles.stepDescription}>
                        Monitor your ticket’s progress from submission to resolution through your dashboard.
                    </Text>
                </View>
            </View>

            {/* Step 5: View Resolved Issues */}
            <View style={styles.stepContainer}>
                <Text style={styles.stepNumber}>5</Text>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>View Resolved Issues</Text>
                    <Text style={styles.stepDescription}>
                        Check out completed cases and see how our community is making a difference.
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.chatbotButton}
                onPress={() => setChatbotVisible(true)}
            >
                <AntDesign name="message1" size={28} color="white" />
            </TouchableOpacity>


            <View style={styles.footer}>
                <TouchableOpacity onPress={handleProfileClick}>
                    <Image
                        source={require('../../assets/images/enterpage.jpg')}
                        style={styles.profileIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.userName}>Welcome, id: {user}</Text>
            </View>

            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.option} onPress={() => handleRaiseTicket()}>
                            <Text style={styles.optionText}>Raise Ticket</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => handleViewTicket()}>
                            <Text style={styles.optionText}>View Ticket</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => handleCommunity()}>
                            <Text style={styles.optionText}>Community</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => setModalVisible(false)}>
                            <Text style={styles.optionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={chatbotVisible} animationType="slide" transparent={true}>
                <View style={styles.chatbotContainer}>
                    <View style={styles.chatbotHeader}>
                        <Text style={styles.chatbotTitle}>Chatbot</Text>
                        <TouchableOpacity onPress={() => setChatbotVisible(false)}>
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                                <Text style={styles.messageText}>{item.text}</Text>
                            </View>
                        )}
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            value={input}
                            onChangeText={setInput}
                        />
                        <TouchableOpacity onPress={sendMessage}>
                            <AntDesign name="arrowright" size={24} color="#007BFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        borderRadius: 10,
    },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    option: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    subHeader: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        color: "#555",
    },
    stepContainer: {
        flexDirection: "row",
        marginBottom: 20,
        alignItems: "flex-start",
    },
    stepNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#007bff",
        width: 30,
        textAlign: "center",
    },
    stepContent: {
        flex: 1,
        marginLeft: 12,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 4,
        color: "#000",
    },
    stepDescription: {
        fontSize: 16,
        color: "#555",
    },
    button: {
        marginTop: 30,
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    chatbotButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 50,
        zIndex: 10,
        elevation: 5,
    },
    chatbotContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20
    },
    chatbotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    chatbotTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        padding: 10
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        marginRight: 10
    },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007BFF',
        color: 'white'
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ddd'
    },
    messageText: {
        color: 'black'
    },
});
