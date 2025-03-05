import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
  Modal,
  TextInput
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, getAuth  } from 'firebase/auth';
import { auth, db  } from '../Service/firebaseConnection';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, increment, addDoc, writeBatch } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { Image } from 'react-native';

// A simple progress bar component (if needed in other parts of the app)
const ProgressBar = ({ value }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${value}%` }]} />
    </View>
  );
};

const AdminDashboard = () => {

  const db = getFirestore(getApp());

  const [issuesss, setIssues] = useState([]);
  const [adminCity, setAdminCity] = useState("");
  const [issuedata, setIssueData] = useState([])
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [ticketStats, setTicketStats] = useState([
    { title: "Total Tickets", count: 0, color: "#FF5733" },
    { title: "In Progress", count: 0, color: "#FFC300" },
    { title: "Approved", count: 0, color: "#28A745" },
    { title: "Unresolved", count: 0, color: "#DC3545" },
  ]);


  const fetchAdminDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Not logged in!");
      return;
    }

    try {
      const q = query(collection(db, "AdminLogin"), where("Email", "==", user.email));
      const adminSnapshot = await getDocs(q);

      if (!adminSnapshot.empty) {
        const adminData = adminSnapshot.docs[0].data();
        console.log("Admin Data:", adminData); // ✅ Debugging
        setAdminCity(adminData.City); // Store the city for filtering

        // Fetch Issues Based on City
        fetchIssues(adminData.City);
      } else {
        alert("Admin details not found!");
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  const fetchIssues = async (cityName) => {
    if (!cityName) return;

    try {
      console.log("Fetching issues for city:", cityName); // ✅ Debugging

      const issuesQuery = query(collection(db, "issues"), where("city", "==", cityName));
      const issuesSnapshot = await getDocs(issuesQuery);

      const issuesList = issuesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Issues:", issuesList); // ✅ Debugging
      setIssues(issuesList);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const fetchIssuesData = async () => {
    try {
      const email = await AsyncStorage.getItem('user');
      const db = getFirestore(getApp());

      // Fetch all issues
      const issuesQuery = query(collection(db, 'issues'), where('username', '==', email));
      const issuesSnapshot = await getDocs(issuesQuery);
      const allIssues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch approved tickets
      const approvedQuery = query(collection(db, 'AdminApprovedTickets'));
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedIds = new Set(approvedSnapshot.docs.map(doc => doc.data().description));

      // Fetch rejected tickets
      const rejectedQuery = query(collection(db, 'AdminRejectTickets'));
      const rejectedSnapshot = await getDocs(rejectedQuery);
      const rejectedIds = new Set(rejectedSnapshot.docs.map(doc => doc.data().description));

      // Filter issues that are not approved or rejected
      const filteredIssues = allIssues.filter(issue =>
        !approvedIds.has(issue.description) && !rejectedIds.has(issue.description)
      );

      setIssueData(filteredIssues);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchData = async () => {
    try {
      const db = getFirestore(getApp());

      // Fetch all issues
      const issuesQuery = collection(db, 'issues');
      const issuesSnapshot = await getDocs(issuesQuery);
      const allIssues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Count tickets based on their status
      let totalTickets = allIssues.length;

      const ApprovedQuery = collection(db, 'AdminApprovedTickets');
      const ApprovedSnapshot = await getDocs(ApprovedQuery);
      const ApprovedIssues = ApprovedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let inProgressCount = ApprovedIssues.length;

      let approvedCount = ApprovedIssues.length;

      const RejectedQuery = collection(db, 'AdminRejectTickets');
      const RejectedSnapshot = await getDocs(RejectedQuery);
      const RejectedIssues = RejectedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let unresolvedCount = RejectedIssues.length;

      // Update ticket stats dynamically
      setTicketStats([
        { title: "Total Tickets", count: totalTickets, color: "#FF5733" },
        { title: "In Progress", count: inProgressCount, color: "#FFC300" },
        { title: "Approved", count: approvedCount, color: "#28A745" },
        { title: "Rejected", count: unresolvedCount, color: "#DC3545" },
      ]);

      setIssueData(allIssues);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const checkAdminResponse = async () => {
    try {
      const db = getFirestore(getApp());
      const now = new Date();
      const batch = writeBatch(db);

      const querySnapshot = await getDocs(collection(db, 'issues'));

      querySnapshot.forEach((docSnap) => {
        const issue = docSnap.data();

        if (!issue.timestamp || !issue.timestamp.toDate) {
          console.warn(`Skipping issue "${docSnap.id}" due to missing timestamp.`);
          return;
        }

        const issueDate = issue.timestamp.toDate();
        const diffDays = Math.floor((now - issueDate) / (1000 * 60 * 60 * 24));

        let maxDays = issue.priority === "High" ? 7 : 10; // Set limit based on priority

        if ((!issue.status || issue.status === "pending") && diffDays >= maxDays) {
          batch.set(doc(db, "AdminNotRespond", docSnap.id), {
            imageUrl: issue.imageUrl || "",
            description: issue.description || "No description provided",
            issueType: issue.issueType || "Unknown",
            priority: issue.priority || "Low",
            timestamp: issue.timestamp,
            reason: "Admin did not respond in time",
          });

          batch.update(doc(db, "issues", docSnap.id), { status: "expired" });
        }
      });

      await batch.commit();
      console.log("Expired issues moved successfully.");
    } catch (error) {
      console.error("Error checking admin response:", error);
    }
  };




  useEffect(() => {
    fetchIssuesData();
    checkAdminResponse();
    fetchData();
  }, []);

  const screenWidth = Dimensions.get("window").width;

  // Ticket stats data
  const ticketStarts = [
    { title: "Total Tickets", count: 120, color: "#FF5733" },
    { title: "In Progress", count: 45, color: "#FFC300" },
    { title: "Approved", count: 50, color: "#28A745" },
    { title: "Unresolved", count: 25, color: "#DC3545" },
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

  // Dummy issues data with locality, priority, and category info
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

  // Available filter options (excluding locality)
  const priorities = ["All", "High", "Low"];
  const categories = ["All", "Signal Not Working", "Road Damage", "Street Lamp Not Working", "Others"];

  // States for the selected filters
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [user, setUser] = useState('');




  // Filter the issues based on selected priority and category
  const filteredIssues = issuedata.filter((issue) => {
    const matchPriority = selectedPriority === "All" || issue.priority === selectedPriority;
    const matchCategory = selectedCategory === "All" || issue.issueType === selectedCategory;
    return matchPriority && matchCategory;
  });

  // Handler functions for approve and reject actions
  const handleApprove = async (issue) => {
    try {
      const db = getFirestore(getApp());

      // Add issue details to Firestore's 'AdminApprovedTickets' collection
      await addDoc(collection(db, "AdminApprovedTickets"), {
        issueId: selectedIssue.id, // Save issue I
        imageUrl: issue.imageUrl,
        description: issue.description,
        issueType: issue.issueType,
        priority: issue.priority,
        timestamp: new Date(),
        upvotes: issue.upvotes || 0,
        downvotes: issue.downvotes || 0,
      });

      // Remove the approved issue from issuedata state
      setIssueData((prevIssues) => prevIssues.filter((item) => item.id !== issue.id));

      Alert.alert("Approve", `Issue "${issue.issueType}" approved and moved to AdminApprovedTickets.`);

      // Navigate to the Review Page
      router.push("/Admin/ReviewAcceptTickets");
    } catch (error) {
      console.error("Error saving approved ticket:", error);
      Alert.alert("Error", "Failed to approve the ticket. Try again.");
    }
  };



  const handleReject = (issue) => {
    setSelectedIssue(issue);
    setRejectModalVisible(true);
  };

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Error", "Rejection reason cannot be empty.");
      return;
    }
    try {
      const db = getFirestore(getApp());
      await addDoc(collection(db, "AdminRejectTickets"), {
        imageUrl: selectedIssue.imageUrl,
        description: selectedIssue.description,
        issueType: selectedIssue.issueType,
        priority: selectedIssue.priority,
        rejectionReason: rejectReason,
        timestamp: new Date(),
      });
      setIssueData((prevIssues) => prevIssues.filter((item) => item.id !== selectedIssue.id));
      Alert.alert("Rejected", `Issue "${selectedIssue.issueType}" has been rejected.`);
      setRejectModalVisible(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error saving rejected ticket:", error);
      Alert.alert("Error", "Failed to reject the ticket. Try again.");
    }
  };


  const logoutAdmin = () => {
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
        console.log("Admin login", user);
      }
    } catch (error) {
      console.log("Error fetching user", error);
    }
  }

  useEffect(() => {
    whologgedin();
  }, []);

  const adminapprovedtickets = () => {
    router.push('/Admin/ReviewAcceptTickets');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={logoutAdmin} style={styles.backButton}>
                <AntDesign name="logout" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>
            <Text style={{}}>City: {adminCity}</Text>


            {/* Stats Grid */}
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

            {/* Filter Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Filter by Priority</Text>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
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
                      {priority} {priority !== "All" && "Priority"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterTitle}>Filter by Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

            {/* Title for Issues List */}
            <Text style={styles.issuesTitle}>Issues Raised</Text>
          </>
        }
        data={issuesss}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.issueCard}>
            <Text style={styles.issueTitle}>{item.issueType}</Text>
            <Text style={styles.issueDetails}>
              Priority: {item.priority} | Upvotes : {item.upvotes} | Downvotes : {item.downvotes}
            </Text>
            <Image source={{ uri: item.imageUrl }} style={styles.issueImage} />
            <Text style={styles.description}>{item.description}</Text>
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
        ListFooterComponent={
          <TouchableOpacity style={styles.button} onPress={adminapprovedtickets}>
            <Text style={styles.buttonText}>Review Tickets</Text>
          </TouchableOpacity>
        }
      />

      {/* Reject Modal */}
      <Modal visible={isRejectModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Rejection Reason:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reason here..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <TouchableOpacity style={styles.submitButton} onPress={submitRejection}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
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
    marginBottom: 10,
  },
  issueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  issueDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  issueImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginLeft: 0,
    marginBottom: 20,
    resizeMode: "cover",
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    color: "#007BFF",
  },
});

export default AdminDashboard;
