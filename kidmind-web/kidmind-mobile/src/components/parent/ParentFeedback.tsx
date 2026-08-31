import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  ClipboardList,
  Send,
} from "lucide-react-native";

import {
  sendParentFeedback,
} from "@/api/feedbackApi";


const MAX_LENGTH =
  2000;


export default function ParentFeedback() {

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");


  const submitFeedback =
    async () => {

      const cleanMessage =
        message.trim();

      if (
        !cleanMessage
      ) {

        setError(
          "Please write your feedback before sending."
        );

        setSuccess(
          ""
        );

        return;

      }


      if (
        cleanMessage.length >
        MAX_LENGTH
      ) {

        setError(
          "Feedback cannot exceed 2000 characters."
        );

        setSuccess(
          ""
        );

        return;

      }


      try {

        setSending(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );


        await sendParentFeedback(
          cleanMessage
        );


        setMessage(
          ""
        );

        setSuccess(
          "Thank you. Your feedback was sent successfully."
        );

      } catch (
        requestError
      ) {

        console.error(
          "Failed to send parent feedback:",
          requestError
        );


        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to send feedback."
        );

      } finally {

        setSending(
          false
        );

      }

    };


  return (

    <View
      style={
        styles.page
      }
    >

      <View
        style={
          styles.headingRow
        }
      >

        <View
          style={
            styles.headingIcon
          }
        >

          <ClipboardList
            size={24}
            color="#7465E8"
          />

        </View>


        <View
          style={
            styles.headingText
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Feedback
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Share your experience,
            suggestions or concerns
            with the KidMind team.
          </Text>

        </View>

      </View>


      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Send Feedback
        </Text>

        <Text
          style={
            styles.cardDescription
          }
        >
          Your feedback will be
          reviewed by the KidMind
          administration team.
        </Text>


        <TextInput
          value={
            message
          }
          onChangeText={
            value => {

              if (
                value.length <=
                MAX_LENGTH
              ) {

                setMessage(
                  value
                );

              }

              if (
                error
              ) {

                setError(
                  ""
                );

              }

              if (
                success
              ) {

                setSuccess(
                  ""
                );

              }

            }
          }
          editable={
            !sending
          }
          multiline
          maxLength={
            MAX_LENGTH
          }
          textAlignVertical="top"
          placeholder="Write your feedback here..."
          placeholderTextColor="#A3A5B7"
          style={
            styles.input
          }
        />


        <View
          style={
            styles.inputFooter
          }
        >

          <Text
            style={
              styles.helperText
            }
          >
            Be as detailed as you need.
          </Text>

          <Text
            style={
              styles.counter
            }
          >
            {
              message.length
            }
            /{
              MAX_LENGTH
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
          success
            ? (

              <View
                style={
                  styles.successBox
                }
              >

                <CheckCircle2
                  size={18}
                  color="#3E9272"
                />

                <Text
                  style={
                    styles.successText
                  }
                >
                  {
                    success
                  }
                </Text>

              </View>

            )
            : null
        }


        <Pressable
          disabled={
            sending ||
            !message.trim()
          }
          onPress={
            submitFeedback
          }
          style={[
            styles.sendButton,

            (
              sending ||
              !message.trim()
            ) &&
              styles.sendButtonDisabled,
          ]}
        >

          {
            sending
              ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              )
              : (

                <Send
                  size={18}
                  color="#FFFFFF"
                />

              )
          }


          <Text
            style={
              styles.sendButtonText
            }
          >
            {
              sending
                ? "Sending..."
                : "Send Feedback"
            }
          </Text>

        </Pressable>

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    page: {
      gap: 16,
    },

    headingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 13,
    },

    headingIcon: {
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

    headingText: {
      flex: 1,
    },

    title: {
      color:
        "#292B52",
      fontSize: 24,
      fontWeight:
        "800",
    },

    subtitle: {
      marginTop: 4,
      color:
        "#9193A8",
      fontSize: 12,
      lineHeight: 18,
    },

    card: {
      padding: 18,
      borderWidth: 1,
      borderColor:
        "#ECECF4",
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
    },

    cardTitle: {
      color:
        "#333554",
      fontSize: 17,
      fontWeight:
        "800",
    },

    cardDescription: {
      marginTop: 6,
      color:
        "#9697AA",
      fontSize: 12,
      lineHeight: 18,
    },

    input: {
      minHeight: 170,
      marginTop: 18,
      paddingHorizontal: 15,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor:
        "#E6E5F0",
      borderRadius: 16,
      backgroundColor:
        "#FAFAFD",
      color:
        "#333554",
      fontSize: 14,
      lineHeight: 21,
    },

    inputFooter: {
      marginTop: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 10,
    },

    helperText: {
      flex: 1,
      color:
        "#A0A1B3",
      fontSize: 10,
    },

    counter: {
      color:
        "#8D8EA5",
      fontSize: 10,
      fontWeight:
        "700",
    },

    errorBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      backgroundColor:
        "#FFF0F2",
    },

    errorText: {
      color:
        "#B34F66",
      fontSize: 11,
      lineHeight: 17,
    },

    successBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
      backgroundColor:
        "#EAF8F2",
    },

    successText: {
      flex: 1,
      color:
        "#397E65",
      fontSize: 11,
      lineHeight: 17,
      fontWeight:
        "600",
    },

    sendButton: {
      minHeight: 48,
      marginTop: 18,
      paddingHorizontal: 18,
      borderRadius: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 9,
      backgroundColor:
        "#7465E8",
    },

    sendButtonDisabled: {
      opacity: 0.55,
    },

    sendButtonText: {
      color:
        "#FFFFFF",
      fontSize: 13,
      fontWeight:
        "800",
    },

  });