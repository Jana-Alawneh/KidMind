import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import {
    ArrowLeft,
} from "lucide-react-native";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import AIInsights from "@/components/childProfile/AIInsights";
import ChildInfoCard from "@/components/childProfile/ChildInfoCard";
import CognitiveScores from "@/components/childProfile/CognitiveScores";
import ProgressChart from "@/components/childProfile/ProgressChart";
import ReportsTable from "@/components/childProfile/ReportsTable";
import SessionsTimeline from "@/components/childProfile/SessionsTimeline";

export default function ChildProfile() {

  const { id } = useLocalSearchParams();

  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
      >

        <Navbar
          onMenuPress={() => {
            setSidebarVisible(true);
          }}
        />

        <TouchableOpacity

          style={styles.backButton}

          onPress={() => {

            router.push("/children");

          }}

        >

          <ArrowLeft

            size={20}

            color="#7B6EF6"

          />

          <Text style={styles.backText}>
            Back to Children
          </Text>

        </TouchableOpacity>

        <Text style={styles.childId}>
          Child ID #{id}
        </Text>

        <ChildInfoCard />

        <CognitiveScores />

        <AIInsights />

        <ProgressChart />

        <SessionsTimeline />

        <ReportsTable />

      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => {
          setSidebarVisible(false);
        }}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F7F8FC",

  },

  content: {

    padding: 20,

    paddingBottom: 40,

    gap: 20,

  },

  backButton: {

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    marginTop: 25,

  },

  backText: {

    color: "#7B6EF6",

    fontWeight: "600",

  },

  childId: {

    marginTop: 15,

    color: "#64748B",

  },

});