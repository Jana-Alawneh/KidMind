/*import React from "react";
import {
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Card = ({
  children,
  style,
}: CardProps) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#ECECF5",

    padding: 16,

    shadowColor: "#7C6CFF",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 40,

    elevation: 4,
  },
});

export default Card;*/

import React from "react";

import {
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";


interface CardProps {

  children: React.ReactNode;

  style?: ViewStyle;

}


const Card = ({
  children,
  style,
}: CardProps) => {


  return (

    <View style={[
      styles.card,
      style
    ]}>

      {children}

    </View>

  );

};



const styles = StyleSheet.create({

  card: {

    backgroundColor:"#FFFFFF",

    borderRadius:20,

    padding:20,

    borderWidth:1,

    borderColor:"#ECECF5",


    shadowColor:"#7B6EF6",

    shadowOffset:{
      width:0,
      height:8,
    },

    shadowOpacity:0.08,

    shadowRadius:20,


    elevation:3,

    width:"100%",


  },


});


export default Card;