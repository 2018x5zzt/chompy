/**
 * App navigator — bottom tab navigation between Home and History.
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/HomeScreen";
import { HistoryScreen } from "../screens/HistoryScreen";

const Tab = createBottomTabNavigator();

export function AppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#4A90D9",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopColor: "#eee",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerTitle: "Chompy",
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
          headerTitle: "Scan History",
        }}
      />
    </Tab.Navigator>
  );
}
