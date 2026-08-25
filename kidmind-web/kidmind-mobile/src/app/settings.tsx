import {
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileSettings from "@/components/settings/MobileSettings";

export default function Settings() {
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
        style={
          styles.page
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
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

          <MobileSettings
            role="therapist"
          />
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

    page: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
  });
