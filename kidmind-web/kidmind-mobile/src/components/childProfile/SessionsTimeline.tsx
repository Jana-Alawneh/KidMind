import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import Card from "../ui/Card";

const sessions = [
  {
    date: "12 Jun 2025",
    game: "Memory Match",
    duration: "20 min",
  },
  {
    date: "20 Jun 2025",
    game: "Attention Focus",
    duration: "25 min",
  },
  {
    date: "02 Jul 2025",
    game: "Reading Adventure",
    duration: "18 min",
  },
];

const SessionsTimeline = () => {
  return (
    <Card>
      <Text style={styles.title}>
        Recent Sessions
      </Text>

      {sessions.map((session, index) => (
        <View
          key={index}
          style={styles.row}
        >
          <View style={styles.timeline}>
            <View style={styles.circle} />

            {index !== sessions.length - 1 && (
              <View style={styles.line} />
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.game}>
              {session.game}
            </Text>

            <Text style={styles.date}>
              {session.date}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {session.duration}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
  },

  row: {
    flexDirection: "row",
    marginBottom: 20,
  },

  timeline: {
    alignItems: "center",
    marginRight: 15,
  },

  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#7B6EF6",
  },

  line: {
    width: 2,
    height: 70,
    backgroundColor: "#E6E2FF",
    marginTop: 4,
  },

  content: {
    flex: 1,
  },

  game: {
    fontSize: 16,
    fontWeight: "700",
  },

  date: {
    marginTop: 4,
    color: "#64748B",
  },

  badge: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#F3F0FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#7B6EF6",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default SessionsTimeline;