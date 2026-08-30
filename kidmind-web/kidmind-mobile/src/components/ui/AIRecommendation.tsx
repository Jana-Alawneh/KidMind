import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react-native";


export default function AIRecommendation() {

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
            styles.iconBox
          }
        >

          <Sparkles
            size={18}
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
              styles.title
            }
          >
            KidMind AI
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Smart Recommendation
          </Text>

        </View>

      </View>


      <View
        style={
          styles.content
        }
      >

        <View
          style={[
            styles.infoBox,
            styles.purpleBox,
          ]}
        >

          <Text
            style={
              styles.infoLabel
            }
          >
            Performance Insight
          </Text>


          <Text
            style={
              styles.infoText
            }
          >
            Lina&apos;s attention increased by

            <Text
              style={
                styles.purple
              }
            >
              {" "}12%
            </Text>
          </Text>

        </View>


        <View
          style={[
            styles.infoBox,
            styles.greenBox,
          ]}
        >

          <Text
            style={
              styles.infoLabel
            }
          >
            Suggested Next Game
          </Text>


          <Text
            style={
              styles.suggestion
            }
          >
            Visual Memory Level 3
          </Text>

        </View>


        <TouchableOpacity
          activeOpacity={
            0.8
          }
          style={
            styles.button
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >
            Generate Full AI Report
          </Text>


          <ArrowUpRight
            size={15}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>

    </View>

  );

}


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


    header: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      marginBottom:
        15,

    },


    iconBox: {

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


    headerCopy: {

      flex:
        1,

    },


    title: {

      color:
        "#333554",

      fontSize:
        15.5,

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


    content: {

      gap:
        10,

    },


    infoBox: {

      padding:
        13,

      borderRadius:
        14,

      borderWidth:
        1,

    },


    purpleBox: {

      backgroundColor:
        "#FAF8FF",

      borderColor:
        "#EEE9FF",

    },


    greenBox: {

      backgroundColor:
        "#F4FBF7",

      borderColor:
        "#E0F3E9",

    },


    infoLabel: {

      color:
        "#999CAD",

      fontSize:
        8.5,

      fontWeight:
        "700",

      textTransform:
        "uppercase",

      letterSpacing:
        0.5,

    },


    infoText: {

      marginTop:
        5,

      color:
        "#5D6076",

      fontSize:
        11,

      lineHeight:
        17,

    },


    purple: {

      color:
        "#7566EB",

      fontWeight:
        "800",

    },


    suggestion: {

      marginTop:
        5,

      color:
        "#3F735D",

      fontSize:
        11.5,

      fontWeight:
        "700",

    },


    button: {

      minHeight:
        42,

      marginTop:
        2,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        12,

      backgroundColor:
        "#7968ED",

    },


    buttonText: {

      color:
        "#FFFFFF",

      fontSize:
        10.5,

      fontWeight:
        "700",

    },

  });