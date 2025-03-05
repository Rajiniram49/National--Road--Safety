import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp } from 'firebase/app';


export default function issueRaisedpage() {

  const [issuedata, setIssueData] = useState([])

  const fetchIssuesData = async () => {
    try {
      const email = await AsyncStorage.getItem('user');
      console.log('Fetch Issue Details:', email);

      const db = getFirestore(getApp());
      const q = query(collection(db, 'issues'), where('username', '==', email));
      const querySnapshot = await getDocs(q);

      const datas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(datas);
      setIssueData(datas);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchIssuesData();
  }, []);



  const backToHome = () => {
    router.push('/Home/homePage')
  }

  const viewDetails = (item) => {
    console.log("Passing Issue ID:", item.id);
    router.push({
      pathname: '/problemDetails/viewIssueDetails',
      params: {
        id: item.id,
      },
    });
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={backToHome} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Raised Details</Text>
      </View>

      {issuedata.map((item, index) => (
        <View
          key={index}
          style={styles.issueItem}
          underlayColor="#ddd"
        >
          <View style={styles.issueContent}>
            <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
            <View style={styles.issueTextContainer}>
              <Text style={styles.issueDescription}>{item.description}</Text>
              <TouchableOpacity style={styles.viewDetailsButton} onPress={() => viewDetails(item)}>
                <Text style={styles.viewDetails}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
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
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  issueItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  issueContent: {
    alignItems: 'center',
  },
  issueImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  issueTextContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  issueDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  viewDetailsButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007BFF',
    borderRadius: 6,
  },
  viewDetails: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
