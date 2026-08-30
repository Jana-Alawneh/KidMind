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
  onAdd: () => void;

  searchQuery: string;

  onSearchChange: (
    value: string
  ) => void;
};


const ChildrenHeader = ({
  onAdd,
  searchQuery,
  onSearchChange,
}: Props) => {

  return (

    <View>

      <View
        style={
          styles.heading
        }
      >

        <View
          style={
            styles.headingCopy
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            CHILD MANAGEMENT
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Children
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Manage children&apos;s profiles, assessments and progress.
          </Text>

        </View>


        <TouchableOpacity
          activeOpacity={
            0.8
          }
          onPress={
            onAdd
          }
          style={
            styles.addButton
          }
        >

          <Plus
            size={16}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.addText
            }
          >
            Add Child
          </Text>

        </TouchableOpacity>

      </View>


      <View
        style={
          styles.searchPanel
        }
      >

        <View
          style={
            styles.searchBox
          }
        >

          <Search
            size={16}
            color="#A0A3B6"
          />


          <TextInput
            value={
              searchQuery
            }
            onChangeText={
              onSearchChange
            }
            placeholder="Search by ID, child, parent or region..."
            placeholderTextColor="#A9ACBC"
            style={
              styles.input
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

        </View>

      </View>

    </View>

  );

};


const styles =
  StyleSheet.create({

    heading: {

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        12,

    },


    headingCopy: {

      flex: 1,

      minWidth:
        0,

    },


    eyebrow: {

      color:
        "#8172EA",

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        1,

    },


    title: {

      marginTop:
        5,

      color:
        "#303253",

      fontSize:
        25,

      lineHeight:
        31,

      fontWeight:
        "800",

    },


    subtitle: {

      marginTop:
        4,

      maxWidth:
        245,

      color:
        "#9699AC",

      fontSize:
        10.5,

      lineHeight:
        16,

    },


    addButton: {

      minHeight:
        44,

      paddingHorizontal:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        6,

      borderRadius:
        13,

      backgroundColor:
        "#7969EA",

      shadowColor:
        "#7969EA",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        0.15,

      shadowRadius:
        8,

      elevation:
        2,

    },


    addText: {

      color:
        "#FFFFFF",

      fontSize:
        10,

      fontWeight:
        "700",

    },


    searchPanel: {

      marginTop:
        19,

      padding:
        11,

      borderRadius:
        17,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    searchBox: {

      minHeight:
        45,

      paddingHorizontal:
        13,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,

      borderRadius:
        12,

      backgroundColor:
        "#FBFBFD",

      borderWidth:
        1,

      borderColor:
        "#E7E7F0",

    },


    input: {

      flex:
        1,

      minHeight:
        43,

      paddingVertical:
        0,

      color:
        "#343654",

      fontSize:
        11.5,

    },

  });


export default ChildrenHeader;