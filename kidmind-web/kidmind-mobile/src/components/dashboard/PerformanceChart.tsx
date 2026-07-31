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
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
  ],

  datasets:[

    {
      data:[
        65,
        72,
        80,
        91
      ],
      color:()=>"#7B6EF6",
      strokeWidth:3,
    },


    {
      data:[
        58,
        65,
        73,
        85
      ],
      color:()=>"#63B3ED",
      strokeWidth:3,
    },


    {
      data:[
        70,
        74,
        82,
        89
      ],
      color:()=>"#48BB78",
      strokeWidth:3,
    },


    {
      data:[
        55,
        61,
        70,
        81
      ],
      color:()=>"#F6AD55",
      strokeWidth:3,
    },

  ]

};



export default function PerformanceChart(){


return (

<Card>


<View style={styles.header}>


<View>

<Text style={styles.title}>
Cognitive Performance
</Text>


<Text style={styles.subtitle}>
Children's progress over the last four weeks
</Text>

</View>


<View style={styles.select}>

<Text>
This Month
</Text>

</View>


</View>




<LineChart

data={data}

width={330}

height={260}

chartConfig={{

backgroundGradientFrom:"#FFFFFF",

backgroundGradientTo:"#FFFFFF",

decimalPlaces:0,

color:()=>"#64748B",

labelColor:()=>"#64748B",


propsForDots:{

r:"5",

strokeWidth:"2",

},


}}

withInnerLines={true}

withOuterLines={false}

bezier

style={styles.chart}

/>



<View style={styles.legend}>


<Legend
color="#7B6EF6"
text="Attention"
/>


<Legend
color="#63B3ED"
text="Working Memory"
/>


<Legend
color="#48BB78"
text="Reading"
/>


<Legend
color="#F6AD55"
text="Executive Functions"
/>


</View>



</Card>

);

}



function Legend({
color,
text
}:{
color:string;
text:string;
}){

return (

<View style={styles.legendItem}>

<View
style={[
styles.dot,
{
backgroundColor:color
}
]}
/>

<Text style={styles.legendText}>
{text}
</Text>


</View>

);

}





const styles=StyleSheet.create({


header:{

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

marginBottom:25,

},


title:{

fontSize:20,

fontWeight:"700",

},


subtitle:{

fontSize:13,

color:"#94A3B8",

marginTop:5,

},



select:{

borderWidth:1,

borderColor:"#E5E7EB",

borderRadius:12,

paddingHorizontal:12,

paddingVertical:8,

},



chart:{

marginLeft:-20,

},



legend:{

flexDirection:"row",

flexWrap:"wrap",

gap:15,

marginTop:20,

},



legendItem:{

flexDirection:"row",

alignItems:"center",

gap:6,

},



dot:{

width:10,

height:10,

borderRadius:5,

},



legendText:{

fontSize:12,

color:"#64748B",

},


});