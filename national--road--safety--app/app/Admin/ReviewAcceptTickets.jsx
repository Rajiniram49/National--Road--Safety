import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, SafeAreaView } from 'react-native';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function ReviewAcceptTickets() {
    const [approvedTickets, setApprovedTickets] = useState([]);

    useEffect(() => {
        const db = getFirestore(getApp());
        const unsubscribe = onSnapshot(collection(db, "AdminApprovedTickets"), (snapshot) => {
            const tickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApprovedTickets(tickets);
        }, (error) => {
            console.error("Error fetching approved tickets:", error);
        });
        return () => unsubscribe();
    }, []);

    const updateTicketStatus = async (ticketId, currentStatus) => {
        const db = getFirestore(getApp());
        const ticketRef = doc(db, "AdminApprovedTickets", ticketId);
        const newStatus = currentStatus === "In Progress" ? "Completed" : "In Progress";
        try {
            await updateDoc(ticketRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating ticket status:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <AntDesign name="arrowleft" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Approved Tickets</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>Approved Tickets</Text>
                    </>
                }
                data={approvedTickets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.ticketCard}>
                        <Text style={styles.issueTitle}>{item.issueType}</Text>
                        <Text>Priority: {item.priority}</Text>
                        <Text>Description: {item.description}</Text>
                        <Text>Likes: {item.upvotes || 0}</Text>
                        <Text>Dislikes: {item.downvotes || 0}</Text>
                        {item.imageUrl && (
                            <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
                        )}
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                { backgroundColor: item.status === "In Progress" ? "orange" : "green" },
                            ]}
                            onPress={() => updateTicketStatus(item.id, item.status)}
                        >
                            <Text style={styles.statusButtonText}>{item.status || "In Progress"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No approved tickets yet.</Text>}
            />
        </SafeAreaView>
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
    },
    issueTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#007BFF',
    },
    issueImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    statusButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    statusButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
