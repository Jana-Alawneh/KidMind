import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react-native";

import { router } from "expo-router";

import Card from "../ui/Card";

import type { Child } from "@/api/childrenApi";


type Props = {
  children: Child[];
  onEdit: (child: Child) => void;
  onDelete: (child: Child) => void;
};


const getScore = (
  score: Child["score"]
) => {
  if (
    score === null ||
    score === undefined ||
    score === ""
  ) {
    return "—";
  }

  const value = String(score);

  return value.includes("%")
    ? value
    : `${value}%`;
};


const ChildrenTable = ({
  children,
  onEdit,
  onDelete,
}: Props) => {

  return (

    <Card>

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Children List
          </Text>

          <Text style={styles.subtitle}>
            All registered children
          </Text>

        </View>

        <View style={styles.countBox}>

          <Text style={styles.countText}>
            {children.length} Children
          </Text>

        </View>

      </View>


      {children.length === 0 ? (

        <View style={styles.emptyBox}>

          <Text style={styles.emptyText}>
            No children found.
          </Text>

        </View>

      ) : (

        children.map((child) => (

          <View
            key={child.id}
            style={styles.childCard}
          >

            <View style={styles.childHeader}>

              <View style={styles.childInfo}>

                <Image
                  source={{
                    uri:
                      child.image ||
                      `https://i.pravatar.cc/100?u=kidmind-${child.id}`,
                  }}
                  style={styles.image}
                />

                <View style={styles.nameSection}>

                  <Text style={styles.name}>
                    {child.full_name}
                  </Text>

                  <Text style={styles.gender}>
                    {child.gender}
                  </Text>

                </View>

              </View>

              <Text style={styles.score}>
                {getScore(child.score)}
              </Text>

            </View>


            <View style={styles.details}>

              <View>

                <Text style={styles.label}>
                  Age
                </Text>

                <Text>
                  {child.age} Years
                </Text>

              </View>


              <View style={styles.assessmentBox}>

                <Text style={styles.label}>
                  Last Assessment
                </Text>

                <Text style={styles.assessmentText}>
                  {child.last_assessment ||
                    "Not assessed"}
                </Text>

              </View>


              <View style={styles.statusBox}>

                <Text style={styles.status}>
                  {child.status || "Active"}
                </Text>

              </View>

            </View>


            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => {
                  router.push({
                    pathname: "/children/[id]",
                    params: {
                      id: child.id.toString(),
                    },
                  });
                }}
              >

                <Eye
                  size={18}
                  color="#7B6EF6"
                />

              </TouchableOpacity>


              <TouchableOpacity
  style={styles.editButton}
  onPress={() => {
    onEdit(child);
  }}
>
  <Pencil
    size={18}
    color="#2563EB"
  />
</TouchableOpacity>


              <TouchableOpacity
  style={styles.deleteButton}
  onPress={() => {
    onDelete(child);
  }}
>
  <Trash2
    size={18}
    color="#EF4444"
  />
</TouchableOpacity>

            </View>

          </View>

        ))

      )}

    </Card>

  );

};


const styles = StyleSheet.create({

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
  },

  countBox: {
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  countText: {
    color: "#7B6EF6",
    fontWeight: "600",
  },

  childCard: {
    backgroundColor: "#FAFAFD",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
  },

  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  nameSection: {
    flex: 1,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  name: {
    fontWeight: "700",
    fontSize: 16,
  },

  gender: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },

  score: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7B6EF6",
  },

  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    alignItems: "center",
    gap: 10,
  },

  assessmentBox: {
    flex: 1,
    alignItems: "center",
  },

  assessmentText: {
    textAlign: "center",
  },

  label: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 3,
  },

  statusBox: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  status: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 15,
  },

  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEE9FF",
    justifyContent: "center",
    alignItems: "center",
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#94A3B8",
  },

});


export default ChildrenTable;