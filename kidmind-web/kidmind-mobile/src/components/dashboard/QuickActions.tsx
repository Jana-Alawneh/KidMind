import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  FileText,
  UserPlus,
  X,
  Zap,
} from "lucide-react-native";

import AddChildModal from "../children/AddChildModal";
import StartSessionModal from "../sessions/StartSessionModal";

import {
  getSessions,
} from "@/api/sessionsApi";

import {
  getChildren,
} from "@/api/childrenApi";


const parseDate = (
  value:
    | string
    | null
    | undefined
): Date | null => {

  if (!value) {
    return null;
  }


  const date =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;

};


const getSessionDate = (
  session: any
): Date | null => {

  return (
    parseDate(
      session.ended_at
    ) ||
    parseDate(
      session.started_at
    ) ||
    parseDate(
      session.scheduled_at
    ) ||
    parseDate(
      session.created_at
    )
  );

};


const getTimestamp = (
  date: Date | null
) => {

  return (
    date?.getTime() ??
    0
  );

};


const formatDate = (
  date: Date | null
) => {

  if (!date) {
    return "—";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  );

};


const getActivityText = (
  session: any
) => {

  const games =
    Array.isArray(
      session.games
    )
      ? session.games
      : [];


  if (
    games.length ===
    0
  ) {
    return "Assessment Session";
  }


  if (
    games.length ===
    1
  ) {

    return (
      games[0]?.game_name ||
      "Assessment Session"
    );

  }


  return `${games.length} Assessment Games`;

};


