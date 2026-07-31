
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";



const ProfileMenu = () => {


  return (

    <View style={styles.container}>


      <TouchableOpacity
        style={styles.item}
      >

        <Text style={styles.text}>
          👤 My Profile
        </Text>


      </TouchableOpacity>





      <TouchableOpacity
        style={styles.item}
      >

        <Text style={styles.text}>
          ⚙ Settings
        </Text>


      </TouchableOpacity>





      <TouchableOpacity
        style={styles.item}
      >

        <Text style={styles.logout}>
          Logout
        </Text>


      </TouchableOpacity>



    </View>

  );

};






const styles = StyleSheet.create({



container:{


  position:"absolute",

  right:0,

  top:55,


  width:220,


  backgroundColor:"#FFFFFF",


  borderRadius:24,


  borderWidth:1,

  borderColor:"#ECECF5",


  overflow:"hidden",


  shadowColor:"#000",

  shadowOpacity:0.15,

  shadowRadius:10,

  elevation:10,


  zIndex:50,


},





item:{


  width:"100%",


  paddingHorizontal:24,


  paddingVertical:16,


},





text:{


  fontSize:15,


},





logout:{


  fontSize:15,

  color:"red",

},



});



export default ProfileMenu;