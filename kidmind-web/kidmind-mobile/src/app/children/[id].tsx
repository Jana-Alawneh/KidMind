import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ArrowLeft,
  Play,
} from "lucide-react-native";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import AIInsights from "@/components/childProfile/AIInsights";
import ChildInfoCard from "@/components/childProfile/ChildInfoCard";
import CognitiveScores from "@/components/childProfile/CognitiveScores";
import ProgressChart from "@/components/childProfile/ProgressChart";
import ReportsTable from "@/components/childProfile/ReportsTable";
import SessionsTimeline from "@/components/childProfile/SessionsTimeline";

import EditChildModal from "@/components/children/EditChildModal";

import StartSessionModal from "@/components/sessions/StartSessionModal";

import {
  getChildById,
} from "@/api/childrenApi";

import type {
  Child,
} from "@/api/childrenApi";


export default function ChildProfile() {

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();


  const childId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;


  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);


  const [
    child,
    setChild,
  ] = useState<Child | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    editModalOpen,
    setEditModalOpen,
  ] = useState(false);


  const [
    startSessionOpen,
    setStartSessionOpen,
  ] = useState(false);


  const loadChild =
    useCallback(
      async () => {

        const numericId =
          Number(childId);


        if (
          !Number.isInteger(
            numericId
          ) ||
          numericId <= 0
        ) {

          setError(
            "Invalid child ID"
          );

          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError("");


          const childData =
            await getChildById(
              numericId
            );


          setChild(
            childData
          );

        } catch (loadError) {

          console.error(
            "Failed to load child:",
            loadError
          );


          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load child information"
          );

        } finally {

          setLoading(false);

        }

      },
      [childId]
    );


  useEffect(() => {

    loadChild();

  }, [loadChild]);


  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <Navbar
          onMenuPress={() => {
            setSidebarVisible(
              true
            );
          }}
        />


        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() => {
            router.push(
              "/children"
            );
          }}
        >

          <ArrowLeft
            size={20}
            color="#7B6EF6"
          />

          <Text
            style={
              styles.backText
            }
          >
            Back to Children
          </Text>

        </TouchableOpacity>


        {loading && (

          <View
            style={
              styles.loadingBox
            }
          >

            <ActivityIndicator
              size="large"
              color="#7B6EF6"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading child information...
            </Text>

          </View>

        )}


        {!loading &&
          error && (

          <View
            style={
              styles.errorBox
            }
          >

            <Text
              style={
                styles.errorTitle
              }
            >
              Unable to load child
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>


            <TouchableOpacity
              style={
                styles.returnButton
              }
              onPress={() => {
                router.push(
                  "/children"
                );
              }}
            >

              <Text
                style={
                  styles.returnButtonText
                }
              >
                Return to Children
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {!loading &&
          !error &&
          child && (

          <>

            <ChildInfoCard
              child={child}
              onEdit={() => {
                setEditModalOpen(
                  true
                );
              }}
            />


            <TouchableOpacity
              style={
                styles.startSessionButton
              }
              activeOpacity={0.85}
              onPress={() => {
                setStartSessionOpen(
                  true
                );
              }}
            >

              <View
                style={
                  styles.startSessionIcon
                }
              >

                <Play
                  size={21}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                />

              </View>


              <View
                style={
                  styles.startSessionTextContainer
                }
              >

                <Text
                  style={
                    styles.startSessionTitle
                  }
                >
                  Start Assessment Session
                </Text>

                <Text
                  style={
                    styles.startSessionSubtitle
                  }
                >
                  Select one or more games
                  for {child.full_name}
                </Text>

              </View>

            </TouchableOpacity>


            <CognitiveScores />

            <AIInsights />

            <ProgressChart />

            <SessionsTimeline />

            <ReportsTable />

          </>

        )}

      </ScrollView>


      {editModalOpen &&
        child && (

        <EditChildModal
          child={child}
          close={() => {
            setEditModalOpen(
              false
            );
          }}
          onSuccess={
            loadChild
          }
        />

      )}


      {startSessionOpen &&
        child && (

        <StartSessionModal
          visible={
            startSessionOpen
          }
          child={child}
          onClose={() => {
            setStartSessionOpen(
              false
            );
          }}
          onStarted={(
            sessionId
          ) => {

            setStartSessionOpen(
              false
            );


            router.push({
              pathname:
                "/sessions/[id]",

              params: {
                id: String(
                  sessionId
                ),
              },
            });

          }}
        />

      )}


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


    loadingBox: {
      minHeight: 350,

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 14,
    },


    loadingText: {
      color: "#64748B",
    },


    errorBox: {
      marginTop: 20,

      padding: 22,

      borderRadius: 18,

      backgroundColor:
        "#FEF2F2",

      borderWidth: 1,

      borderColor:
        "#FECACA",
    },


    errorTitle: {
      color: "#B91C1C",

      fontSize: 18,

      fontWeight: "700",
    },


    errorText: {
      color: "#B91C1C",

      marginTop: 8,
    },


    returnButton: {
      marginTop: 18,

      alignSelf:
        "flex-start",

      backgroundColor:
        "#DC2626",

      paddingHorizontal: 18,

      paddingVertical: 11,

      borderRadius: 10,
    },


    returnButtonText: {
      color: "#FFFFFF",

      fontWeight: "600",
    },


    startSessionButton: {
      minHeight: 84,

      padding: 16,

      borderRadius: 20,

      backgroundColor:
        "#7B6EF6",

      flexDirection: "row",

      alignItems: "center",

      gap: 14,

      shadowColor: "#7B6EF6",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.2,

      shadowRadius: 8,

      elevation: 4,
    },


    startSessionIcon: {
      width: 48,

      height: 48,

      borderRadius: 16,

      backgroundColor:
        "rgba(255, 255, 255, 0.18)",

      alignItems: "center",

      justifyContent:
        "center",
    },


    startSessionTextContainer: {
      flex: 1,
    },


    startSessionTitle: {
      color: "#FFFFFF",

      fontSize: 17,

      fontWeight: "800",
    },


    startSessionSubtitle: {
      color: "#EDE9FE",

      lineHeight: 19,

      marginTop: 4,
    },

  });