const QuickActions = () => {

  const [
    addChildOpen,
    setAddChildOpen,
  ] =
    useState(false);


  const [
    startSessionOpen,
    setStartSessionOpen,
  ] =
    useState(false);


  const [
    reportModalOpen,
    setReportModalOpen,
  ] =
    useState(false);


  const [
    completedSessions,
    setCompletedSessions,
  ] =
    useState<any[]>([]);


  const [
    selectedReportSessionId,
    setSelectedReportSessionId,
  ] =
    useState<number | null>(
      null
    );


  const [
    reportsLoading,
    setReportsLoading,
  ] =
    useState(false);


  const [
    reportsError,
    setReportsError,
  ] =
    useState("");


  const openReportModal =
    async () => {

      try {

        setReportModalOpen(
          true
        );

        setReportsLoading(
          true
        );

        setReportsError(
          ""
        );

        setSelectedReportSessionId(
          null
        );


        const [
          sessionsData,
          childrenData,
        ] =
          await Promise.all([
            getSessions(),
            getChildren(),
          ]);


        const allSessions =
          Array.isArray(
            sessionsData
          )
            ? sessionsData
            : [];


        const allChildren =
          Array.isArray(
            childrenData
          )
            ? childrenData
            : [];


        const reports =
          allSessions
            .filter(
              session =>
                session.status ===
                "Completed"
            )
            .map(
              session => {

                const child =
                  allChildren.find(
                    item =>
                      Number(
                        item.id
                      ) ===
                      Number(
                        session.child_id
                      )
                  );


                return {
                  ...session,

                  dashboardDate:
                    getSessionDate(
                      session
                    ),

                  dashboardChildName:
                    session.child_name ||
                    child?.full_name ||
                    `Child #${session.child_id}`,

                  dashboardActivity:
                    getActivityText(
                      session
                    ),
                };

              }
            )
            .sort(
              (
                first,
                second
              ) =>
                getTimestamp(
                  second.dashboardDate
                ) -
                getTimestamp(
                  first.dashboardDate
                )
            );


        setCompletedSessions(
          reports
        );

      } catch (
        error
      ) {

        console.error(
          "Failed to load completed sessions:",
          error
        );


        setReportsError(
          error instanceof Error
            ? error.message
            : "Failed to load completed sessions"
        );

      } finally {

        setReportsLoading(
          false
        );

      }

    };


  const handleOpenReport =
    () => {

      if (
        !selectedReportSessionId
      ) {

        Alert.alert(
          "Select Assessment",
          "Please select a completed assessment."
        );


        return;

      }


      setReportModalOpen(
        false
      );


      router.push({
        pathname:
          "/sessions/[id]",

        params: {
          id:
            String(
              selectedReportSessionId
            ),
        },
      });

    };


  const actions = [
    {
      title:
        "Add Child",

      description:
        "Register a child in your care workspace.",

      icon:
        UserPlus,

      color:
        "#7566EB",

      background:
        "#F0EDFF",

      onPress:
        () => {

          setAddChildOpen(
            true
          );

        },
    },

    {
      title:
        "Create Session",

      description:
        "Start a new cognitive assessment session.",

      icon:
        CalendarPlus,

      color:
        "#5595DD",

      background:
        "#EDF6FF",

      onPress:
        () => {

          setStartSessionOpen(
            true
          );

        },
    },

    {
      title:
        "Generate Report",

      description:
        "Create a report from a completed assessment.",

      icon:
        FileText,

      color:
        "#D867B4",

      background:
        "#FFF0FA",

      onPress:
        openReportModal,
    },
  ];


  return (

    <>

      <View
        style={
          styles.panel
        }
      >

        <View
          style={
            styles.heading
          }
        >

          <View
            style={
              styles.headingIcon
            }
          >

            <Zap
              size={18}
              color="#7465E8"
            />

          </View>


          <View>

            <Text
              style={
                styles.title
              }
            >
              Quick Actions
            </Text>


            <Text
              style={
                styles.headingSubtitle
              }
            >
              Common therapist tasks
            </Text>

          </View>

        </View>


        <View
          style={
            styles.actionList
          }
        >

          {
            actions.map(
              action => {

                const Icon =
                  action.icon;


                return (

                  <TouchableOpacity
                    key={
                      action.title
                    }
                    activeOpacity={
                      0.75
                    }
                    onPress={
                      action.onPress
                    }
                    style={
                      styles.actionButton
                    }
                  >

                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor:
                            action.background,
                        },
                      ]}
                    >

                      <Icon
                        size={19}
                        color={
                          action.color
                        }
                      />

                    </View>


                    <View
                      style={
                        styles.actionContent
                      }
                    >

                      <Text
                        style={
                          styles.actionTitle
                        }
                      >
                        {action.title}
                      </Text>


                      <Text
                        style={
                          styles.actionDescription
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {action.description}
                      </Text>

                    </View>


                    <ArrowUpRight
                      size={17}
                      color="#B0B2C1"
                    />

                  </TouchableOpacity>

                );

              }
            )
          }

        </View>

      </View>


      {
        addChildOpen && (

          <AddChildModal
            close={() => {

              setAddChildOpen(
                false
              );

            }}
            onSuccess={() => {

              setAddChildOpen(
                false
              );

            }}
          />

        )
      }


      <StartSessionModal
        visible={
          startSessionOpen
        }
        onClose={() => {

          setStartSessionOpen(
            false
          );

        }}
        onStarted={
          sessionId => {

            setStartSessionOpen(
              false
            );


            router.push({
              pathname:
                "/sessions/[id]",

              params: {
                id:
                  String(
                    sessionId
                  ),
              },
            });

          }
        }
      />


      <Modal
        visible={
          reportModalOpen
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {

          setReportModalOpen(
            false
          );

        }}
      >

        <SafeAreaView
          style={
            styles.modalSafeArea
          }
          edges={[
            "top",
            "bottom",
          ]}
        >

          <View
            style={
              styles.overlay
            }
          >

            <View
              style={
                styles.reportModal
              }
            >

              <View
                style={
                  styles.reportHeader
                }
              >

                <View
                  style={
                    styles.reportHeaderLeft
                  }
                >

                  <View
                    style={
                      styles.reportIconBox
                    }
                  >

                    <FileText
                      size={20}
                      color="#D867B4"
                    />

                  </View>


                  <View
                    style={
                      styles.reportHeaderText
                    }
                  >

                    <Text
                      style={
                        styles.reportTitle
                      }
                    >
                      Generate Report
                    </Text>


                    <Text
                      style={
                        styles.reportSubtitle
                      }
                    >
                      Select a completed assessment session
                    </Text>

                  </View>

                </View>


                <TouchableOpacity
                  style={
                    styles.closeButton
                  }
                  onPress={() => {

                    setReportModalOpen(
                      false
                    );

                  }}
                >

                  <X
                    size={18}
                    color="#8E91A4"
                  />

                </TouchableOpacity>

              </View>


              {
                reportsLoading && (

                  <View
                    style={
                      styles.reportState
                    }
                  >

                    <ActivityIndicator
                      color="#7B6EF6"
                    />


                    <Text
                      style={
                        styles.reportStateText
                      }
                    >
                      Loading completed assessments...
                    </Text>

                  </View>

                )
              }


              {
                !reportsLoading &&
                reportsError !==
                  "" && (

                  <View
                    style={
                      styles.errorBox
                    }
                  >

                    <Text
                      style={
                        styles.errorText
                      }
                    >
                      {reportsError}
                    </Text>

                  </View>

                )
              }


              {
                !reportsLoading &&
                reportsError ===
                  "" &&
                completedSessions.length ===
                  0 && (

                  <View
                    style={
                      styles.reportState
                    }
                  >

                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      No completed assessments
                    </Text>


                    <Text
                      style={
                        styles.reportStateText
                      }
                    >
                      Complete an assessment session first to generate a report.
                    </Text>

                  </View>

                )
              }


              {
                !reportsLoading &&
                reportsError ===
                  "" &&
                completedSessions.length >
                  0 && (

                  <>

                    <Text
                      style={
                        styles.selectLabel
                      }
                    >
                      Completed Assessment
                    </Text>


                    <ScrollView
                      style={
                        styles.reportList
                      }
                      showsVerticalScrollIndicator={
                        false
                      }
                    >

                      {
                        completedSessions.map(
                          session => {

                            const selected =
                              Number(
                                selectedReportSessionId
                              ) ===
                              Number(
                                session.id
                              );


                            return (

                              <TouchableOpacity
                                key={
                                  session.id
                                }
                                activeOpacity={
                                  0.8
                                }
                                onPress={() => {

                                  setSelectedReportSessionId(
                                    Number(
                                      session.id
                                    )
                                  );

                                }}
                                style={[
                                  styles.reportOption,

                                  selected &&
                                    styles.reportOptionSelected,
                                ]}
                              >

                                <View
                                  style={
                                    styles.reportOptionContent
                                  }
                                >

                                  <Text
                                    style={[
                                      styles.reportChildName,

                                      selected &&
                                        styles.reportChildNameSelected,
                                    ]}
                                  >
                                    {session.dashboardChildName}
                                  </Text>


                                  <Text
                                    style={
                                      styles.reportMeta
                                    }
                                  >
                                    Session #{session.id}
                                    {"  •  "}
                                    {session.dashboardActivity}
                                  </Text>


                                  <Text
                                    style={
                                      styles.reportDate
                                    }
                                  >
                                    {formatDate(
                                      session.dashboardDate
                                    )}
                                  </Text>

                                </View>


                                <View
                                  style={[
                                    styles.radio,

                                    selected &&
                                      styles.radioSelected,
                                  ]}
                                >

                                  {
                                    selected && (

                                      <Check
                                        size={14}
                                        color="#FFFFFF"
                                      />

                                    )
                                  }

                                </View>

                              </TouchableOpacity>

                            );

                          }
                        )
                      }

                    </ScrollView>


                    <View
                      style={
                        styles.reportActions
                      }
                    >

                      <TouchableOpacity
                        style={
                          styles.cancelButton
                        }
                        onPress={() => {

                          setReportModalOpen(
                            false
                          );

                        }}
                      >

                        <Text
                          style={
                            styles.cancelButtonText
                          }
                        >
                          Cancel
                        </Text>

                      </TouchableOpacity>


                      <TouchableOpacity
                        style={[
                          styles.generateButton,

                          !selectedReportSessionId &&
                            styles.generateButtonDisabled,
                        ]}
                        disabled={
                          !selectedReportSessionId
                        }
                        onPress={
                          handleOpenReport
                        }
                      >

                        <FileText
                          size={16}
                          color="#FFFFFF"
                        />


                        <Text
                          style={
                            styles.generateButtonText
                          }
                        >
                          Generate Report
                        </Text>

                      </TouchableOpacity>

                    </View>

                  </>

                )
              }

            </View>

          </View>

        </SafeAreaView>

      </Modal>

    </>

  );

};


