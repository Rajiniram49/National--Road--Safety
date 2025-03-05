import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginDetails() {

  const userLogin = () => {
    // router.push('/Home/homePage')
    router.push('/login/loginPage')
  };

  const adminLogin = () => {
    router.push('/AdminLogin/adminLogin')
  };

  const superAdminLogin = () => {
    router.push('/superAdminLogin/SuperadminLogin')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select User Type</Text>

      <TouchableOpacity style={styles.button} onPress={userLogin}>
        <Text style={styles.buttonText}>User</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={adminLogin}>
        <Text style={styles.buttonText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={superAdminLogin}>
        <Text style={styles.buttonText}>Super Admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
