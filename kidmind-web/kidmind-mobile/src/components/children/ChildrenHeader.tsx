import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    Plus,
    Search,
} from "lucide-react-native";


type Props = {
  onAdd:()=>void;
};



const ChildrenHeader = ({
  onAdd,
}:Props)=>{


return (


<View style={styles.container}>


<View>


<Text style={styles.title}>
Children
</Text>


<Text style={styles.subtitle}>
Manage children's profiles and assessments
</Text>


</View>





<View style={styles.actions}>


<View style={styles.searchBox}>


<Search

size={18}

color="#94A3B8"

/>


<TextInput

placeholder="Search child..."

style={styles.input}

/>


</View>





<TouchableOpacity

onPress={onAdd}

style={styles.addButton}

>


<Plus

size={20}

color="#FFFFFF"

/>


<Text style={styles.addText}>
Add Child
</Text>


</TouchableOpacity>



</View>


</View>


);


};



const styles = StyleSheet.create({


container:{


marginTop:30,


},



title:{


fontSize:30,


fontWeight:"700",


},



subtitle:{


fontSize:15,


color:"#64748B",


marginTop:8,


},




actions:{


marginTop:20,


gap:12,


},




searchBox:{


height:48,


backgroundColor:"#FFFFFF",


borderWidth:1,


borderColor:"#ECECF5",


borderRadius:16,


flexDirection:"row",


alignItems:"center",


paddingHorizontal:15,


gap:10,


},




input:{


flex:1,


},




addButton:{


height:48,


backgroundColor:"#7B6EF6",


borderRadius:16,


flexDirection:"row",


alignItems:"center",


justifyContent:"center",


gap:8,


},




addText:{


color:"#FFFFFF",


fontSize:15,


fontWeight:"600",


},


});



export default ChildrenHeader;