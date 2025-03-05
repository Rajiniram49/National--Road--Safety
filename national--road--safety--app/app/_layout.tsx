import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="loginPage" />
    <Stack.Screen name="homePage" />
    <Stack.Screen name="raiseIssue" />
    <Stack.Screen name="communityPage" />
    <Stack.Screen name="issueRaised" />
    <Stack.Screen name="registerPage" />
    <Stack.Screen name="viewIssueDetails" />
  </Stack>
  );
}

