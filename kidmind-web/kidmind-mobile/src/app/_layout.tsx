/*
import { Stack } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Sidebar from "@/components/layout/Sidebar";


export default function RootLayout() {

  const [sidebarVisible, setSidebarVisible] = useState(false);


  return (

    <View style={{flex:1}}>


      <TouchableOpacity

        style={styles.menuButton}

        onPress={()=>{
          setSidebarVisible(true);
        }}

      >

        <Text style={styles.menuText}>
          ☰
        </Text>


      </TouchableOpacity>



      <Sidebar

        visible={sidebarVisible}

        onClose={()=>{
          setSidebarVisible(false);
        }}

      />



      <Stack
        screenOptions={{
          headerShown:false,
        }}
      />


    </View>

  );
}



const styles = StyleSheet.create({

menuButton:{

  position:"absolute",

  top:50,

  left:20,

  zIndex:200,

  backgroundColor:"#FFFFFF",

  width:45,

  height:45,

  borderRadius:12,

  justifyContent:"center",

  alignItems:"center",

  shadowColor:"#000",

  shadowOpacity:0.1,

  shadowRadius:5,

  elevation:5,

},


menuText:{

  fontSize:25,

}

}); 
*/
import { Stack } from "expo-router";


export default function RootLayout() {

  return (

    <Stack

      screenOptions={{
        headerShown:false,
      }}

    />

  );

}