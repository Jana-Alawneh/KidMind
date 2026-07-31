
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


import {
  Clock3,
} from "lucide-react-native";


import Card from "../ui/Card";



const sessions = [

  {
    child: "Lina Ahmad",
    game: "Attention Assessment",
    time: "09:00 AM",
  },


  {
    child: "Omar Ali",
    game: "Memory Game",
    time: "11:30 AM",
  },


  {
    child: "Sara Mohammed",
    game: "Reading Assessment",
    time: "02:00 PM",
  },

];





const TodaySessions = () => {


  return (

    <Card>



      {/* Header */}

      <View style={styles.header}>


        <View>

          <Text style={styles.title}>
            Today's Sessions
          </Text>


          <Text style={styles.subtitle}>
            Scheduled assessment sessions
          </Text>


        </View>



        <TouchableOpacity>

          <Text style={styles.viewAll}>
            View All
          </Text>

        </TouchableOpacity>


      </View>





      {/* Sessions */}

      <View style={styles.sessionsContainer}>


        {
          sessions.map((item)=>(


            <View

              key={item.child}

              style={styles.sessionCard}

            >



              <View style={styles.leftSide}>


                <View style={styles.iconBox}>


                  <Clock3
                    size={20}
                    color="#7B6EF6"
                  />


                </View>




                <View>


                  <Text style={styles.childName}>
                    {item.child}
                  </Text>


                  <Text style={styles.game}>
                    {item.game}
                  </Text>


                </View>


              </View>





              <Text style={styles.time}>
                {item.time}
              </Text>



            </View>


          ))
        }


      </View>


    </Card>

  );

};





const styles = StyleSheet.create({


header:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:24,
},



title:{
  fontSize:20,
  fontWeight:"600",
},



subtitle:{
  fontSize:14,
  color:"#94A3B8",
},



viewAll:{
  color:"#7B6EF6",
  fontWeight:"600",
},



sessionsContainer:{
  gap:16,
},



sessionCard:{
  backgroundColor:"#F8F9FD",

  borderRadius:16,

  padding:16,

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",
},




leftSide:{
  flexDirection:"row",
  alignItems:"center",
  gap:16,
},




iconBox:{
  width:48,
  height:48,

  borderRadius:16,

  backgroundColor:"#EEE9FF",

  justifyContent:"center",
  alignItems:"center",
},




childName:{
  fontWeight:"600",
  fontSize:16,
},



game:{
  fontSize:14,
  color:"#64748B",
  marginTop:4,
},



time:{
  fontWeight:"600",
},



});



export default TodaySessions;