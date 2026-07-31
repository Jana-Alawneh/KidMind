import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


import {
  Sparkles,
} from "lucide-react-native";


import Card from "./Card";



export default function AIRecommendation(){


  return (

    <Card>


      <View style={styles.header}>


        <View style={styles.iconBox}>

          <Sparkles
            size={24}
            color="#7B6EF6"
          />

        </View>




        <View>

          <Text style={styles.title}>
            KidMind AI
          </Text>


          <Text style={styles.subtitle}>
            Smart Recommendation
          </Text>


        </View>



      </View>





      <View style={styles.content}>


        <View style={styles.firstBox}>


          <Text>

            Lina's attention increased by

            <Text style={styles.purple}>
              {" "}12%
            </Text>


          </Text>


        </View>






        <View style={styles.secondBox}>


          <Text>

            Suggested next game:

          </Text>


          <Text style={styles.bold}>

            Visual Memory Level 3

          </Text>


        </View>






        <TouchableOpacity
          style={styles.button}
        >

          <Text style={styles.buttonText}>
            Generate Full AI Report
          </Text>


        </TouchableOpacity>



      </View>



    </Card>


  );

}




const styles = StyleSheet.create({


header:{

  flexDirection:"row",

  alignItems:"center",

  gap:12,

  marginBottom:24,

},



iconBox:{

  width:48,

  height:48,

  borderRadius:16,

  backgroundColor:"#F2EEFF",

  alignItems:"center",

  justifyContent:"center",

},



title:{

  fontSize:20,

  fontWeight:"700",

},



subtitle:{

  fontSize:14,

  color:"#64748B",

},




content:{

  gap:16,

},




firstBox:{

  backgroundColor:"#F7F5FF",

  borderRadius:16,

  padding:16,

},



secondBox:{

  backgroundColor:"#EEF8E8",

  borderRadius:16,

  padding:16,

},



purple:{

  color:"#7B6EF6",

  fontWeight:"700",

},



bold:{

  fontWeight:"700",

  marginTop:5,

},




button:{

  backgroundColor:"#7B6EF6",

  borderRadius:16,

  paddingVertical:14,

  alignItems:"center",

  marginTop:5,

},




buttonText:{

  color:"white",

  fontWeight:"600",

},



});