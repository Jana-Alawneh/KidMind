
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



      {/* Header */}


      <View style={styles.header}>


        <View style={styles.iconBox}>


          <Bot
            size={24}
            color="#7B6EF6"
          />


        </View>



        <View>


          <Text style={styles.title}>
            AI Insights
          </Text>


          <Text style={styles.subtitle}>
            Smart analysis
          </Text>


        </View>


      </View>






      {/* AI Score */}



      <View style={styles.scoreBox}>


        <Text style={styles.label}>
          AI Confidence
        </Text>



        <Text style={styles.score}>
          96%
        </Text>


      </View>






      {/* Recommendation */}



      <View style={styles.row}>


        <Brain
          size={24}
          color="#48BB78"
        />



        <View style={styles.content}>


          <Text style={styles.itemTitle}>
            Recommendation
          </Text>


          <Text style={styles.text}>
            Increase memory difficulty by one level during the next assessment.
          </Text>


        </View>


      </View>







      {/* Risk */}



      <View style={styles.row}>


        <AlertCircle
          size={24}
          color="#F6AD55"
        />



        <View style={styles.content}>


          <Text style={styles.itemTitle}>
            Risk Level
          </Text>


          <Text style={styles.text}>
            Low Risk
          </Text>


        </View>


      </View>








      {/* Progress */}



      <View style={styles.row}>


        <TrendingUp
          size={24}
          color="#63B3ED"
        />



        <View style={styles.content}>


          <Text style={styles.itemTitle}>
            Progress
          </Text>


          <Text style={styles.text}>
            +14% improvement compared to last month.
          </Text>


        </View>


      </View>








      {/* Suggested Games */}



      <View style={styles.gamesBox}>


        <View style={styles.gamesHeader}>


          <Gamepad2
            size={24}
            color="#F6AD55"
          />


          <Text style={styles.itemTitle}>
            Suggested Games
          </Text>


        </View>




        {
          games.map((game)=>(
            
            <Text
              key={game}
              style={styles.gameItem}
            >
              • {game}
            </Text>

          ))
        }



      </View>




    </Card>

  );

};






const styles = StyleSheet.create({



header:{

  flexDirection:"row",

  alignItems:"center",

  gap:12,

  marginBottom:32,

},




iconBox:{

  width:48,

  height:48,

  borderRadius:16,

  backgroundColor:"#EEE9FF",

  justifyContent:"center",

  alignItems:"center",

},




title:{

  fontSize:20,

  fontWeight:"700",

},



subtitle:{

  color:"#64748B",

  fontSize:14,

},




scoreBox:{

  backgroundColor:"#F6F3FF",

  borderRadius:16,

  padding:20,

  marginBottom:20,

},



label:{

  color:"#64748B",

  fontSize:14,

},



score:{

  fontSize:40,

  fontWeight:"700",

  color:"#7B6EF6",

  marginTop:8,

},




row:{

  flexDirection:"row",

  gap:12,

  marginBottom:20,

},



content:{

  flex:1,

},



itemTitle:{

  fontSize:16,

  fontWeight:"600",

},



text:{

  fontSize:14,

  color:"#64748B",

  marginTop:4,

},




gamesBox:{

  backgroundColor:"#FFF7E8",

  borderRadius:16,

  padding:20,

},




gamesHeader:{

  flexDirection:"row",

  alignItems:"center",

  gap:12,

  marginBottom:12,

},




gameItem:{

  fontSize:14,

  color:"#475569",

  marginBottom:8,

},



});




export default AIInsights;