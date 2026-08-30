import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import type {
  Child,
} from "@/api/childrenApi";


type Props = {
  children: Child[];

  onEdit: (
    child: Child
  ) => void;

  onDelete: (
    child: Child
  ) => void;
};


const getScore = (
  score: Child["score"]
) => {

  if (
    score === null ||
    score === undefined ||
    score === ""
  ) {
    return "—";
  }


  const value =
    String(
      score
    );


  return value.includes(
    "%"
  )
    ? value
    : `${value}%`;

};


const getInitial = (
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


const ChildrenTable = ({
  children,
  onEdit,
  onDelete,
}: Props) => {

  return (

    <View
      style={
        styles.panel
      }
    >

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.headerCopy
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Children List
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            All registered children
          </Text>

        </View>


        <View
          style={
            styles.countBox
          }
        >

          <Text
            style={
              styles.countText
            }
          >
            {children.length}

            {" "}

            {children.length === 1
              ? "Child"
              : "Children"}
          </Text>

        </View>

      </View>


      {children.length === 0 ? (

        <View
          style={
            styles.emptyBox
          }
        >

          <View
            style={
              styles.emptyAvatar
            }
          >

            <Text
              style={
                styles.emptyAvatarText
              }
            >
              C
            </Text>

          </View>


          <Text
            style={
              styles.emptyTitle
            }
          >
            No children found
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
            Try another search or add a child.
          </Text>

        </View>

      ) : (

        <View
          style={
            styles.list
          }
        >

          {children.map(
            (
              child
            ) => (

              <View
                key={
                  child.id
                }
                style={
                  styles.childCard
                }
              >

                <View
                  style={
                    styles.childHeader
                  }
                >

                  <View
                    style={
                      styles.childInfo
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
                        {getInitial(
                          child
                        )}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.nameSection
                      }
                    >

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
                          styles.meta
                        }
                        numberOfLines={
                          1
                        }
                      >
                        ID #{child.id}

                        {child.gender
                          ? `  •  ${child.gender}`
                          : ""}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.scoreBox
                    }
                  >

                    <Text
                      style={
                        styles.score
                      }
                    >
                      {getScore(
                        child.score
                      )}
                    </Text>

                    <Text
                      style={
                        styles.scoreLabel
                      }
                    >
                      Cognitive
                    </Text>

                  </View>

                </View>


                <View
                  style={
                    styles.details
                  }
                >

                  <View
                    style={
                      styles.detailItem
                    }
                  >

                    <Text
                      style={
                        styles.label
                      }
                    >
                      Age
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {child.age} Years
                    </Text>

                  </View>


                  <View
                    style={[
                      styles.detailItem,
                      styles.assessmentItem,
                    ]}
                  >

                    <Text
                      style={
                        styles.label
                      }
                    >
                      Last Assessment
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {child.last_assessment ||
                        "Not assessed"}
                    </Text>

                  </View>

                </View>


                <View
                  style={
                    styles.bottomRow
                  }
                >

                  <View
                    style={
                      styles.statusBox
                    }
                  >

                    <Text
                      style={
                        styles.status
                      }
                    >
                      {child.status ||
                        "Active"}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.actions
                    }
                  >

                    <TouchableOpacity
                      activeOpacity={
                        0.75
                      }
                      accessibilityLabel={`View ${child.full_name}`}
                      style={[
                        styles.actionButton,
                        styles.viewButton,
                      ]}
                      onPress={() => {

                        router.push({
                          pathname:
                            "/children/[id]",

                          params: {
                            id:
                              child.id.toString(),
                          },
                        });

                      }}
                    >

                      <Eye
                        size={16}
                        color="#7565E6"
                      />

                    </TouchableOpacity>


                    <TouchableOpacity
                      activeOpacity={
                        0.75
                      }
                      accessibilityLabel={`Edit ${child.full_name}`}
                      style={[
                        styles.actionButton,
                        styles.editButton,
                      ]}
                      onPress={() => {

                        onEdit(
                          child
                        );

                      }}
                    >

                      <Pencil
                        size={15}
                        color="#4D87B5"
                      />

                    </TouchableOpacity>


                    <TouchableOpacity
                      activeOpacity={
                        0.75
                      }
                      accessibilityLabel={`Delete ${child.full_name}`}
                      style={[
                        styles.actionButton,
                        styles.deleteButton,
                      ]}
                      onPress={() => {

                        onDelete(
                          child
                        );

                      }}
                    >

                      <Trash2
                        size={15}
                        color="#C95166"
                      />

                    </TouchableOpacity>

                  </View>

                </View>

              </View>

            )
          )}

        </View>

      )}

    </View>

  );

};


