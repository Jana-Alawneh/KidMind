import React from "react";

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


import {
  Activity,
  Calendar,
  FileText,
  Pencil,
  Play,
  User,
  Users,
} from "lucide-react-native";


import Card from "../ui/Card";




const ChildInfoCard = () => {


  return (

    <Card>



      {/* Profile */}


      <View style={styles.profile}>


        <Image

          source={{
            uri:"https://i.pravatar.cc/200?img=12"
          }}

          style={styles.avatar}

        />



        <Text style={styles.name}>
          Lina Ahmad
        </Text>



        <Text style={styles.id}>
          Child ID #1001
        </Text>



      </View>






      {/* Information */}



      <View style={styles.infoContainer}>




        <InfoRow

          icon={
            <Calendar
              size={18}
              color="#7B6EF6"
            />
          }

          title="Age"

          value="6 Years"

        />





        <InfoRow

          icon={
            <User
              size={18}
              color="#63B3ED"
            />
          }

          title="Gender"

          value="Female"

        />





        <InfoRow

          icon={
            <Users
              size={18}
              color="#48BB78"
            />
          }

          title="Parent"

          value="Ahmad Ali"

        />





        <InfoRow

          icon={
            <Activity
              size={18}
              color="#F6AD55"
            />
          }

          title="Diagnosis"

          value="ADHD"

        />




      </View>







      {/* Buttons */}



      <View style={styles.buttons}>


        <TouchableOpacity

          style={styles.primaryButton}

        >


          <Play

            size={18}

            color="white"

          />


          <Text style={styles.primaryText}>
            Start Session
          </Text>



        </TouchableOpacity>






        <TouchableOpacity

          style={styles.secondaryButton}

        >



          <FileText

            size={18}

            color="#7B6EF6"

          />



          <Text style={styles.secondaryText}>
            Generate Report
          </Text>



        </TouchableOpacity>








        <TouchableOpacity

          style={styles.editButton}

        >



          <Pencil

            size={18}

            color="#000"

          />



          <Text style={styles.editText}>
            Edit Information
          </Text>



        </TouchableOpacity>



      </View>



    </Card>

  );

};








const InfoRow = ({

  icon,
  title,
  value

}:{

  icon:React.ReactNode;
  title:string;
  value:string;

}) => {


  return (

    <View style={styles.row}>


      <View style={styles.left}>


        {icon}


        <Text>
          {title}
        </Text>


      </View>




      <Text style={styles.value}>
        {value}
      </Text>




    </View>

  );

};








const styles = StyleSheet.create({



profile:{

  alignItems:"center",

},




avatar:{

  width:120,
  height:120,

  borderRadius:56,

  borderWidth:4,

  borderColor:"#EEE9FF",

},




name:{

  fontSize:26,

  fontWeight:"700",

  marginTop:20,

},



id:{

  color:"#64748B",

},





infoContainer:{

  marginTop:32,

  gap:20,

},





row:{

  flexDirection:"row",

  justifyContent:"space-between",

  alignItems:"center",

},




left:{

  flexDirection:"row",

  alignItems:"center",

  gap:12,

},





value:{

  fontWeight:"600",

},





buttons:{

  marginTop:40,

  gap:12,

},





primaryButton:{

  backgroundColor:"#7B6EF6",

  borderRadius:12,

  paddingVertical:15,

  flexDirection:"row",

  justifyContent:"center",

  alignItems:"center",

  gap:8,

},



primaryText:{

  color:"white",

  fontWeight:"600",

},





secondaryButton:{

  backgroundColor:"#F3F0FF",

  borderRadius:12,

  paddingVertical:15,

  flexDirection:"row",

  justifyContent:"center",

  alignItems:"center",

  gap:8,

},




secondaryText:{

  color:"#7B6EF6",

  fontWeight:"600",

},






editButton:{

  borderWidth:1,

  borderColor:"#DDD",

  borderRadius:12,

  paddingVertical:15,

  flexDirection:"row",

  justifyContent:"center",

  alignItems:"center",

  gap:8,

},




editText:{

  fontWeight:"600",

},



});



export default ChildInfoCard;