
import {
    StyleSheet,
    View,
} from "react-native";


import {
    Bot,
    CalendarCheck,
    FileText,
    Users,
} from "lucide-react-native";


import StatCard from "../ui/StatCard";



const StatsSection = () => {



  const stats = [

    {
      title:"Children",
      value:"24",
      subtitle:"Registered children",
      trend:"+12%",

      icon:
        <Users
          size={24}
          color="#7B6EF6"
        />,
    },


    {
      title:"Sessions",
      value:"18",
      subtitle:"This month",
      trend:"+8%",


      icon:
        <CalendarCheck
          size={24}
          color="#63B3ED"
        />,
    },



    {
      title:"Reports",
      value:"46",
      subtitle:"Generated reports",
      trend:"+15%",


      icon:
        <FileText
          size={24}
          color="#F6AD55"
        />,
    },



    {
      title:"AI Insights",
      value:"18",
      subtitle:"Recommendations",
      trend:"+20%",


      icon:
        <Bot
          size={24}
          color="#48BB78"
        />,
    },


  ];




  return (

    <View style={styles.container}>


      {
        stats.map((item)=>(


          <View
            key={item.title}
            style={styles.cardWrapper}
          >

            <StatCard
              {...item}
            />


          </View>


        ))
      }


    </View>

  );

};





const styles = StyleSheet.create({


  container:{

    flexDirection:"row",

    flexWrap:"wrap",

    gap:16,

    marginTop:32,

  },


  cardWrapper:{

    width:"47%",

  },


});



export default StatsSection;