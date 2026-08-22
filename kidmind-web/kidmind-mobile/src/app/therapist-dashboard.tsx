import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import PerformanceChart from "@/components/dashboard/PerformanceChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentAssessments from "@/components/dashboard/RecentAssessments";
import StatsSection from "@/components/dashboard/StatsSection";
import TodaySessions from "@/components/dashboard/TodaySessions";

import AIRecommendation from "@/components/ui/AIRecommendation";
import RecentChildren from "@/components/ui/RecentChildren";

export default function TherapistDashboard() {
  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <Navbar
            onMenuPress={() => {
              setSidebarVisible(
                true
              );
            }}
          />

          <StatsSection />

          <PerformanceChart />

          <QuickActions />

          <TodaySessions />

          <AIRecommendation />

          <RecentChildren />

          <RecentAssessments />
        </ScrollView>

        <Sidebar
          visible={
            sidebarVisible
          }
          onClose={() => {
            setSidebarVisible(
              false
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
  });