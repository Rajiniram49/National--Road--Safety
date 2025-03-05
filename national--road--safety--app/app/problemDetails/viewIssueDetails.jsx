import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProgressBar } from 'react-native-paper';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { collection, query, where, getDocs } from 'firebase/firestore';


export default function ViewIssueDetails() {
  const params = useLocalSearchParams();
  const [issue, setIssue] = useState(null);
  const [progress, setProgress] = useState(0);
  const [rejectionReason, setRejectionReason] = useState(""); // State for rejection reason

  useEffect(() => {
    fetchIssueDetails(params.id);
  }, [params.id]);

  useEffect(() => {
    if (issue?.status) {
      switch (issue.status) {
        case 'Not Yet Started':
          setProgress(0.1);
          break;
        case 'Accept Request':
          setProgress(0.4);
          break;
        case 'In Progress':
          setProgress(0.7);
          break;
        case 'Completed':
          setProgress(0.8);
          break;
        case 'Rejected':
          setProgress(1.0);
          fetchRejectionReason(params.id); // Fetch reason only if rejected
          break;
        default:
          setProgress(0.1);
          break;
      }
    }
  }, [issue]);

  // Fetch issue details from 'issues' collection
  const fetchIssueDetails = async (issueId) => {
    try {
      const db = getFirestore(getApp());
      const docRef = doc(db, 'issues', issueId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIssue(docSnap.data());
      } else {
        console.log("No such issue document!");
      }
    } catch (error) {
      console.error("Error fetching issue details:", error);
    }
  };

  const fetchRejectionReason = async (issueId) => {
    try {
      const db = getFirestore(getApp());
      const q = query(collection(db, "AdminRejectTickets"), where("issueId", "==", issueId));

      console.log("Fetching rejection reason for issue ID:", issueId);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          console.log("Fetched rejection document:", doc.data());
          setRejectionReason(doc.data().rejectionReason || "No reason provided.");
        });
      } else {
        console.log("No matching rejection document found.");
      }
    } catch (error) {
      console.error("Error fetching rejection reason:", error);
    }
  };

  const listDocuments = async () => {
    const db = getFirestore(getApp());
    const querySnapshot = await getDocs(collection(db, "AdminRejectTickets"));

    querySnapshot.forEach((doc) => {
      console.log("Document ID:", doc.id, "Data:", doc.data());
    });
  };
  listDocuments();




  const backToIssueRaised = () => {
    router.push('/Issueraised/issueRaisedpage');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={backToIssueRaised} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Status</Text>
      </View>

      {issue ? (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.statusText}>Status: {issue.status}</Text>
            <ProgressBar progress={progress} color="#007BFF" style={styles.progressBar} />
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Not Yet Started</Text>
              <Text style={styles.progressLabel}>Accept Request</Text>
              <Text style={styles.progressLabel}>In Progress</Text>
              <Text style={styles.progressLabel}>Completed</Text>
              <Text style={styles.progressLabel}>Rejected</Text>
            </View>
          </View>

          <Image source={{ uri: issue.imageUrl }} style={styles.image} />
          <Text style={styles.description}>Description: {issue.description}</Text>
          <Text style={styles.status}>Status: {issue.status}</Text>

          {issue.status === "Rejected" && (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
              <Text style={styles.rejectionText}>{rejectionReason || "The location and issue does not sink with each other."}</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.loadingText}>Loading issue details...</Text>
      )}
    </ScrollView>
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
  progressContainer: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#007BFF',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  rejectionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFCDD2',
    borderRadius: 10,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 5,
  },
  rejectionText: {
    fontSize: 16,
    color: '#D32F2F',
  },
});
