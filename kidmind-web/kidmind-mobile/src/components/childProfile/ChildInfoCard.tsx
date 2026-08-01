import React from "react";

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Activity,
  Calendar,
  FileText,
  Pencil,
  Play,
  User,
  Users,
} from "lucide-react-native";

import Card from "../ui/Card";

import type {
  Child,
} from "@/api/childrenApi";


type Props = {
  child: Child;
};


const ChildInfoCard = ({
  child,
}: Props) => {

  const childImage =
    child.image ||
    `https://i.pravatar.cc/200?u=kidmind-${child.id}`;


  return (

    <Card>

      {/* Profile */}

      <View style={styles.profile}>

        <Image
          source={{
            uri: childImage,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {child.full_name}
        </Text>

        <Text style={styles.id}>
          Child ID #{child.id}
        </Text>

      </View>


      {/* Information */}

      <View style={styles.infoContainer}>

        <InfoRow
          icon={
            <Calendar
              size={18}
              color="#7B6EF6"
            />
          }
          title="Age"
          value={`${child.age} Years`}
        />


        <InfoRow
          icon={
            <User
              size={18}
              color="#63B3ED"
            />
          }
          title="Gender"
          value={child.gender}
        />


        <InfoRow
          icon={
            <Users
              size={18}
              color="#48BB78"
            />
          }
          title="Parent"
          value={
            child.parent_name ||
            "Not provided"
          }
        />


        <InfoRow
          icon={
            <Activity
              size={18}
              color="#F6AD55"
            />
          }
          title="Status"
          value={
            child.status ||
            "Active"
          }
        />

      </View>


      {/* Notes */}

      <View style={styles.notesBox}>

        <View style={styles.notesTitleRow}>

          <FileText
            size={18}
            color="#7B6EF6"
          />

          <Text style={styles.notesTitle}>
            Notes
          </Text>

        </View>

        <Text style={styles.notesText}>
          {child.notes ||
            "No notes available."}
        </Text>

      </View>


      {/* Buttons */}

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.primaryButton}
        >

          <Play
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.primaryText}>
            Start Session
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.secondaryButton}
        >

          <FileText
            size={18}
            color="#7B6EF6"
          />

          <Text style={styles.secondaryText}>
            Generate Report
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.editButton}
        >

          <Pencil
            size={18}
            color="#000000"
          />

          <Text style={styles.editText}>
            Edit Information
          </Text>

        </TouchableOpacity>

      </View>

    </Card>

  );

};


type InfoRowProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};


const InfoRow = ({
  icon,
  title,
  value,
}: InfoRowProps) => {

  return (

    <View style={styles.row}>

      <View style={styles.left}>

        {icon}

        <Text style={styles.rowTitle}>
          {title}
        </Text>

      </View>

      <Text style={styles.value}>
        {value}
      </Text>

    </View>

  );

};


const styles = StyleSheet.create({

  profile: {
    alignItems: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#EEE9FF",
  },

  name: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },

  id: {
    color: "#64748B",
    marginTop: 4,
  },

  infoContainer: {
    marginTop: 32,
    gap: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  rowTitle: {
    color: "#334155",
  },

  value: {
    flex: 1,
    fontWeight: "600",
    textAlign: "right",
  },

  notesBox: {
    marginTop: 28,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
  },

  notesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  notesTitle: {
    fontWeight: "700",
    color: "#334155",
  },

  notesText: {
    marginTop: 10,
    color: "#64748B",
    lineHeight: 21,
  },

  buttons: {
    marginTop: 40,
    gap: 12,
  },

  primaryButton: {
    backgroundColor: "#7B6EF6",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#F3F0FF",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  secondaryText: {
    color: "#7B6EF6",
    fontWeight: "600",
  },

  editButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  editText: {
    fontWeight: "600",
  },

});


export default ChildInfoCard;