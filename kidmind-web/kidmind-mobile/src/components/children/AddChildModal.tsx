import {
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
  X,
} from "lucide-react-native";

import { useState } from "react";

import { addChild } from "@/api/childrenApi";

import type {
  ChildPayload,
} from "@/api/childrenApi";


type Props = {
  close: () => void;
  onSuccess: () => Promise<void> | void;
};


const AddChildModal = ({
  close,
  onSuccess,
}: Props) => {

  const [fullName, setFullName] =
    useState("");

  const [age, setAge] =
    useState("");

  const [gender, setGender] =
    useState<"Female" | "Male">(
      "Female"
    );

  const [parentName, setParentName] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  const handleSubmit = async () => {

    const numericAge = Number(age);

    if (!fullName.trim()) {

      Alert.alert(
        "Missing Information",
        "Please enter the child name."
      );

      return;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge <= 0
    ) {

      Alert.alert(
        "Invalid Age",
        "Please enter a valid age."
      );

      return;
    }

    if (!parentName.trim()) {

      Alert.alert(
        "Missing Information",
        "Please enter the parent name."
      );

      return;
    }


    const childData: ChildPayload = {

      full_name: fullName.trim(),

      age: numericAge,

      gender,

      parent_name: parentName.trim(),

      notes: notes.trim(),

    };


    try {

      setSaving(true);

      console.log("MOBILE ADD START:", childData);

const result = await addChild(childData);

console.log("MOBILE ADD RESULT:", result);

Alert.alert(
  "Success",
  "Child added successfully"
);

await onSuccess();

close();

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

      setSaving(false);

    }

  };


  return (

    <Modal
      transparent
      animationType="fade"
      onRequestClose={close}
    >

      <View style={styles.overlay}>

        <View style={styles.container}>

          <View style={styles.header}>

            <View style={styles.titleSection}>

              <View style={styles.iconBox}>

                <UserPlus
                  size={24}
                  color="#7B6EF6"
                />

              </View>

              <View>

                <Text style={styles.title}>
                  Add Child
                </Text>

                <Text style={styles.subtitle}>
                  Create new child profile
                </Text>

              </View>

            </View>


            <TouchableOpacity
              onPress={close}
              disabled={saving}
            >

              <X
                size={24}
                color="#94A3B8"
              />

            </TouchableOpacity>

          </View>


          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >

            <View style={styles.field}>

              <Text style={styles.label}>
                Child Name
              </Text>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter name"
                style={styles.input}
              />

            </View>


            <View style={styles.row}>

              <View style={styles.half}>

                <Text style={styles.label}>
                  Age
                </Text>

                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="Age"
                  keyboardType="numeric"
                  style={styles.input}
                />

              </View>


              <View style={styles.half}>

                <Text style={styles.label}>
                  Gender
                </Text>

                <View style={styles.genderRow}>

                  <TouchableOpacity
                    onPress={() => {
                      setGender("Female");
                    }}
                    style={[
                      styles.genderButton,
                      gender === "Female" &&
                        styles.genderButtonActive,
                    ]}
                  >

                    <Text
                      style={[
                        styles.genderText,
                        gender === "Female" &&
                          styles.genderTextActive,
                      ]}
                    >
                      Female
                    </Text>

                  </TouchableOpacity>


                  <TouchableOpacity
                    onPress={() => {
                      setGender("Male");
                    }}
                    style={[
                      styles.genderButton,
                      gender === "Male" &&
                        styles.genderButtonActive,
                    ]}
                  >

                    <Text
                      style={[
                        styles.genderText,
                        gender === "Male" &&
                          styles.genderTextActive,
                      ]}
                    >
                      Male
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            </View>


            <View style={styles.field}>

              <Text style={styles.label}>
                Parent Name
              </Text>

              <TextInput
                value={parentName}
                onChangeText={setParentName}
                placeholder="Parent name"
                style={styles.input}
              />

            </View>


            <View style={styles.field}>

              <Text style={styles.label}>
                Notes
              </Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes"
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />

            </View>


            <View style={styles.buttons}>

              <TouchableOpacity
                style={styles.cancel}
                onPress={close}
                disabled={saving}
              >

                <Text>
                  Cancel
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.save,
                  saving &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={saving}
              >

                <Text style={styles.saveText}>

                  {saving
                    ? "Saving..."
                    : "Save Child"
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


const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEE9FF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 3,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  half: {
    flex: 1,
  },

  genderRow: {
    height: 48,
    flexDirection: "row",
    gap: 6,
  },

  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  genderButtonActive: {
    backgroundColor: "#EEE9FF",
    borderColor: "#7B6EF6",
  },

  genderText: {
    fontSize: 12,
    color: "#64748B",
  },

  genderTextActive: {
    color: "#7B6EF6",
    fontWeight: "700",
  },

  textArea: {
    height: 90,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 15,
    textAlignVertical: "top",
  },

  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  cancel: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  save: {
    flex: 1,
    height: 48,
    backgroundColor: "#7B6EF6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

});


export default AddChildModal;