import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

const SuperAdminReview = () => {
  // Sample unresolved tickets data
  const [unresolvedTickets, setUnresolvedTickets] = useState([
    {
      id: "1",
      title: "Large pothole on the highway",
      locality: "Downtown",
      priority: "High",
      likes: 80,
      category: "Potholes",
    },
    {
      id: "2",
      title: "Broken streetlight near school",
      locality: "Greenwood",
      priority: "Low",
      likes: 25,
      category: "Street Lights",
    },
    {
      id: "3",
      title: "Traffic signal malfunction",
      locality: "Uptown",
      priority: "High",
      likes: 60,
      category: "Traffic Lights",
    },
  ]);

  // Approve action: Alert and remove ticket from the list
  const handleApprove = (ticket) => {
    Alert.alert("Approved", `Issue "${ticket.title}" has been approved.`);
    setUnresolvedTickets(unresolvedTickets.filter((t) => t.id !== ticket.id));
  };

  // Reject action: Alert and remove ticket from the list
  const handleReject = (ticket) => {
    Alert.alert("Rejected", `Issue "${ticket.title}" has been rejected.`);
    setUnresolvedTickets(unresolvedTickets.filter((t) => t.id !== ticket.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unresolved Tickets</Text>
      {unresolvedTickets.length > 0 ? (
        <FlatList
          data={unresolvedTickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.ticketTitle}>{item.title}</Text>
              <Text style={styles.ticketDetails}>
                Locality: {item.locality} | Priority: {item.priority}
              </Text>
              <Text style={styles.ticketDetails}>
                Category: {item.category} | Likes: {item.likes}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(item)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(item)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noTickets}>No unresolved tickets found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  ticketDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 8,
    marginRight: 4,
    backgroundColor: "#28A745",
    borderRadius: 5,
    alignItems: "center",
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 4,
    backgroundColor: "#DC3545",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  noTickets: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
});

export default SuperAdminReview;
