import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../Service/firebaseConnection';

const { width, height } = Dimensions.get('window');

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const moveHomePage = () => {
        setError('');
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('Admin signed in:', user.email);
                await AsyncStorage.setItem('Adminuser', user.email);
                router.push('/Admin/adminDashboard');
            })
            .catch((error) => {
                console.error('Login Error:', error.message);
                setError('Are you sure you are an admin?, Use the correct credentials');
                Alert.alert('Are you sure you are an admin?, Use the correct credentials');
            });
    };

    const login = async () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('Admin is signed in');
                router.push('/Admin/adminDashboard');
            } else {
                console.log('Admin is signed out');
            }
        });
        return () => unsubscribe();
    }

    // Listen for auth state change
    useEffect(() => {
        login();
    }, [auth]);

    return (
        <View style={styles.container}>
            <Image source={require('../../assets/images/loginpage.jpg')} style={styles.backgroundImage} resizeMode="cover" />

            <View style={styles.loginBox}>
                <Text style={styles.title}>Admin Login</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.loginButton} onPress={moveHomePage}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: width,
        height: height,
        position: 'absolute',
    },
    loginBox: {
        width: '85%',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupText: {
        marginTop: 15,
        fontSize: 16,
        color: '#007bff',
    },
});
