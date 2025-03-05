import { Text, View, Image, StyleSheet, Dimensions } from "react-native";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/enterpage.jpg")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.text}>National Road Safety Issue Protal</Text>
        </View>

        <View>
          <Link href="/logindetails/LoginDetails">
            <Text style={styles.linkText}>Get Started</Text>
          </Link>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height,
    position: "absolute",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 50,
  },
  linkText: {
    fontSize: 18,
    color: "#007bff",
    marginBottom: 50,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
});
