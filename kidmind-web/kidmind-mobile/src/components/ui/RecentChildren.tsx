import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Card from "./Card";

const children = [
  {
    name: "Lina Ahmad",
    age: 6,
    score: "92%",
  },
  {
    name: "Omar Ali",
    age: 8,
    score: "87%",
  },
  {
    name: "Sara Mohammed",
    age: 5,
    score: "95%",
  },
];

const RecentChildren = () => {
  return (
    <Card>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Recent Children
        </Text>

        <TouchableOpacity>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>


      {/* Children List */}
      <View>

        {children.map((child) => (
          <View
            key={child.name}
            style={styles.childRow}
          >

            <View style={styles.childInfo}>

              <Image
                source={{
                  uri: `https://api.dicebear.com/7.x/adventurer/svg?seed=${child.name}`,
                }}
                style={styles.avatar}
              />


              <View>
                <Text style={styles.name}>
                  {child.name}
                </Text>

                <Text style={styles.age}>
                  Age {child.age}
                </Text>
              </View>

            </View>


            <Text style={styles.score}>
              {child.score}
            </Text>

          </View>
        ))}

      </View>

    </Card>
  );
};


const styles = StyleSheet.create({

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },


  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },


  viewAll: {
    color: "#7B6EF6",
    fontWeight: "600",
  },


  childRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },


  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },


  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3F4FF",
    marginRight: 16,
  },


  name: {
    fontWeight: "600",
    fontSize: 16,
  },


  age: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 3,
  },


  score: {
    color: "#7B6EF6",
    fontWeight: "700",
    fontSize: 16,
  },

});


export default RecentChildren;