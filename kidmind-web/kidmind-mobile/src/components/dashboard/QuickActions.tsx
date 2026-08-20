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
  router,
} from "expo-router";

import {
  CalendarPlus,
  Check,
  FileText,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react-native";

import Card from "../ui/Card";

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
  ] = useState(false);


  const [
    startSessionOpen,
    setStartSessionOpen,
  ] = useState(false);


  const [
    reportModalOpen,
    setReportModalOpen,
  ] = useState(false);


  const [
    completedSessions,
    setCompletedSessions,
  ] = useState<any[]>([]);


  const [
    selectedReportSessionId,
    setSelectedReportSessionId,
  ] = useState<number | null>(
    null
  );


  const [
    reportsLoading,
    setReportsLoading,
  ] = useState(false);


  const [
    reportsError,
    setReportsError,
  ] = useState("");


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
              (session) =>
                session.status ===
                "Completed"
            )
            .map(
              (session) => {

                const child =
                  allChildren.find(
                    (item) =>
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

      } catch (error) {

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

      icon:
        UserPlus,

      color:
        "#F3EEFF",

      disabled:
        false,

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

      icon:
        CalendarPlus,

      color:
        "#EAF7FF",

      disabled:
        false,

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

      icon:
        FileText,

      color:
        "#FFF4E8",

      disabled:
        false,

      onPress:
        openReportModal,
    },

    {
      title:
        "AI Assistant",

      icon:
        Sparkles,

      color:
        "#EEF8E8",

      disabled:
        true,

      onPress:
        () => {},
    },
  ];


  return (

    <>

      <Card>

        <Text
          style={
            styles.title
          }
        >
          Quick Actions
        </Text>


        <View
          style={
            styles.grid
          }
        >

          {actions.map(
            (action) => {

              const Icon =
                action.icon;


              return (

                <TouchableOpacity
                  key={
                    action.title
                  }
                  activeOpacity={
                    action.disabled
                      ? 1
                      : 0.8
                  }
                  disabled={
                    action.disabled
                  }
                  onPress={
                    action.onPress
                  }
                  style={[
                    styles.actionButton,

                    {
                      backgroundColor:
                        action.color,
                    },

                    action.disabled &&
                      styles.disabledAction,
                  ]}
                >

                  <Icon
                    size={22}
                    color="#7B6EF6"
                  />


                  <Text
                    style={
                      styles.actionText
                    }
                  >
                    {action.title}
                  </Text>


                  {action.disabled && (

                    <Text
                      style={
                        styles.comingSoon
                      }
                    >
                      Coming Soon
                    </Text>

                  )}

                </TouchableOpacity>

              );

            }
          )}

        </View>

      </Card>


      {addChildOpen && (

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

      )}


      <StartSessionModal
        visible={
          startSessionOpen
        }
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
              id:
                String(
                  sessionId
                ),
            },
          });

        }}
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
                    size={23}
                    color="#F59E0B"
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
                onPress={() => {

                  setReportModalOpen(
                    false
                  );

                }}
              >

                <X
                  size={23}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>


            {reportsLoading && (

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

            )}


            {!reportsLoading &&
              reportsError !== "" && (

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

            )}


            {!reportsLoading &&
              reportsError === "" &&
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

            )}


            {!reportsLoading &&
              reportsError === "" &&
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

                  {completedSessions.map(
                    (session) => {

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
                              {" · "}
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

                            {selected && (

                              <Check
                                size={15}
                                color="#FFFFFF"
                              />

                            )}

                          </View>

                        </TouchableOpacity>

                      );

                    }
                  )}

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
                      size={17}
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

            )}

          </View>

        </View>

      </Modal>

    </>

  );

};


const styles =
  StyleSheet.create({

    title: {

      fontSize:
        20,

      fontWeight:
        "600",

      marginBottom:
        24,

    },


    grid: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      gap:
        16,

    },


    actionButton: {

      width:
        "47%",

      borderRadius:
        16,

      padding:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        12,

      minHeight:
        115,

    },


    disabledAction: {

      opacity:
        0.5,

    },


    actionText: {

      fontWeight:
        "600",

      textAlign:
        "center",

      color:
        "#1E293B",

    },


    comingSoon: {

      fontSize:
        10,

      color:
        "#64748B",

      fontWeight:
        "600",

      marginTop:
        -5,

    },


    overlay: {

      flex:
        1,

      backgroundColor:
        "rgba(15, 23, 42, 0.42)",

      justifyContent:
        "center",

      padding:
        18,

    },


    reportModal: {

      width:
        "100%",

      maxHeight:
        "86%",

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        26,

      padding:
        22,

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
        22,

    },


    reportHeaderLeft: {

      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        12,

    },


    reportIconBox: {

      width:
        48,

      height:
        48,

      borderRadius:
        16,

      backgroundColor:
        "#FFF4E8",

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

      fontSize:
        22,

      fontWeight:
        "800",

      color:
        "#172554",

    },


    reportSubtitle: {

      fontSize:
        13,

      color:
        "#64748B",

      marginTop:
        3,

    },


    reportState: {

      minHeight:
        160,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        20,

    },


    reportStateText: {

      fontSize:
        13,

      color:
        "#94A3B8",

      textAlign:
        "center",

      marginTop:
        9,

      lineHeight:
        19,

    },


    errorBox: {

      minHeight:
        130,

      borderRadius:
        16,

      backgroundColor:
        "#FEF2F2",

      padding:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    errorText: {

      color:
        "#DC2626",

      textAlign:
        "center",

      fontSize:
        13,

    },


    emptyTitle: {

      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#475569",

    },


    selectLabel: {

      fontSize:
        14,

      color:
        "#475569",

      fontWeight:
        "700",

      marginBottom:
        10,

    },


    reportList: {

      maxHeight:
        360,

    },


    reportOption: {

      minHeight:
        82,

      borderWidth:
        1,

      borderColor:
        "#E2E8F0",

      borderRadius:
        16,

      padding:
        14,

      marginBottom:
        10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        12,

      backgroundColor:
        "#FFFFFF",

    },


    reportOptionSelected: {

      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#F8F6FF",

    },


    reportOptionContent: {

      flex:
        1,

    },


    reportChildName: {

      fontSize:
        15,

      fontWeight:
        "700",

      color:
        "#334155",

    },


    reportChildNameSelected: {

      color:
        "#6D5CE7",

    },


    reportMeta: {

      fontSize:
        12,

      color:
        "#64748B",

      marginTop:
        4,

    },


    reportDate: {

      fontSize:
        11,

      color:
        "#94A3B8",

      marginTop:
        4,

    },


    radio: {

      width:
        27,

      height:
        27,

      borderRadius:
        9,

      borderWidth:
        1,

      borderColor:
        "#CBD5E1",

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    radioSelected: {

      borderColor:
        "#7B6EF6",

      backgroundColor:
        "#7B6EF6",

    },


    reportActions: {

      flexDirection:
        "row",

      gap:
        12,

      marginTop:
        17,

    },


    cancelButton: {

      flex:
        1,

      minHeight:
        50,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#CBD5E1",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    cancelButtonText: {

      color:
        "#334155",

      fontWeight:
        "700",

    },


    generateButton: {

      flex:
        1,

      minHeight:
        50,

      borderRadius:
        14,

      backgroundColor:
        "#7B6EF6",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        7,

    },


    generateButtonDisabled: {

      opacity:
        0.5,

    },


    generateButtonText: {

      color:
        "#FFFFFF",

      fontSize:
        13,

      fontWeight:
        "700",

    },

  });


export default QuickActions;