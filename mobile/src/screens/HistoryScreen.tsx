/**
 * History screen — displays past diagnostic results.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function HistoryScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.empty}>No scans yet. Start your first scan!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
