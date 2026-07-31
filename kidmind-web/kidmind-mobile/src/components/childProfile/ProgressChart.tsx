import {
    StyleSheet,
    Text,
    View,
} from "react-native";


import {
    LineChart,
} from "react-native-chart-kit";


import Card from "../ui/Card";



const data = {

labels:[
"S1",
"S2",
"S3",
"S4",
"S5",
"S6",
],


datasets:[

{
data:[
65,
70,
76,
82,
87,
91
],

color:()=>"#7B6EF6",

strokeWidth:3,

},


{
data:[
58,
65,
71,
78,
83,
87
],

color:()=>"#63B3ED",

strokeWidth:3,

},


{
data:[
60,
68,
75,
80,
88,
94
],

color:()=>"#48BB78",

strokeWidth:3,

},


{
data:[
55,
60,
67,
73,
81,
88
],

color:()=>"#F6AD55",

strokeWidth:3,

},


]

};




const ProgressChart =()=>{


return (

<Card>


<View style={styles.header}>


<View>

<Text style={styles.title}>
Cognitive Progress
</Text>


<Text style={styles.subtitle}>
Last 6 assessment sessions
</Text>


</View>



<View style={styles.badge}>

<Text style={styles.badgeText}>
Improving
</Text>

</View>


</View>





<LineChart


data={data}


width={330}


height={280}


chartConfig={{

backgroundGradientFrom:"#FFFFFF",

backgroundGradientTo:"#FFFFFF",

decimalPlaces:0,


color:(opacity=1)=>
`rgba(123,110,246,${opacity})`,


labelColor:()=>
"#64748B",


propsForDots:{

r:"4",

strokeWidth:"2",

},


}}


bezier


style={styles.chart}


/>



<View style={styles.legend}>


<Text style={styles.purple}>
● Attention
</Text>


<Text style={styles.blue}>
● Memory
</Text>


<Text style={styles.green}>
● Executive
</Text>


<Text style={styles.orange}>
● Reading
</Text>


</View>



</Card>


);


};





const styles=StyleSheet.create({


header:{

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

marginBottom:20,

},



title:{

fontSize:22,

fontWeight:"700",

},



subtitle:{

color:"#64748B",

marginTop:5,

},



badge:{

backgroundColor:"#F4F1FF",

paddingHorizontal:15,

paddingVertical:8,

borderRadius:12,

},



badgeText:{

color:"#7B6EF6",

fontWeight:"600",

},



chart:{

borderRadius:20,

},



legend:{

flexDirection:"row",

justifyContent:"space-around",

marginTop:15,

},



purple:{

color:"#7B6EF6",

},


blue:{

color:"#63B3ED",

},


green:{

color:"#48BB78",

},


orange:{

color:"#F6AD55",

},



});



export default ProgressChart;