import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { auth, db } from "../Service/firebaseConnection"; // Firebase JS SDK import
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore'; // Firestore import

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState('');
    const [phno, setphno] = useState('');

    const router = useRouter();

    // Function to register the user
    const handleRegister = async () => {
        if (!email || !password || !name || !phno) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords didn't match");
            return;
        }
        setError('');

        // Create user with email and password
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // After user is registered, store data
                addUserEmails(email, password);
                addUserDocument(name, email, password, phno);
                console.log('User registered:', user);
                Alert.alert("Success", "Account created successfully!");
                router.push("/Home/homePage");
            })
            .catch((error) => {
                Alert.alert("Error", error.message);
                console.error('Registration Error:', error.message);
                setError('user already available');
            });
    };

    // store user emails
    const addUserEmails = async (email, password) => {
        try {
            await addDoc(collection(db, 'LoginEmail'), {
                email: email,
                password: password,
            });
            console.log('Emails added!');
        } catch (error) {
            console.error("Error adding Emails: ", error);
        }
    };

    // store user details
    const addUserDocument = async (name, email, password, phno) => {
        try {
            await addDoc(collection(db, 'UserDetails'), {
                name: name,
                email: email,
                password: password,
                phno: phno,
            });
            console.log('User Details added!');
        } catch (error) {
            console.error("Error adding User Details: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phno}
                onChangeText={setphno}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <Link href="/login/loginPage">
                <Text style={styles.signupText}>Have an account? Sign in</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        width: "100%",
        marginVertical: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
