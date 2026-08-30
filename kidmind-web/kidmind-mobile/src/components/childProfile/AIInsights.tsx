import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AlertCircle,
  Bot,
  Brain,
  Gamepad2,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";

import Card from "../ui/Card";


const games = [
  "Memory Match",
  "Attention Focus",
  "Reading Adventure",
  "Executive Puzzle",
];


const AIInsights = () => {

  return (

    <Card>

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

          <Bot
            size={18}
            color="#7566EB"
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
            AI Insights
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Smart analysis
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
          styles.scoreBox
        }
      >

        <View>

          <Text
            style={
              styles.label
            }
          >
            AI CONFIDENCE
          </Text>


          <Text
            style={
              styles.score
            }
          >
            96%
          </Text>

        </View>


        <View
          style={
            styles.sparkleBox
          }
        >

          <Sparkles
            size={18}
            color="#7566EB"
          />

        </View>

      </View>


      <InsightItem
        icon={

          <Brain
            size={16}
            color="#48A784"
          />

        }
        iconBackground="#ECFAF4"
        background="#F7FCF9"
        border="#E7F2EC"
        title="Recommendation"
        text="Increase memory difficulty by one level during the next assessment."
      />


      <InsightItem
        icon={

          <AlertCircle
            size={16}
            color="#D99949"
          />

        }
        iconBackground="#FFF3DA"
        background="#FFFBF3"
        border="#F4EAD5"
        title="Risk Level"
        text="Low Risk"
      />


      <InsightItem
        icon={

          <TrendingUp
            size={16}
            color="#5595DD"
          />

        }
        iconBackground="#EDF6FF"
        background="#F6FAFD"
        border="#DDEBF6"
        title="Progress"
        text="+14% improvement compared to last month."
      />


      <View
        style={
          styles.gamesBox
        }
      >

        <View
          style={
            styles.gamesHeader
          }
        >

          <View
            style={
              styles.gamesIcon
            }
          >

            <Gamepad2
              size={15}
              color="#D99949"
            />

          </View>


          <Text
            style={
              styles.itemTitle
            }
          >
            Suggested Games
          </Text>

        </View>


        <View
          style={
            styles.gamesList
          }
        >

          {games.map(
            (
              game
            ) => (

              <View
                key={
                  game
                }
                style={
                  styles.gameItem
                }
              >

                <View
                  style={
                    styles.gameDot
                  }
                />


                <Text
                  style={
                    styles.gameText
                  }
                >
                  {game}
                </Text>

              </View>

            )
          )}

        </View>

      </View>

    </Card>

  );

};


type InsightItemProps = {
  icon: React.ReactNode;
  iconBackground: string;
  background: string;
  border: string;
  title: string;
  text: string;
};


const InsightItem = ({
  icon,
  iconBackground,
  background,
  border,
  title,
  text,
}: InsightItemProps) => {

  return (

    <View
      style={[
        styles.insightItem,
        {
          backgroundColor:
            background,

          borderColor:
            border,
        },
      ]}
    >

      <View
        style={[
          styles.insightIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >

        {icon}

      </View>


      <View
        style={
          styles.insightContent
        }
      >

        <Text
          style={
            styles.itemTitle
          }
        >
          {title}
        </Text>


        <Text
          style={
            styles.text
          }
        >
          {text}
        </Text>

      </View>

    </View>

  );

};


const styles =
  StyleSheet.create({

    header: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

    },


    iconBox: {

      width:
        39,

      height:
        39,

      borderRadius:
        12,

      backgroundColor:
        "#F0EDFF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    headerCopy: {

      flex:
        1,

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
        9.5,

    },


    divider: {

      height:
        1,

      marginTop:
        14,

      backgroundColor:
        "#F0F0F5",

    },


    scoreBox: {

      marginTop:
        13,

      padding:
        14,

      borderRadius:
        15,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      backgroundColor:
        "#F8F5FF",

      borderWidth:
        1,

      borderColor:
        "#E8E3FF",

    },


    label: {

      color:
        "#9A95B7",

      fontSize:
        8,

      fontWeight:
        "800",

      letterSpacing:
        0.6,

    },


    score: {

      marginTop:
        3,

      color:
        "#7566EB",

      fontSize:
        26,

      lineHeight:
        32,

      fontWeight:
        "800",

    },


    sparkleBox: {

      width:
        42,

      height:
        42,

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#E8E3FF",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    insightItem: {

      marginTop:
        9,

      padding:
        12,

      borderRadius:
        14,

      borderWidth:
        1,

      flexDirection:
        "row",

      gap:
        9,

    },


    insightIcon: {

      width:
        35,

      height:
        35,

      flexShrink:
        0,

      borderRadius:
        11,

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    insightContent: {

      flex:
        1,

      minWidth:
        0,

    },


    itemTitle: {

      color:
        "#55586D",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    text: {

      marginTop:
        3,

      color:
        "#8E91A4",

      fontSize:
        9,

      lineHeight:
        14,

    },


    gamesBox: {

      marginTop:
        10,

      padding:
        13,

      borderRadius:
        14,

      backgroundColor:
        "#FFFBF4",

      borderWidth:
        1,

      borderColor:
        "#F2E7D5",

    },


    gamesHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,

    },


    gamesIcon: {

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
        "#FFF3DA",

    },


    gamesList: {

      marginTop:
        9,

      gap:
        5,

    },


    gameItem: {

      minHeight:
        31,

      paddingHorizontal:
        10,

      borderRadius:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#F1E8D9",

    },


    gameDot: {

      width:
        5,

      height:
        5,

      borderRadius:
        3,

      backgroundColor:
        "#D99949",

    },


    gameText: {

      color:
        "#6E7183",

      fontSize:
        9,

      fontWeight:
        "500",

    },

  });


export default AIInsights;