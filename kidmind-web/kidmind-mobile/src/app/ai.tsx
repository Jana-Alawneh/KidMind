import {
    StyleSheet,
    Text,
    View,
} from "react-native";


export default function AI(){

  return(

    <View style={styles.container}>

      <Text style={styles.text}>
        AI Assistant Page
      </Text>

    </View>

  );

}


const styles = StyleSheet.create({

container:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"#F7F8FC",
},


text:{
  fontSize:22,
  fontWeight:"600",
},

});