const styles =
  StyleSheet.create({

    panel: {

      padding:
        17,

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


    header: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,

      paddingBottom:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F1F1F6",

    },


    headerCopy: {

      flex:
        1,

      minWidth:
        0,

    },


    title: {

      color:
        "#333554",

      fontSize:
        15,

      fontWeight:
        "700",

    },


    subtitle: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        10.5,

    },


    countBox: {

      minHeight:
        31,

      paddingHorizontal:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        10,

      backgroundColor:
        "#F3F0FF",

    },


    countText: {

      color:
        "#7566EB",

      fontSize:
        9.5,

      fontWeight:
        "700",

    },


    list: {

      marginTop:
        13,

      gap:
        11,

    },


    childCard: {

      padding:
        13,

      borderRadius:
        16,

      backgroundColor:
        "#FCFCFE",

      borderWidth:
        1,

      borderColor:
        "#EFEFF5",

    },


    childHeader: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        10,

    },


    childInfo: {

      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    avatar: {

      width:
        42,

      height:
        42,

      flexShrink:
        0,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3EEFF",

    },


    avatarText: {

      color:
        "#7968E9",

      fontSize:
        14,

      fontWeight:
        "800",

    },


    nameSection: {

      flex:
        1,

      minWidth:
        0,

    },


    name: {

      color:
        "#373953",

      fontSize:
        12,

      fontWeight:
        "700",

    },


    meta: {

      marginTop:
        3,

      color:
        "#A0A3B4",

      fontSize:
        9,

    },


    scoreBox: {

      minWidth:
        52,

      paddingHorizontal:
        8,

      paddingVertical:
        7,

      flexShrink:
        0,

      borderRadius:
        11,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3F0FF",

    },


    score: {

      color:
        "#7566EB",

      fontSize:
        11,

      fontWeight:
        "800",

    },


    scoreLabel: {

      marginTop:
        1,

      color:
        "#A5A1B8",

      fontSize:
        7,

    },


    details: {

      marginTop:
        12,

      flexDirection:
        "row",

      gap:
        8,

    },


    detailItem: {

      minHeight:
        52,

      flex:
        0.7,

      padding:
        10,

      borderRadius:
        11,

      justifyContent:
        "center",

      backgroundColor:
        "#F9F9FC",

    },


    assessmentItem: {

      flex:
        1.3,

    },


    label: {

      color:
        "#A1A4B4",

      fontSize:
        8,

      fontWeight:
        "600",

    },


    detailValue: {

      marginTop:
        4,

      color:
        "#5A5C72",

      fontSize:
        9.5,

      fontWeight:
        "600",

    },


    bottomRow: {

      marginTop:
        12,

      paddingTop:
        11,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        10,

      borderTopWidth:
        1,

      borderTopColor:
        "#F1F1F6",

    },


    statusBox: {

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        999,

      backgroundColor:
        "#ECFAF4",

    },


    status: {

      color:
        "#3E9E7D",

      fontSize:
        8.5,

      fontWeight:
        "700",

    },


    actions: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

    },


    actionButton: {

      width:
        38,

      height:
        38,

      borderRadius:
        11,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

    },


    viewButton: {

      backgroundColor:
        "#F7F4FF",

      borderColor:
        "#E5E0FF",

    },


    editButton: {

      backgroundColor:
        "#F2F8FD",

      borderColor:
        "#DCEBF7",

    },


    deleteButton: {

      backgroundColor:
        "#FFF4F6",

      borderColor:
        "#F6DDE2",

    },


    emptyBox: {

      minHeight:
        220,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    emptyAvatar: {

      width:
        47,

      height:
        47,

      borderRadius:
        15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F3EEFF",

    },


    emptyAvatarText: {

      color:
        "#7968E9",

      fontSize:
        15,

      fontWeight:
        "800",

    },


    emptyTitle: {

      marginTop:
        11,

      color:
        "#55586C",

      fontSize:
        12.5,

      fontWeight:
        "700",

    },


    emptyText: {

      marginTop:
        4,

      color:
        "#A0A3B4",

      fontSize:
        10,

      textAlign:
        "center",

    },

  });


export default ChildrenTable;