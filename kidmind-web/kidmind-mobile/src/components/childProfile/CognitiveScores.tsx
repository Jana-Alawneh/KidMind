
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    BookOpen,
    Brain,
    Database,
    Eye,
    Target,
} from "lucide-react-native";


import Card from "../ui/Card";


const scores = [

  {
    title: "Overall Score",
    value: 92,
    color: "#7B6EF6",
    icon: <Brain size={18} color="white" />,
  },

  {
    title: "Attention",
    value: 90,
    color: "#63B3ED",
    icon: <Eye size={18} color="white" />,
  },

  {
    title: "Working Memory",
    value: 87,
    color: "#48BB78",
    icon: <Database size={18} color="white" />,
  },

  {
    title: "Executive Functions",
    value: 95,
    color: "#F6AD55",
    icon: <Target size={18} color="white" />,
  },

  {
    title: "Reading Skills",
    value: 89,
    color: "#F56565",
    icon: <BookOpen size={18} color="white" />,
  },

];



export default function CognitiveScores(){

  return (

    <Card>


      <Text style={styles.title}>
        Cognitive Assessment
      </Text>



      {
        scores.map((item)=>(

          <View
            key={item.title}
            style={styles.item}
          >


            <View style={styles.header}>


              <View style={styles.left}>


                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:item.color
                    }
                  ]}
                >

                  {item.icon}

                </View>



                <Text style={styles.name}>
                  {item.title}
                </Text>


              </View>




              <Text style={styles.score}>
                {item.value}%
              </Text>



            </View>




            <View style={styles.progressBackground}>

              <View
                style={[
                  styles.progress,
                  {
                    width:`${item.value}%`,
                    backgroundColor:item.color
                  }
                ]}
              />

            </View>



          </View>


        ))
      }



    </Card>

  );

}



const styles = StyleSheet.create({

  title:{
    fontSize:24,
    fontWeight:"700",
    marginBottom:32,
  },


  item:{
    marginBottom:24,
  },


  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:10,
  },


  left:{
    flexDirection:"row",
    alignItems:"center",
    gap:14,
  },


  iconBox:{
    width:42,
    height:42,
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center",
  },


  name:{
    fontSize:17,
    fontWeight:"600",
    color:"#1E293B",
  },


  score:{
    fontSize:19,
    fontWeight:"700",
    color:"#0F172A",
  },


  progressBackground:{
    height:10,
    backgroundColor:"#E5E7EB",
    borderRadius:20,
    overflow:"hidden",
  },


  progress:{
    height:"100%",
    borderRadius:20,
  },


});