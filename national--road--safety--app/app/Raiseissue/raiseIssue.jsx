import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Firestore import
import { db, storage } from "../Service/firebaseConnection"; // Firebase JS SDK import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";  // Import location module
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RaiseIssue() {
  const [issuesoptions, setIssuesoptions] = useState([]);
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [statesOptions, setStatesOptions] = useState([]);
  const [districtsoptions, setDistrictsoptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [mediaPermission, setMediaPermission] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Once you submit, you can't able edit the issue. Check it clearly");
  const [issueDetails, setIssueDetails] = useState({
    issueType: '',
    state: '',
    district: '',
    city: '',
    priority: '',
    landmark: '',
    description: '',
    NH: '',
    username: '',
    status: "Not Yet Started",
  })


  const fetchIssues = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "IssueLists"));
      const issueList = querySnapshot.docs.map((doc) => ({
        label: doc.data().label,
        value: doc.data().value,
      }));

      setIssuesoptions(issueList);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };


  const fetchPriorities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Priority"));
      const priorities = querySnapshot.docs.map((doc) => ({
        label: doc.data().label,
        value: doc.id,
      }));
      setPriorityOptions(priorities);
    } catch (error) {
      console.error("Error fetching priorities:", error);
    }
  };


  const fetchStates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "State"));
      const stateList = querySnapshot.docs.map((doc) => ({
        label: doc.data().label,
        value: doc.data().value,
      }));
      setStatesOptions(stateList);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };


  const fetchDistricts = async (stateValue) => {
    try {
      let collectionName = "";

      switch (stateValue) {
        case "1":
          collectionName = "TNState";
          break;
        case "2":
          collectionName = "KarnatakaState";
          break;
        default:
          setDistrictsoptions([]);
          return;
      }

      const querySnapshot = await getDocs(collection(db, collectionName));
      const districtList = querySnapshot.docs.map((doc) => ({
        label: doc.data().label,
        value: doc.data().value,
      }));

      setDistrictsoptions(districtList);
    } catch (error) {
      console.error(`Error fetching districts for state ${stateValue}:`, error);
    }
  };


  const fetchTaluks = async (districtValue) => {
    try {
      let collectionName = "";

      switch (districtValue) {
        case "1":
          collectionName = "MDUTaluk";
          break;
        case "2":
          collectionName = "CHNTaluk";
          break;
        default:
          setCitiesOptions([]);
          return;
      }

      const querySnapshot = await getDocs(collection(db, collectionName));
      const talukList = querySnapshot.docs.map((doc) => ({
        label: doc.data().label,
        value: doc.data().value,
      }));

      setCitiesOptions(talukList);
    } catch (error) {
      console.error(`Error fetching taluks for district ${districtValue}:`, error);
    }
  };



  // Request Permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(status === "granted");

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status === 'granted');
    })();

    fetchPriorities();
    fetchStates();
    fetchDistricts();
    fetchIssues();
  }, []);

  // Fetch Live Location
  const fetchCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert("Permission Required", "Please allow location access in settings.");
      return;
    }

    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert("Location Services Disabled", "Please enable location services in settings.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!loc) {
        loc = await Location.getLastKnownPositionAsync({});
      }

      if (loc) {
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }


      console.log("Live Location:", loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Could not fetch location. Make sure GPS is enabled.");
    }
  };


  // Open Camera and Fetch Location
  const openCamera = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "You need to allow access to the camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      await fetchCurrentLocation();  // Fetch location after capturing the image
    }
  };

  // Open Gallery
  // const openGallery = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaType.IMAGE,
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets?.[0]?.uri) {
  //     setImageUri(result.assets[0].uri);
  //     extractLocation(result.assets[0].uri);
  //   }
  // };

  // // Extract Location from Image
  // const extractLocation = async (uri) => {
  //   if (!mediaPermission) {
  //     Alert.alert("Permission Required", "You need to allow access to media library.");
  //     return;
  //   }

  //   try {
  //     console.log("Fetching asset info for URI:", uri);

  //     // Ensure the image is in the Media Library
  //     const asset = await MediaLibrary.createAssetAsync(uri);
  //     const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id); // Use `asset.id` instead of `uri`

  //     if (!assetInfo || !assetInfo.exif) {
  //       console.log("No metadata found:", assetInfo);
  //       setLocation("No GPS data found in image. Enter manually.");
  //       return;
  //     }

  //     if (assetInfo.location?.latitude && assetInfo.location?.longitude) {
  //       setLocation({
  //         latitude: assetInfo.location.latitude,
  //         longitude: assetInfo.location.longitude,
  //       });
  //       console.log("Location fetched successfully:", assetInfo.location.latitude, assetInfo.location.longitude);
  //     } else {
  //       setLocation("No GPS data found in image. Enter manually.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching image metadata:", error);
  //     setLocation("Error fetching location data.");
  //   }
  // };




  const handleIssueSelection = (item) => {
    setSelectedIssue(item.label);
    setIssueDetails((prevState) => ({ ...prevState, issueType: item.label }))
    setIsFormVisible(true);
  };

  const selectingState = (state) => {
    setIssueDetails((prevState) => ({ ...prevState, state: state.value, district: "", city: ""  }));
    fetchDistricts(state.value)
  };

  const selectingDistrict = (district) => {
    setIssueDetails((prevState) => ({ ...prevState, district: district.value, city: "" }));
    fetchTaluks(district.value);
  };

  const selectingCity = (city) => {
    setIssueDetails((prevState) => ({ ...prevState, city: city.value}));
  };

  const selectingPriority = (priority) => {
    setIssueDetails((prevState) => ({ ...prevState, priority: priority.value }))
  }

  const confirmSubmit = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select an image.");
      return;
    }

    if (!issueDetails.issueType || !issueDetails.state || !issueDetails.city || !issueDetails.district) {
      Alert.alert("Error", "Fill all the required fields.");
      return;
    }

    try {
      // fetch email
      const email = await AsyncStorage.getItem('user');
      if (!email) {
        Alert.alert("Error", "User email not found.");
        return;
      }

      const imageName = `images/${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();  // Ensure the correct conversion

      const imageRef = ref(storage, imageName);
      await uploadBytes(imageRef, blob);

      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'issues'), {
        ...issueDetails,
        imageUrl,
        createdAt: new Date(),
        username: email,
      });

      Alert.alert("Success", "Issue raised successfully!");
      router.push('/Issueraised/issueRaisedpage');
    } catch (error) {
      console.error("Firebase Storage Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const submitIssue = () => {
    setAlertMessage("Are you sure you want to submit? This action can't be undone.");

    Alert.alert(
      "Confirmation",
      alertMessage,
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => confirmSubmit() }
      ]
    );
  }

  return (

    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise an Issue</Text>
      </View>

      {selectedIssue && <Text style={styles.selectedIssueText}>Selected Issue: {selectedIssue}</Text>}


      {!selectedIssue && (
        <View style={styles.card}>
          <Dropdown
            style={styles.dropdown}
            data={issuesoptions}
            labelField="label"
            valueField="value"
            placeholder="Select an Issue"
            value={issueDetails.issueType}
            onChange={handleIssueSelection}
          />
        </View>
      )}

      {isFormVisible && (
        <View style={styles.card}>

          <TouchableOpacity style={styles.input} onPress={openCamera} >
            <Text >open camera</Text>
          </TouchableOpacity>

          <Dropdown style={styles.dropdown}
            data={statesOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a State"
            value={issueDetails.state}
            onChange={selectingState}
          />

          <Dropdown style={styles.dropdown}
            data={districtsoptions}
            labelField="label"
            valueField="value"
            placeholder="Select a District"
            value={issueDetails.district}
            disabled={!issueDetails.state}
            onChange={selectingDistrict}
          />

          <Dropdown style={styles.dropdown}
            data={citiesOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a Thaluk"
            value={issueDetails.city}
            onChange={selectingCity}
          />

          <Dropdown style={styles.dropdown}
            data={priorityOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a Priority"
            value={issueDetails.priority}
            onChange={selectingPriority}
          />

          {location && (
            <Text style={{ marginTop: 10 }}>
              Location: {typeof location === "string" ? location : `${location.latitude}, ${location.longitude}`}
            </Text>
          )}

          <TextInput style={styles.input} placeholder="Landmark" keyboardType="default" onChangeText={(text) =>
            setIssueDetails((prevState) => ({ ...prevState, landmark: text }))
          } />
          <TextInput style={styles.input} placeholder="Describe the issue..." multiline numberOfLines={3} onChangeText={(text) =>
            setIssueDetails((prevState) => ({ ...prevState, description: text }))} />

          <Text>
            NH details if you know enter
          </Text>

          <TextInput style={styles.input} placeholder="NH" keyboardType="default" />
          {imageUri && (
            <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />
          )}
          <TouchableOpacity style={styles.submitButton} onPress={submitIssue}>
            <Text style={styles.submitButtonText}>Submit Issue</Text>
          </TouchableOpacity>

        </View>

      )}
    </ScrollView >

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
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    marginBottom: 13,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderRadius: 10,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedIssueText: {
    margin: 15,
    fontSize: 16
  },
});