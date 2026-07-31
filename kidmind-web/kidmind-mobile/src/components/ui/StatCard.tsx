import React from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import Card from "./Card";


interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: string;
  icon: React.ReactNode;

  theme?: {
    icon?: string;
    glow?: string;
  };
}


const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) => {


  return (

    <Card>

      <View style={styles.container}>


        {/* Background Icon */}

        <View style={styles.backgroundIcon}>

          <View style={styles.iconScale}>
            {icon}
          </View>

        </View>



        {/* Content */}

        <View style={styles.content}>


          <Text style={styles.title}>
            {title}
          </Text>


          <Text style={styles.value}>
            {value}
          </Text>


          <Text style={styles.subtitle}>
            {subtitle}
          </Text>



          <View style={styles.trendContainer}>

            <Text style={styles.trend}>
              ↑ {trend}
            </Text>


            <Text style={styles.compare}>
              compared to last week
            </Text>

          </View>


        </View>


      </View>


    </Card>

  );
};



const styles = StyleSheet.create({


  container:{
    height:165,
    overflow:"hidden",
  },


  backgroundIcon:{
    position:"absolute",

    right:-25,

    top:"50%",

    width:140,
    height:140,

    borderRadius:20,

    backgroundColor:"#EEE9FF",

    justifyContent:"center",
    alignItems:"center",

    opacity:0.2,

  },


  iconScale:{
    transform:[
      {
        scale:3
      }
    ]
  },


  content:{
    position:"relative",
    zIndex:10,
    paddingRight:40,
  },


  title:{
    fontSize:14,
    fontWeight:"500",
    color:"#8E91A8",
  },


  value:{
    fontSize:32,
    fontWeight:"700",
    color:"#2B2E4A",
    marginTop:12,
  },


  subtitle:{
    fontSize:12,
    color:"#8E91A8",
    marginTop:8,
  },


  trendContainer:{
    flexDirection:"row",
    alignItems:"center",
    gap:8,
    marginTop:20,
  },


  trend:{
    fontSize:14,
    fontWeight:"600",
    color:"#64D2A3",
  },


  compare:{
    fontSize:12,
    color:"#8E91A8",
  },


});


export default StatCard;