
import {
    StyleSheet,
    Text,
    View,
} from "react-native";


import {
    Bell,
} from "lucide-react-native";




const notifications = [

  {
    id:1,
    title:"Lina completed Attention Assessment",
    time:"5 min ago",
  },


  {
    id:2,
    title:"AI generated a new recommendation",
    time:"20 min ago",
  },


  {
    id:3,
    title:"New child added successfully",
    time:"1 hour ago",
  },


];





const Notifications = () => {


  return (

    <View style={styles.container}>


      {/* Header */}


      <View style={styles.header}>


        <Text style={styles.headerText}>
          Notifications
        </Text>


      </View>





      {
        notifications.map((item)=>(


          <View

            key={item.id}

            style={styles.item}

          >



            <View style={styles.row}>


              <View style={styles.iconBox}>


                <Bell

                  size={18}

                  color="#7B6EF6"

                />


              </View>




              <View style={styles.textContainer}>


                <Text style={styles.title}>

                  {item.title}

                </Text>



                <Text style={styles.time}>

                  {item.time}

                </Text>


              </View>



            </View>



          </View>


        ))
      }



    </View>

  );

};






const styles = StyleSheet.create({



container:{


  position:"absolute",

  right:0,

  top:55,


  width:320,


  backgroundColor:"#FFFFFF",


  borderRadius:24,


  borderWidth:1,

  borderColor:"#ECECF5",


  shadowColor:"#000",

  shadowOpacity:0.15,

  shadowRadius:10,

  elevation:10,


  overflow:"hidden",

  zIndex:50,

},





header:{

  paddingHorizontal:24,

  paddingVertical:20,

  borderBottomWidth:1,

  borderColor:"#ECECF5",

},




headerText:{

  fontSize:18,

  fontWeight:"700",

},





item:{


  paddingHorizontal:24,

  paddingVertical:16,


},





row:{


  flexDirection:"row",

  gap:12,


},




iconBox:{


  width:40,

  height:40,


  borderRadius:12,


  backgroundColor:"#EEE9FF",


  justifyContent:"center",

  alignItems:"center",


},




textContainer:{


  flex:1,

},





title:{


  fontSize:14,

  fontWeight:"500",


},





time:{


  fontSize:12,

  color:"#94A3B8",


  marginTop:4,


},



});



export default Notifications;