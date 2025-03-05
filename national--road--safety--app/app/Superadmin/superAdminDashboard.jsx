import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../Service/firebaseConnection';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { Image } from 'react-native';

// A simple progress bar component
const ProgressBar = ({ value }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${value}%` }]} />
    </View>
  );
};

const SuperAdminDashboard = () => {
  const screenWidth = Dimensions.get("window").width;

  // Ticket stats data
  const ticketStats = [
    { title: "Total Tickets", count: 120, color: "#FF5733" },
    { title: "In Progress", count: 45, color: "#FFC300" },
    { title: "Approved", count: 50, color: "#28A745" },
    { title: "Unresolved", count: 25, color: "#DC3545" },
  ];

  // Admin performance data
  const adminPerformance = [
    { name: "Admin 1", pending: 5, completed: 20 },
    { name: "Admin 2", pending: 10, completed: 30 },
    { name: "Admin 3", pending: 2, completed: 40 },
  ];

  // Data for the bar chart
  const chartData = {
    labels: ["Total", "In Progress", "Approved", "Unresolved"],
    datasets: [
      {
        data: [120, 45, 50, 25],
      },
    ],
  };

  // Dummy issues data with locality, priority and category info
  const issues = [
    {
      id: "1",
      title: "Pothole on Main Street",
      locality: "Melur",
      priority: "High",
      likes: 50,
      category: "Patholes",
    },
    {
      id: "2",
      title: "Street Light not working",
      locality: "vadipatti",
      priority: "Low",
      likes: 10,
      category: "Street lights",
    },
    {
      id: "3",
      title: "Traffic signal malfunction",
      locality: "thirumangalam",
      priority: "High",
      likes: 40,
      category: "traffic Lights",
    },
    {
      id: "4",
      title: "Road blockage due to protest",
      locality: "thirupparankundram",
      priority: "Low",
      likes: 15,
      category: "road Bloacks",
    },
    {
      id: "5",
      title: "Road breakages after heavy rains",
      locality: "peraiyur",
      priority: "High",
      likes: 25,
      category: "Road Breakages",
    },
    {
      id: "6",
      title: "Noisy traffic",
      locality: "Usilampatti",
      priority: "Low",
      likes: 5,
      category: "traffic Lights",
    },
  ];

  // Available filter options
  const localities = [
    "Melur",
    "vadipatti",
    "thirumangalam",
    "thirupparankundram",
    "peraiyur",
    "Usilampatti",
  ];
  const priorities = ["High", "Low"];
  const categories = [
    "Street lights",
    "traffic Lights",
    "road Bloacks",
    "Road Breakages",
    "Patholes",
  ];

  // States for the selected filters
  const [selectedLocality, setSelectedLocality] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState('');


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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchIssuesData();
  }, []);

  // Filter the issues based on selected locality, priority, and category
  const filteredIssues = issuedata.filter((issue) => {
    const matchLocality =
      selectedLocality === "All" || issue.locality === selectedLocality;
    const matchPriority =
      selectedPriority === "All" || issue.priority === selectedPriority;
    const matchCategory =
      selectedCategory === "All" || issue.category === selectedCategory;
    return matchLocality && matchPriority && matchCategory;
  });

  const ReviewUnresolveTickets = () => {
    // Alert.alert("aaaa");
    router.push('/SADUnresolvedTickets/superAdminUnreslvedTickets')
  }

  const handleApprove = async (issue) => {
    try {
      // Get existing approved tickets from storage
      const existingTickets = await AsyncStorage.getItem('approvedTickets');
      const approvedTickets = existingTickets ? JSON.parse(existingTickets) : [];

      // Add the new approved issue
      const updatedTickets = [...approvedTickets, issue];

      // Save back to AsyncStorage
      await AsyncStorage.setItem('approvedTickets', JSON.stringify(updatedTickets));

      Alert.alert("Approve", `Issue "${issue.issueType}" approved.`);

      // Navigate to the Review Page
      router.push('/Admin/ReviewAcceptTickets');
    } catch (error) {
      console.error("Error saving approved ticket:", error);
    }
  };


  const handleReject = (issue) => {
    Alert.alert("Reject", `Issue "${issue.issueType}" rejected.`);
    // Additional logic for rejecting the issue can be added here
  };

  const SuperAdminApprovedTickets = () => {
    router.push('/Superadmin/SuperAdminApprovedTickets');
  };

  const logoutSuperAdmin = () => {
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
        console.log("Super Admin login", user);
      }
    } catch (error) {
      console.log("Error fetching user", error);
    }
  }

  useEffect(() => {
    whologgedin();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logoutSuperAdmin} style={styles.backButton}>
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Super Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Dashboard Title */}

        {/* Ticket Stats Grid */}
        <View style={styles.statsGrid}>
          {ticketStats.map((stat, index) => (
            <View key={index} style={[styles.card, { backgroundColor: stat.color }]}>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statCount}>{stat.count}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: "#f8f9fa",
            backgroundGradientTo: "#f8f9fa",
            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          }}
          style={styles.barChart}
        />

        {/* Admin Performance */}
        <Text style={styles.performanceTitle}>Admin Performance</Text>
        <FlatList
          data={adminPerformance}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, styles.progressCard]}>
              <Text style={[styles.statTitle, { color: "#000" }]}>{item.name}</Text>
              <ProgressBar
                value={(item.completed / (item.pending + item.completed)) * 100}
              />
              <Text style={styles.progressText}>
                Pending: {item.pending} | Completed: {item.completed}
              </Text>
            </View>
          )}
        />

        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Locality Filter */}
          <Text style={styles.filterTitle}>Filter by Locality</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLocality === "All" && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedLocality("All")}
            >
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            {localities.map((locality) => (
              <TouchableOpacity
                key={locality}
                style={[
                  styles.filterButton,
                  selectedLocality === locality && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedLocality(locality)}
              >
                <Text style={styles.filterButtonText}>{locality}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Priority Filter */}
          <Text style={styles.filterTitle}>Filter by Priority</Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPriority === "All" && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPriority("All")}
            >
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  selectedPriority === priority && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <Text style={styles.filterButtonText}>
                  {priority} Priority
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filter */}
          <Text style={styles.filterTitle}>Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === "All" && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory("All")}
            >
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterButton,
                  selectedCategory === cat && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={styles.filterButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Issues List */}
        <Text style={styles.issuesTitle}>Issues Raised</Text>
        {filteredIssues.length > 0 ? (
          <FlatList
            data={filteredIssues}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.issueCard}>
                <Text style={styles.issueTitle}>{item.issueType}</Text>
                <Text style={styles.issueDetails}>
                  Locality: {item.city} | Priority: {item.priority} |Category: {new Date(item.createdAt).toLocaleString()}
                </Text>
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.issueButton, styles.approveButton]}
                    onPress={() => handleApprove(item)}
                  >
                    <Text style={styles.issueButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.issueButton, styles.rejectButton]}
                    onPress={() => handleReject(item)}
                  >
                    <Text style={styles.issueButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noIssuesText}>No issues found.</Text>
        )}

        {/* Button to review unresolved tickets */}
        {/* <TouchableOpacity
          style={styles.button}
          onPress={ReviewUnresolveTickets}
        >
          <Text style={styles.buttonText}>Review Unresolved Tickets</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.button}
          onPress={SuperAdminApprovedTickets}
        >
          <Text style={styles.buttonText}>Super Admin Approved Tickets</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10
  },
  title: {
    marginTop: 25,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  statCount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  barChart: {
    marginVertical: 16,
    borderRadius: 16,
    alignSelf: "center",
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#000",
  },
  progressCard: {
    backgroundColor: "#fff",
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: "#000",
  },
  progressBarContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#007bff",
  },
  filterButtonText: {
    color: "#000",
  },
  issuesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
    color: "#000",
  },
  issueCard: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  issueDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  issueButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 5,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#28A745",
  },
  rejectButton: {
    backgroundColor: "#DC3545",
  },
  issueButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noIssuesText: {
    textAlign: "center",
    color: "#555",
    marginVertical: 8,
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
    width: "80%",
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    marginRight: 10,
    backgroundColor: '#007BFF',
  },
});

export default SuperAdminDashboard;
