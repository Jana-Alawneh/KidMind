
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    FileText,
} from "lucide-react-native";


import Card from "../ui/Card";



const assessments = [

  {
    child: "Lina Ahmad",
    activity: "Attention Game",
    score: "92%",
    date: "Today",
    status: "Completed",
  },


  {
    child: "Omar Ali",
    activity: "Memory Assessment",
    score: "85%",
    date: "Yesterday",
    status: "Completed",
  },


  {
    child: "Sara Mohammed",
    activity: "Reading Test",
    score: "95%",
    date: "July 7",
    status: "Pending",
  },

];




const RecentAssessments = () => {


  return (

    <Card>


      {/* Header */}

      <View style={styles.header}>


        <View>

          <Text style={styles.title}>
            Recent Assessments
          </Text>


          <Text style={styles.subtitle}>
            Latest cognitive evaluation results
          </Text>

        </View>



        <TouchableOpacity>

          <Text style={styles.viewAll}>
            View All
          </Text>

        </TouchableOpacity>


      </View>





      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >


        <View>


          {/* Table Header */}

          <View style={styles.row}>


            <Text style={styles.headerCell}>
              Child
            </Text>


            <Text style={styles.headerCell}>
              Activity
            </Text>


            <Text style={styles.headerCell}>
              Score
            </Text>


            <Text style={styles.headerCell}>
              Date
            </Text>


            <Text style={styles.headerCell}>
              Status
            </Text>


            <Text style={styles.headerCell}>
              Action
            </Text>


          </View>





          {
            assessments.map((item)=>(


              <View
                key={item.child}
                style={styles.dataRow}
              >


                {/* Child */}

                <View style={styles.childContainer}>


                  <View style={styles.iconBox}>

                    <FileText
                      size={18}
                      color="#7B6EF6"
                    />

                  </View>


                  <Text style={styles.childName}>
                    {item.child}
                  </Text>


                </View>





                <Text style={styles.cell}>
                  {item.activity}
                </Text>





                <Text style={styles.score}>
                  {item.score}
                </Text>





                <Text style={styles.cell}>
                  {item.date}
                </Text>





                <View>

                  <View
                    style={[
                      styles.status,
                      item.status === "Completed"
                      ?
                      styles.completed
                      :
                      styles.pending
                    ]}
                  >

                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Completed"
                        ?
                        styles.completedText
                        :
                        styles.pendingText
                      ]}
                    >
                      {item.status}
                    </Text>


                  </View>


                </View>





                <TouchableOpacity
                  style={styles.reportButton}
                >

                  <Text style={styles.reportText}>
                    View Report
                  </Text>

                </TouchableOpacity>



              </View>


            ))
          }



        </View>


      </ScrollView>


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
  marginTop:4,
},


viewAll:{
  color:"#7B6EF6",
  fontWeight:"600",
  fontSize:14,
},



row:{
  flexDirection:"row",
  borderBottomWidth:1,
  borderColor:"#F1F1F1",
  paddingBottom:12,
},


dataRow:{
  flexDirection:"row",
  alignItems:"center",
  paddingVertical:20,
  borderBottomWidth:1,
  borderColor:"#F1F1F1",
},



headerCell:{
  width:120,
  color:"#94A3B8",
  fontSize:14,
  fontWeight:"500",
},



cell:{
  width:120,
  color:"#475569",
},



childContainer:{
  width:150,
  flexDirection:"row",
  alignItems:"center",
  gap:12,
},



iconBox:{
  width:40,
  height:40,
  borderRadius:16,
  backgroundColor:"#EEE9FF",
  justifyContent:"center",
  alignItems:"center",
},



childName:{
  fontWeight:"600",
},



score:{
  width:100,
  fontWeight:"700",
  color:"#7B6EF6",
},



status:{
  paddingHorizontal:12,
  paddingVertical:5,
  borderRadius:50,
},


completed:{
  backgroundColor:"#E8FFF5",
},


pending:{
  backgroundColor:"#FFF5DD",
},



statusText:{
  fontSize:12,
  fontWeight:"600",
},


completedText:{
  color:"#38B2AC",
},


pendingText:{
  color:"#F6AD55",
},



reportButton:{
  backgroundColor:"#7B6EF6",
  paddingHorizontal:16,
  paddingVertical:10,
  borderRadius:12,
  marginLeft:20,
},


reportText:{
  color:"#FFFFFF",
  fontSize:12,
  fontWeight:"600",
},



});


export default RecentAssessments;