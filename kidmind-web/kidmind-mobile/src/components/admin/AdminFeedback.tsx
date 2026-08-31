import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ClipboardList,
  RefreshCw,
} from "lucide-react-native";

import {
  getAdminFeedback,
  type FeedbackItem,
} from "@/api/feedbackApi";


const getInitials =
  (
    name?:
      | string
      | null
  ) => {

    return String(
      name ||
      "P"
    )
      .split(
        " "
      )
      .filter(
        Boolean
      )
      .slice(
        0,
        2
      )
      .map(
        part =>
          part.charAt(
            0
          )
      )
      .join(
        ""
      )
      .toUpperCase();

  };


const formatDate =
  (
    value?:
      | string
      | null
  ) => {

    if (
      !value
    ) {

      return "—";

    }


    const date =
      new Date(
        String(
          value
        ).replace(
          " ",
          "T"
        )
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }


    return date.toLocaleString(
      "en-US",
      {
        month:
          "short",
        day:
          "numeric",
        year:
          "numeric",
        hour:
          "numeric",
        minute:
          "2-digit",
      }
    );

  };


export default function AdminFeedback() {

  const [
    feedback,
    setFeedback,
  ] =
    useState<
      FeedbackItem[]
    >(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const loadFeedback =
    useCallback(
      async (
        refresh = false
      ) => {

        try {

          if (
            refresh
          ) {

            setRefreshing(
              true
            );

          } else {

            setLoading(
              true
            );

          }


          setError(
            ""
          );


          const items =
            await getAdminFeedback();


          setFeedback(
            Array.isArray(
              items
            )
              ? items
              : []
          );

        } catch (
          requestError
        ) {

          console.error(
            "Failed to load admin feedback:",
            requestError
          );


          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Unable to load feedback."
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {

      loadFeedback();

    },
    [
      loadFeedback,
    ]
  );


  return (

    <View
      style={
        styles.page
      }
    >

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerMain
          }
        >

          <View
            style={
              styles.headerIcon
            }
          >

            <ClipboardList
              size={24}
              color="#7465E8"
            />

          </View>


          <View
            style={
              styles.headerText
            }
          >

            <Text
              style={
                styles.title
              }
            >
              Parent Feedback
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Feedback submitted
              directly by parents.
            </Text>

          </View>

        </View>


        <Pressable
          disabled={
            refreshing
          }
          onPress={() =>
            loadFeedback(
              true
            )
          }
          style={
            styles.refreshButton
          }
        >

          {
            refreshing
              ? (

                <ActivityIndicator
                  size="small"
                  color="#7465E8"
                />

              )
              : (

                <RefreshCw
                  size={18}
                  color="#7465E8"
                />

              )
          }

        </Pressable>

      </View>


      <View
        style={
          styles.summaryCard
        }
      >

        <Text
          style={
            styles.summaryLabel
          }
        >
          Total Feedback
        </Text>

        <Text
          style={
            styles.summaryValue
          }
        >
          {
            feedback.length
          }
        </Text>

      </View>


      {
        error
          ? (

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
                Unable to load feedback
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {
                  error
                }
              </Text>

            </View>

          )
          : null
      }


      {
        loading
          ? (

            <View
              style={
                styles.stateCard
              }
            >

              <ActivityIndicator
                size="large"
                color="#7465E8"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                Loading feedback...
              </Text>

            </View>

          )
          : null
      }


      {
        !loading &&
        !error &&
        feedback.length ===
          0
          ? (

            <View
              style={
                styles.stateCard
              }
            >

              <View
                style={
                  styles.emptyIcon
                }
              >

                <ClipboardList
                  size={29}
                  color="#8375E9"
                />

              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No feedback yet
              </Text>

              <Text
                style={
                  styles.stateText
                }
              >
                Parent feedback will
                appear here after it
                is submitted.
              </Text>

            </View>

          )
          : null
      }


      {
        !loading &&
        feedback.map(
          item => (

            <View
              key={
                item.id
              }
              style={
                styles.feedbackCard
              }
            >

              <View
                style={
                  styles.feedbackHeader
                }
              >

                <View
                  style={
                    styles.avatar
                  }
                >

                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {
                      getInitials(
                        item.parent_name
                      )
                    }
                  </Text>

                </View>


                <View
                  style={
                    styles.parentInfo
                  }
                >

                  <Text
                    style={
                      styles.parentName
                    }
                  >
                    {
                      item.parent_name ||
                      "Parent"
                    }
                  </Text>

                  {
                    item.parent_email
                      ? (

                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.parentEmail
                          }
                        >
                          {
                            item.parent_email
                          }
                        </Text>

                      )
                      : null
                  }

                </View>


                <Text
                  style={
                    styles.dateText
                  }
                >
                  {
                    formatDate(
                      item.created_at
                    )
                  }
                </Text>

              </View>


              <View
                style={
                  styles.messageBox
                }
              >

                <Text
                  style={
                    styles.message
                  }
                >
                  {
                    item.message
                  }
                </Text>

              </View>

            </View>

          )
        )
      }

    </View>

  );

}


const styles =
  StyleSheet.create({

    page: {
      gap: 14,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    headerMain: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEEAFE",
    },

    headerText: {
      flex: 1,
    },

    title: {
      color:
        "#292B52",
      fontSize: 23,
      fontWeight:
        "800",
    },

    subtitle: {
      marginTop: 4,
      color:
        "#9193A8",
      fontSize: 11,
      lineHeight: 17,
    },

    refreshButton: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor:
        "#E5E1F7",
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    summaryCard: {
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
    },

    summaryLabel: {
      color:
        "#999BAE",
      fontSize: 11,
      fontWeight:
        "700",
    },

    summaryValue: {
      marginTop: 5,
      color:
        "#333554",
      fontSize: 27,
      fontWeight:
        "800",
    },

    feedbackCard: {
      padding: 16,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
    },

    feedbackHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    avatar: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EEEAFE",
    },

    avatarText: {
      color:
        "#6D5BC8",
      fontSize: 12,
      fontWeight:
        "800",
    },

    parentInfo: {
      flex: 1,
    },

    parentName: {
      color:
        "#333554",
      fontSize: 13,
      fontWeight:
        "800",
    },

    parentEmail: {
      marginTop: 2,
      color:
        "#9899AB",
      fontSize: 10,
    },

    dateText: {
      maxWidth: 85,
      color:
        "#A0A1B1",
      fontSize: 9,
      textAlign:
        "right",
    },

    messageBox: {
      marginTop: 14,
      padding: 13,
      borderRadius: 13,
      backgroundColor:
        "#F8F8FC",
    },

    message: {
      color:
        "#555771",
      fontSize: 12,
      lineHeight: 19,
    },

    errorBox: {
      padding: 14,
      borderRadius: 14,
      backgroundColor:
        "#FFF0F2",
    },

    errorTitle: {
      color:
        "#A7475D",
      fontSize: 12,
      fontWeight:
        "800",
    },

    errorText: {
      marginTop: 4,
      color:
        "#B56275",
      fontSize: 10,
      lineHeight: 16,
    },

    stateCard: {
      minHeight: 190,
      padding: 22,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      borderRadius: 19,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    stateText: {
      marginTop: 9,
      color:
        "#9798AA",
      fontSize: 11,
      lineHeight: 17,
      textAlign:
        "center",
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },

    emptyTitle: {
      marginTop: 12,
      color:
        "#41435E",
      fontSize: 14,
      fontWeight:
        "800",
    },

  });