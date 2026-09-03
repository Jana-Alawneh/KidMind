import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  UserPlus,
  UserRound,
  X,
} from "lucide-react-native";

import {
  useMemo,
  useState,
} from "react";

import {
  addChild,
} from "@/api/childrenApi";

import {
  getCurrentUser,
} from "@/api/authApi";

import type {
  ChildPayload,
} from "@/api/childrenApi";


type Props = {
  close: () => void;
  onSuccess:
    () => Promise<void> | void;
};


const AddChildModal = ({
  close,
  onSuccess,
}: Props) => {

  const currentUser =
    useMemo(
      () =>
        getCurrentUser(),
      []
    );


  const [
    fullName,
    setFullName,
  ] = useState("");


  const [
    age,
    setAge,
  ] = useState("");


  const [
    gender,
    setGender,
  ] = useState<
    "Female" | "Male"
  >("Female");


  const [
    parentName,
    setParentName,
  ] = useState("");


  const [
    region,
    setRegion,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  const handleSubmit =
    async () => {

      const numericAge =
        Number(age);


      if (
        !fullName.trim()
      ) {

        Alert.alert(
          "Missing Information",
          "Please enter the child name."
        );

        return;

      }


      if (
        !Number.isInteger(
          numericAge
        ) ||
        numericAge <= 0
      ) {

        Alert.alert(
          "Invalid Age",
          "Please enter a valid age."
        );

        return;

      }


      if (
        !region.trim()
      ) {

        Alert.alert(
          "Missing Information",
          "Please enter the region."
        );

        return;

      }


      const therapistId =
        currentUser?.role ===
          "therapist" &&
        currentUser?.id
          ? Number(
              currentUser.id
            )
          : null;


      const childData:
        ChildPayload = {

        full_name:
          fullName.trim(),

        age:
          numericAge,

        gender,

        parent_name:
          parentName.trim(),

        region:
          region.trim(),

        notes:
          notes.trim(),

        therapist_id:
          therapistId,

      };


      try {

        setSaving(
          true
        );


        await addChild(
          childData
        );


        await onSuccess();


        close();


        Alert.alert(
          "Success",
          "Child added successfully"
        );

      } catch (error) {

        console.error(
          "Failed to add child:",
          error
        );


        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to add child"
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  return (

    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        close
      }
    >

      <View
        style={
          styles.overlay
        }
      >

        <View
          style={
            styles.container
          }
        >

          <View
            style={
              styles.header
            }
          >

            <View
              style={
                styles.titleSection
              }
            >

              <View
                style={
                  styles.iconBox
                }
              >

                <UserPlus
                  size={22}
                  color="#7465E8"
                />

              </View>


              <View
                style={
                  styles.headerCopy
                }
              >

                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  ADD CHILD
                </Text>

                <Text
                  style={
                    styles.title
                  }
                >
                  New Child
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Create a new child profile
                </Text>

              </View>

            </View>


            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={
                close
              }
              disabled={
                saving
              }
            >

              <X
                size={20}
                color="#85889B"
              />

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.divider
            }
          />


          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >

            <View
              style={
                styles.field
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Full Name
              </Text>


              <TextInput
                value={
                  fullName
                }
                onChangeText={
                  setFullName
                }
                placeholder="Child full name"
                placeholderTextColor="#A4A6B4"
                style={
                  styles.input
                }
                editable={
                  !saving
                }
              />

            </View>


            <View
              style={
                styles.row
              }
            >

              <View
                style={
                  styles.half
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Age
                </Text>


                <TextInput
                  value={
                    age
                  }
                  onChangeText={
                    setAge
                  }
                  placeholder="Age"
                  placeholderTextColor="#A4A6B4"
                  keyboardType="number-pad"
                  style={
                    styles.input
                  }
                  editable={
                    !saving
                  }
                />

              </View>


              <View
                style={
                  styles.half
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Gender
                </Text>


                <View
                  style={
                    styles.genderRow
                  }
                >

                  <TouchableOpacity
                    disabled={
                      saving
                    }
                    onPress={() =>
                      setGender(
                        "Female"
                      )
                    }
                    style={[
                      styles.genderButton,

                      gender ===
                        "Female" &&
                        styles.genderActive,
                    ]}
                  >

                    <Text
                      style={[
                        styles.genderText,

                        gender ===
                          "Female" &&
                          styles.genderTextActive,
                      ]}
                    >
                      Female
                    </Text>

                  </TouchableOpacity>


                  <TouchableOpacity
                    disabled={
                      saving
                    }
                    onPress={() =>
                      setGender(
                        "Male"
                      )
                    }
                    style={[
                      styles.genderButton,

                      gender ===
                        "Male" &&
                        styles.genderActive,
                    ]}
                  >

                    <Text
                      style={[
                        styles.genderText,

                        gender ===
                          "Male" &&
                          styles.genderTextActive,
                      ]}
                    >
                      Male
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            </View>


            <View
              style={
                styles.row
              }
            >

              <View
                style={
                  styles.half
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Parent Name
                </Text>


                <TextInput
                  value={
                    parentName
                  }
                  onChangeText={
                    setParentName
                  }
                  placeholder="Parent name"
                  placeholderTextColor="#A4A6B4"
                  style={
                    styles.input
                  }
                  editable={
                    !saving
                  }
                />

              </View>


              <View
                style={
                  styles.half
                }
              >

                <Text
                  style={
                    styles.label
                  }
                >
                  Region
                </Text>


                <TextInput
                  value={
                    region
                  }
                  onChangeText={
                    setRegion
                  }
                  placeholder="Region"
                  placeholderTextColor="#A4A6B4"
                  style={
                    styles.input
                  }
                  editable={
                    !saving
                  }
                />

              </View>

            </View>


            <View
              style={
                styles.field
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Notes
              </Text>


              <TextInput
                value={
                  notes
                }
                onChangeText={
                  setNotes
                }
                placeholder="Therapist notes"
                placeholderTextColor="#A4A6B4"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={
                  styles.textArea
                }
                editable={
                  !saving
                }
              />

            </View>


            {
              currentUser?.role ===
                "therapist" && (

                <View
                  style={
                    styles.assignmentBox
                  }
                >

                  <View
                    style={
                      styles.assignmentIcon
                    }
                  >

                    <UserRound
                      size={18}
                      color="#7465E8"
                    />

                  </View>


                  <View
                    style={
                      styles.assignmentCopy
                    }
                  >

                    <Text
                      style={
                        styles.assignmentLabel
                      }
                    >
                      THERAPIST ASSIGNMENT
                    </Text>

                    <Text
                      style={
                        styles.assignmentName
                      }
                    >
                      {
                        currentUser.full_name ||
                        "Current Therapist"
                      }
                    </Text>

                    <Text
                      style={
                        styles.assignmentHint
                      }
                    >
                      This child will automatically be linked to your account.
                    </Text>

                  </View>

                </View>

              )
            }


            <View
              style={
                styles.buttons
              }
            >

              <TouchableOpacity
                style={
                  styles.cancel
                }
                onPress={
                  close
                }
                disabled={
                  saving
                }
              >

                <Text
                  style={
                    styles.cancelText
                  }
                >
                  Cancel
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.save,

                  saving &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleSubmit
                }
                disabled={
                  saving
                }
              >

                {
                  saving && (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  )
                }

                <Text
                  style={
                    styles.saveText
                  }
                >
                  {
                    saving
                      ? "Saving..."
                      : "Add Child"
                  }
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </View>

      </View>

    </Modal>

  );

};


const styles =
  StyleSheet.create({

    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(37,35,64,0.42)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        18,
    },

    container: {
      width: "100%",
      maxWidth: 650,
      maxHeight: "88%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 20,
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

    titleSection: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    headerCopy: {
      flex: 1,
    },

    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#F0EDFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    eyebrow: {
      color:
        "#7465E8",
      fontSize: 9,
      fontWeight:
        "800",
      letterSpacing: 1,
    },

    title: {
      marginTop: 2,
      fontSize: 21,
      fontWeight:
        "800",
      color:
        "#353754",
    },

    subtitle: {
      marginTop: 2,
      color:
        "#9A9CAE",
      fontSize: 10,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#F5F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#EFEFF5",
      marginTop: 17,
    },

    scrollContent: {
      paddingTop: 18,
      paddingBottom: 4,
    },

    field: {
      marginBottom: 14,
    },

    row: {
      flexDirection:
        "row",
      gap: 11,
      marginBottom: 14,
    },

    half: {
      flex: 1,
    },

    label: {
      marginBottom: 7,
      color:
        "#65687D",
      fontSize: 11,
      fontWeight:
        "700",
    },

    input: {
      height: 46,
      borderWidth: 1,
      borderColor:
        "#E2E2EB",
      borderRadius: 12,
      paddingHorizontal: 13,
      backgroundColor:
        "#FBFBFD",
      color:
        "#45475F",
      fontSize: 12,
    },

    textArea: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        "#E2E2EB",
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 12,
      backgroundColor:
        "#FBFBFD",
      color:
        "#45475F",
      fontSize: 12,
    },

    genderRow: {
      height: 46,
      flexDirection:
        "row",
      gap: 6,
    },

    genderButton: {
      flex: 1,
      borderWidth: 1,
      borderColor:
        "#E2E2EB",
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FBFBFD",
    },

    genderActive: {
      borderColor:
        "#A89DF2",
      backgroundColor:
        "#F0EDFF",
    },

    genderText: {
      color:
        "#77798D",
      fontSize: 11,
      fontWeight:
        "600",
    },

    genderTextActive: {
      color:
        "#6F5EDF",
      fontWeight:
        "800",
    },

    assignmentBox: {
      flexDirection:
        "row",
      gap: 11,
      marginBottom: 17,
      padding: 13,
      borderWidth: 1,
      borderColor:
        "#E6E1FF",
      borderRadius: 14,
      backgroundColor:
        "#F8F6FF",
    },

    assignmentIcon: {
      width: 37,
      height: 37,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    assignmentCopy: {
      flex: 1,
    },

    assignmentLabel: {
      fontSize: 8,
      letterSpacing: 0.7,
      fontWeight:
        "800",
      color:
        "#8477E5",
    },

    assignmentName: {
      marginTop: 3,
      color:
        "#52546B",
      fontSize: 11,
      fontWeight:
        "800",
    },

    assignmentHint: {
      marginTop: 3,
      color:
        "#9597AA",
      fontSize: 9,
      lineHeight: 14,
    },

    buttons: {
      flexDirection:
        "row",
      gap: 10,
      marginTop: 5,
    },

    cancel: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor:
        "#E3E3EC",
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    cancelText: {
      color:
        "#737589",
      fontWeight:
        "700",
      fontSize: 12,
    },

    save: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      flexDirection:
        "row",
      gap: 7,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7465E8",
    },

    saveText: {
      color:
        "#FFFFFF",
      fontWeight:
        "800",
      fontSize: 12,
    },

    disabledButton: {
      opacity: 0.55,
    },

  });


export default AddChildModal;