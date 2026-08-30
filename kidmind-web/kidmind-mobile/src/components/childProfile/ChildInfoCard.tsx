import React from "react";

import {
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
  User,
  Users,
} from "lucide-react-native";

import Card from "../ui/Card";

import type {
  Child,
} from "@/api/childrenApi";


type Props = {
  child: Child;
  onEdit: () => void;
};


const getChildInitial = (
  child: Child
) => {

  return String(
    child.full_name ||
    "C"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

};


const ChildInfoCard = ({
  child,
  onEdit,
}: Props) => {

  return (

    <Card>

      <View
        style={
          styles.profileHeader
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
            {getChildInitial(
              child
            )}
          </Text>

        </View>


        <View
          style={
            styles.profileText
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            CHILD PROFILE
          </Text>


          <Text
            style={
              styles.name
            }
            numberOfLines={
              1
            }
          >
            {child.full_name}
          </Text>


          <Text
            style={
              styles.id
            }
          >
            Child ID #{child.id}
          </Text>

        </View>

      </View>


      <View
        style={
          styles.divider
        }
      />


      <View
        style={
          styles.infoGrid
        }
      >

        <InfoBox
          icon={
            <Calendar
              size={15}
              color="#7B6EF6"
            />
          }
          title="Age"
          value={`${child.age} Years`}
        />


        <InfoBox
          icon={
            <User
              size={15}
              color="#5595DD"
            />
          }
          title="Gender"
          value={
            child.gender ||
            "—"
          }
        />


        <InfoBox
          icon={
            <Users
              size={15}
              color="#48A784"
            />
          }
          title="Parent"
          value={
            child.parent_name ||
            "Not provided"
          }
        />


        <InfoBox
          icon={
            <Activity
              size={15}
              color="#D99949"
            />
          }
          title="Status"
          value={
            child.status ||
            "Active"
          }
          valueColor="#3E9E7D"
        />

      </View>


      <View
        style={
          styles.notesBox
        }
      >

        <View
          style={
            styles.notesTitleRow
          }
        >

          <View
            style={
              styles.notesIcon
            }
          >

            <FileText
              size={15}
              color="#7566EB"
            />

          </View>


          <Text
            style={
              styles.notesTitle
            }
          >
            Notes
          </Text>

        </View>


        <Text
          style={
            styles.notesText
          }
        >
          {child.notes ||
            "No notes available."}
        </Text>

      </View>


      <View
        style={
          styles.buttons
        }
      >

        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.reportButton
          }
        >

          <FileText
            size={15}
            color="#7566EB"
          />


          <Text
            style={
              styles.reportButtonText
            }
          >
            Generate Report
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.editButton
          }
          onPress={
            onEdit
          }
        >

          <Pencil
            size={15}
            color="#777A8F"
          />


          <Text
            style={
              styles.editText
            }
          >
            Edit Information
          </Text>

        </TouchableOpacity>

      </View>

    </Card>

  );

};


type InfoBoxProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  valueColor?: string;
};


const InfoBox = ({
  icon,
  title,
  value,
  valueColor,
}: InfoBoxProps) => {

  return (

    <View
      style={
        styles.infoBox
      }
    >

      <View
        style={
          styles.infoLabelRow
        }
      >

        {icon}


        <Text
          style={
            styles.infoLabel
          }
        >
          {title}
        </Text>

      </View>


      <Text
        style={[
          styles.infoValue,

          valueColor
            ? {
                color:
                  valueColor,
              }
            : null,
        ]}
        numberOfLines={
          2
        }
      >
        {value}
      </Text>

    </View>

  );

};


const styles =
  StyleSheet.create({

    profileHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        13,

    },


    avatar: {

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
        "#F3EEFF",

      borderWidth:
        1,

      borderColor:
        "#E9E3FF",

    },


    avatarText: {

      color:
        "#7968E9",

      fontSize:
        19,

      fontWeight:
        "800",

    },


    profileText: {

      flex:
        1,

      minWidth:
        0,

    },


    eyebrow: {

      color:
        "#8172EA",

      fontSize:
        8,

      fontWeight:
        "800",

      letterSpacing:
        0.9,

    },


    name: {

      marginTop:
        4,

      color:
        "#343654",

      fontSize:
        17,

      lineHeight:
        22,

      fontWeight:
        "800",

    },


    id: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9.5,

    },


    divider: {

      height:
        1,

      marginTop:
        16,

      backgroundColor:
        "#F0F0F5",

    },


    infoGrid: {

      marginTop:
        14,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,

    },


    infoBox: {

      width:
        "48.5%",

      minHeight:
        70,

      padding:
        11,

      borderRadius:
        13,

      justifyContent:
        "space-between",

      backgroundColor:
        "#FAFAFC",

      borderWidth:
        1,

      borderColor:
        "#F0F0F5",

    },


    infoLabelRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

    },


    infoLabel: {

      color:
        "#A0A3B4",

      fontSize:
        8.5,

      fontWeight:
        "600",

    },


    infoValue: {

      marginTop:
        8,

      color:
        "#55586E",

      fontSize:
        10.5,

      lineHeight:
        14,

      fontWeight:
        "700",

    },


    notesBox: {

      marginTop:
        14,

      padding:
        13,

      borderRadius:
        14,

      backgroundColor:
        "#FCFCFE",

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

    },


    notesTitleRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,

    },


    notesIcon: {

      width:
        31,

      height:
        31,

      borderRadius:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },


    notesTitle: {

      color:
        "#55586D",

      fontSize:
        10.5,

      fontWeight:
        "700",

    },


    notesText: {

      marginTop:
        9,

      color:
        "#8E91A4",

      fontSize:
        9.5,

      lineHeight:
        15,

    },


    buttons: {

      marginTop:
        14,

      gap:
        8,

    },


    reportButton: {

      minHeight:
        43,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        7,

      borderRadius:
        12,

      backgroundColor:
        "#F7F4FF",

      borderWidth:
        1,

      borderColor:
        "#E4DFFF",

    },


    reportButtonText: {

      color:
        "#7566EB",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    editButton: {

      minHeight:
        43,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        7,

      borderRadius:
        12,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E7E7EF",

    },


    editText: {

      color:
        "#777A8F",

      fontSize:
        10,

      fontWeight:
        "700",

    },

  });


export default ChildInfoCard;