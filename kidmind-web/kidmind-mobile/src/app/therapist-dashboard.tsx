import {
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Stethoscope,
} from "lucide-react-native";

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
  ] =
    useState(false);


  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "bottom",
      ]}
    >

      <View
        style={
          styles.container
        }
      >

        <Navbar
          onMenuPress={() => {

            setSidebarVisible(
              true
            );

          }}
        />


        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >

          <View
            style={
              styles.welcomeCard
            }
          >

            <View
              style={
                styles.welcomeContent
              }
            >

              <Text
                style={
                  styles.eyebrow
                }
              >
                THERAPIST WORKSPACE
              </Text>


              <Text
                style={
                  styles.welcomeTitle
                }
              >
                Welcome back
              </Text>


              <Text
                style={
                  styles.welcomeDescription
                }
              >
                Review children&apos;s progress,
                manage assessment sessions and
                monitor cognitive performance
                from one organized workspace.
              </Text>

            </View>


            <View
              style={
                styles.welcomeIcon
              }
            >

              <Stethoscope
                size={27}
                color="#FFFFFF"
              />

            </View>

          </View>


          <StatsSection />


          <View
            style={
              styles.section
            }
          >
            <PerformanceChart />
          </View>


          <View
            style={
              styles.section
            }
          >
            <QuickActions />
          </View>


          <View
            style={
              styles.section
            }
          >
            <TodaySessions />
          </View>


          <View
            style={
              styles.section
            }
          >
            <AIRecommendation />
          </View>


          <View
            style={
              styles.section
            }
          >
            <RecentChildren />
          </View>


          <View
            style={
              styles.section
            }
          >
            <RecentAssessments />
          </View>

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

    safeArea: {

      flex: 1,

      backgroundColor:
        "#F7F8FC",

    },


    container: {

      flex: 1,

      backgroundColor:
        "#F7F8FC",

    },


    content: {

      paddingHorizontal:
        18,

      paddingTop:
        20,

      paddingBottom:
        36,

    },


    welcomeCard: {

      minHeight:
        178,

      borderRadius:
        24,

      backgroundColor:
        "#806EF0",

      paddingHorizontal:
        22,

      paddingVertical:
        24,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      overflow:
        "hidden",

      shadowColor:
        "#7769F2",

      shadowOffset: {
        width: 0,
        height: 10,
      },

      shadowOpacity:
        0.16,

      shadowRadius:
        20,

      elevation:
        5,

    },


    welcomeContent: {

      flex:
        1,

      paddingRight:
        18,

    },


    eyebrow: {

      color:
        "rgba(255,255,255,0.75)",

      fontSize:
        10,

      fontWeight:
        "800",

      letterSpacing:
        1.1,

    },


    welcomeTitle: {

      marginTop:
        8,

      color:
        "#FFFFFF",

      fontSize:
        25,

      lineHeight:
        31,

      fontWeight:
        "700",

    },


    welcomeDescription: {

      marginTop:
        7,

      maxWidth:
        290,

      color:
        "rgba(255,255,255,0.82)",

      fontSize:
        12,

      lineHeight:
        18,

    },


    welcomeIcon: {

      width:
        58,

      height:
        58,

      flexShrink:
        0,

      borderRadius:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "rgba(255,255,255,0.15)",

      borderWidth:
        1,

      borderColor:
        "rgba(255,255,255,0.20)",

    },


    section: {

      marginTop:
        18,

    },

  });