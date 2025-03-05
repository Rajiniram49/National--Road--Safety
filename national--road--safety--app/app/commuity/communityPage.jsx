import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getApp } from 'firebase/app';


export default function CommunityPage() {

  const db = getFirestore(getApp());

  const [votes, setVotes] = useState({});
  const [downVotes, setDownVotes] = useState({});
  const [showComments, setShowComments] = useState({});



  const backToIssueRaised = () => {
    router.push('/Home/homePage');
  };

  const handleVote = async (id, type) => {
    try {
      const issueRef = doc(db, 'issues', id);

      if (type === 'up') {
        await updateDoc(issueRef, {
          upvotes: increment(1),
        });
      } else {
        await updateDoc(issueRef, {
          downvotes: increment(1),
        });
      }

      setVotes((prevVotes) => ({
        ...prevVotes,
        [id]: {
          up: (prevVotes[id]?.up || 0) + (type === 'up' ? 1 : 0),
          down: (prevVotes[id]?.down || 0) + (type === 'down' ? 1 : 0),
        },
      }));
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };


  const toggleComment = (id) => {
    setShowComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [issuedata, setIssueData] = useState([])

  const fetchIssuesData = async () => {
    try {
      const email = await AsyncStorage.getItem('user');
      const db = getFirestore(getApp());
      const q = query(collection(db, 'issues'), where('username', '==', email));
      const querySnapshot = await getDocs(q);

      const datas = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIssueData(datas);

      const voteData = {};
      datas.forEach(issue => {
        voteData[issue.id] = { up: issue.upvotes || 0, down: issue.downvotes || 0 };
      });
      setVotes(voteData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchIssuesData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={backToIssueRaised} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Posts</Text>
      </View>

      {issuedata.map((item) => (
        <View key={item.id} style={styles.issueItem}>
          <View style={styles.issueContent}>
            <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
            <View style={styles.issueTextContainer}>
              <Text style={styles.issueDescription}>{item.description}</Text>
              <View style={styles.voteContainer}>
                <TouchableOpacity onPress={() => handleVote(item.id, 'up')}>
                  <AntDesign name="arrowup" size={24} color="green" />
                </TouchableOpacity>
                <Text style={styles.voteCount}>{votes[item.id]?.up || 0}</Text>
                <TouchableOpacity onPress={() => handleVote(item.id, 'down')}>
                  <AntDesign name="arrowdown" size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.voteCount}>{votes[item.id]?.down || 0}</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsButton} onPress={() => toggleComment(item.id)}>
                <Text style={styles.viewDetails}>View Admin Comment</Text>
              </TouchableOpacity>
              {showComments[item.id] && (
                <Text style={styles.adminComment}>{item.adminComment}</Text>
              )}
            </View>
          </View>
        </View>
      ))}

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
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  voteCount: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    fontWeight: 'bold',
  },
  adminComment: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 6,
    textAlign: 'center',
  },
});