const styles =
  StyleSheet.create({

    panel: {

      padding:
        18,

      borderRadius:
        21,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.035,

      shadowRadius:
        12,

      elevation:
        2,

    },


    heading: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      marginBottom:
        16,

    },


    headingIcon: {

      width:
        38,

      height:
        38,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },


    title: {

      color:
        "#333554",

      fontSize:
        16,

      fontWeight:
        "700",

    },


    headingSubtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        10.5,

    },


    actionList: {

      gap:
        9,

    },


    actionButton: {

      minHeight:
        76,

      padding:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,

      borderRadius:
        15,

      backgroundColor:
        "#FCFCFE",

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

    },


    actionIcon: {

      width:
        42,

      height:
        42,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    actionContent: {

      flex:
        1,

      minWidth:
        0,

    },


    actionTitle: {

      color:
        "#3B3D5B",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    actionDescription: {

      marginTop:
        3,

      color:
        "#9A9DAF",

      fontSize:
        10,

      lineHeight:
        14,

    },


    modalSafeArea: {

      flex:
        1,

      backgroundColor:
        "rgba(30,31,50,0.34)",

    },


    overlay: {

      flex:
        1,

      justifyContent:
        "center",

      paddingHorizontal:
        18,

      paddingVertical:
        12,

    },


    reportModal: {

      width:
        "100%",

      maxHeight:
        "86%",

      padding:
        20,

      borderRadius:
        22,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    reportHeader: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,

      marginBottom:
        20,

    },


    reportHeaderLeft: {

      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        11,

    },


    reportIconBox: {

      width:
        43,

      height:
        43,

      borderRadius:
        13,

      backgroundColor:
        "#FFF0FA",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    reportHeaderText: {

      flex:
        1,

    },


    reportTitle: {

      color:
        "#333554",

      fontSize:
        17,

      fontWeight:
        "800",

    },


    reportSubtitle: {

      marginTop:
        3,

      color:
        "#9EA1B3",

      fontSize:
        10.5,

      lineHeight:
        15,

    },


    closeButton: {

      width:
        34,

      height:
        34,

      borderRadius:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F8F8FB",

    },


    reportState: {

      minHeight:
        150,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    reportStateText: {

      marginTop:
        8,

      color:
        "#A0A3B4",

      textAlign:
        "center",

      fontSize:
        11,

      lineHeight:
        17,

    },


    errorBox: {

      minHeight:
        120,

      padding:
        16,

      borderRadius:
        14,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFF0F3",

      borderWidth:
        1,

      borderColor:
        "#F6D8DF",

    },


    errorText: {

      color:
        "#B9415E",

      textAlign:
        "center",

      fontSize:
        11,

    },


    emptyTitle: {

      color:
        "#62657B",

      fontSize:
        13,

      fontWeight:
        "700",

    },


    selectLabel: {

      marginBottom:
        8,

      color:
        "#676A80",

      fontSize:
        11,

      fontWeight:
        "700",

    },


    reportList: {

      maxHeight:
        340,

    },


    reportOption: {

      minHeight:
        78,

      padding:
        13,

      marginBottom:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E7E7EF",

      backgroundColor:
        "#FFFFFF",

    },


    reportOptionSelected: {

      borderColor:
        "#CFC7FF",

      backgroundColor:
        "#F8F6FF",

    },


    reportOptionContent: {

      flex:
        1,

    },


    reportChildName: {

      color:
        "#3B3D5B",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    reportChildNameSelected: {

      color:
        "#6D5CE7",

    },


    reportMeta: {

      marginTop:
        3,

      color:
        "#7D8094",

      fontSize:
        10,

    },


    reportDate: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

    },


    radio: {

      width:
        25,

      height:
        25,

      borderRadius:
        8,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#D7D8E2",

      backgroundColor:
        "#FFFFFF",

    },


    radioSelected: {

      backgroundColor:
        "#7B6EF6",

      borderColor:
        "#7B6EF6",

    },


    reportActions: {

      flexDirection:
        "row",

      gap:
        10,

      marginTop:
        15,

    },


    cancelButton: {

      flex:
        1,

      minHeight:
        44,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E4E5ED",

    },


    cancelButtonText: {

      color:
        "#73768B",

      fontSize:
        11.5,

      fontWeight:
        "700",

    },


    generateButton: {

      flex:
        1,

      minHeight:
        44,

      borderRadius:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      backgroundColor:
        "#7968ED",

    },


    generateButtonDisabled: {

      opacity:
        0.5,

    },


    generateButtonText: {

      color:
        "#FFFFFF",

      fontSize:
        11.5,

      fontWeight:
        "700",

    },

  });


export default QuickActions;