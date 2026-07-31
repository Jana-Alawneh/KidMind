
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    CalendarPlus,
    FileText,
    Sparkles,
    UserPlus,
} from "lucide-react-native";


import Card from "../ui/Card";



const actions = [

  {
    title: "Add Child",
    icon: UserPlus,
    color: "#F3EEFF",
  },


  {
    title: "Create Session",
    icon: CalendarPlus,
    color: "#EAF7FF",
  },


  {
    title: "Generate Report",
    icon: FileText,
    color: "#FFF4E8",
  },


  {
    title: "AI Assistant",
    icon: Sparkles,
    color: "#EEF8E8",
  },

];




const QuickActions = () => {


  return (

    <Card>


      <Text style={styles.title}>
        Quick Actions
      </Text>



      <View style={styles.grid}>


        {
          actions.map((action)=>{


            const Icon = action.icon;


            return (

              <TouchableOpacity

                key={action.title}

                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      action.color
                  }
                ]}

              >


                <Icon
                  size={22}
                  color="#7B6EF6"
                />


                <Text style={styles.actionText}>
                  {action.title}
                </Text>


              </TouchableOpacity>


            );


          })
        }


      </View>


    </Card>

  );

};





const styles = StyleSheet.create({


  title:{
    fontSize:20,
    fontWeight:"600",
    marginBottom:24,
  },


  grid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between",
    gap:16,
  },



  actionButton:{
    width:"47%",

    borderRadius:16,

    padding:20,

    alignItems:"center",

    justifyContent:"center",

    gap:12,
  },


  actionText:{
    fontWeight:"600",
    textAlign:"center",
  },


});



export default QuickActions;