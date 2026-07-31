import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    CheckCircle,
    Download,
    Eye,
    FileText,
} from "lucide-react-native";

import Card from "../ui/Card";

const reports = [
  {
    id: 1,
    title: "Initial Assessment",
    date: "12 Jun 2025",
    score: "78%",
    status: "Completed",
  },
  {
    id: 2,
    title: "Attention Assessment",
    date: "22 Jun 2025",
    score: "85%",
    status: "Completed",
  },
  {
    id: 3,
    title: "Memory Assessment",
    date: "02 Jul 2025",
    score: "91%",
    status: "Completed",
  },
  {
    id: 4,
    title: "Executive Functions",
    date: "08 Jul 2025",
    score: "94%",
    status: "AI Generated",
  },
];

const ReportsTable = () => {
  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Assessment Reports
          </Text>

          <Text style={styles.subtitle}>
            Previous assessment history
          </Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Generate Report
          </Text>
        </TouchableOpacity>
      </View>

      {reports.map((report) => (
        <View
          key={report.id}
          style={styles.card}
        >
          <View style={styles.topRow}>
            <View style={styles.left}>
              <View style={styles.iconBox}>
                <FileText
                  size={22}
                  color="#7B6EF6"
                />
              </View>

              <View>
                <Text style={styles.reportTitle}>
                  {report.title}
                </Text>

                <Text style={styles.reportId}>
                  Report #{report.id}
                </Text>
              </View>
            </View>

            <Text style={styles.score}>
              {report.score}
            </Text>
          </View>

          <Text style={styles.date}>
            {report.date}
          </Text>

          <View style={styles.bottom}>
            <View style={styles.status}>
              <CheckCircle
                size={14}
                color="#15803D"
              />

              <Text style={styles.statusText}>
                {report.status}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.view}>
                <Eye
                  size={18}
                  color="#2563EB"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.download}>
                <Download
                  size={18}
                  color="#7B6EF6"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#7B6EF6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FAFAFD",
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F2EEFF",
    justifyContent: "center",
    alignItems: "center",
  },

  reportTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  reportId: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  score: {
    color: "#7B6EF6",
    fontWeight: "700",
    fontSize: 22,
  },

  date: {
    marginTop: 12,
    color: "#64748B",
  },

  bottom: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  view: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  download: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEE9FF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReportsTable;