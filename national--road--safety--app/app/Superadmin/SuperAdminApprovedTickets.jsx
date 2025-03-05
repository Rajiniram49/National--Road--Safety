import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SuperAdminApprovedTickets() {

    const [approvedTickets, setApprovedTickets] = useState([]);

    useEffect(() => {
        const fetchApprovedTickets = async () => {
            try {
                const storedTickets = await AsyncStorage.getItem('approvedTickets');
                if (storedTickets) {
                    setApprovedTickets(JSON.parse(storedTickets));
                }
            } catch (error) {
                console.error("Error fetching approved tickets:", error);
            }
        };

        fetchApprovedTickets();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Raise an Issue</Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Approved Tickets</Text>
                {approvedTickets.length > 0 ? (
                    <FlatList
                        data={approvedTickets}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.ticketCard}>
                                <Text style={styles.issueTitle}>{item.issueType}</Text>
                                <Text>Priority: {item.priority}</Text>
                                <Text>Description: {item.description}</Text>
                                <Text>upvotes: {item.upvotes}</Text>
                                <Text>downvotes: {item.downvotes}</Text>
                                <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
                            </View>
                        )}
                    />
                ) : (
                    <Text>No approved tickets yet.</Text>
                )}
            </View>
        </ScrollView>
    )
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    backButton: {
        marginRight: 10,
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    ticketCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        transition: 'transform 0.2s ease-in-out',
    },
    issueTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#007BFF',
    },
    issueText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    issueImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    approveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#28a745',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    approveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});