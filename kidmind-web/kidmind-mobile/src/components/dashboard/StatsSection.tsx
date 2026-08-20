import {
  useEffect,
  useState,
} from "react";

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

import {
  getChildren,
} from "@/api/childrenApi";

import {
  getSessions,
} from "@/api/sessionsApi";


const parseDate = (
  value:
    | string
    | null
    | undefined
) => {

  if (!value) {
    return null;
  }


  const date =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;

};


const getSessionDate = (
  session: any
) => {

  return (
    parseDate(
      session.created_at
    ) ||
    parseDate(
      session.scheduled_at
    ) ||
    parseDate(
      session.started_at
    ) ||
    parseDate(
      session.ended_at
    )
  );

};


const StatsSection = () => {

  const [
    childrenCount,
    setChildrenCount,
  ] = useState<number | null>(
    null
  );


  const [
    sessionsThisMonth,
    setSessionsThisMonth,
  ] = useState<number | null>(
    null
  );


  const [
    reportsCount,
    setReportsCount,
  ] = useState<number | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState(false);


  useEffect(() => {

    const loadStats =
      async () => {

        try {

          setLoading(true);
          setError(false);


          const [
            childrenData,
            sessionsData,
          ] =
            await Promise.all([
              getChildren(),
              getSessions(),
            ]);


          const children =
            Array.isArray(
              childrenData
            )
              ? childrenData
              : [];


          const sessions =
            Array.isArray(
              sessionsData
            )
              ? sessionsData
              : [];


          const now =
            new Date();


          const currentYear =
            now.getFullYear();


          const currentMonth =
            now.getMonth();


          const monthlySessions =
            sessions.filter(
              (session) => {

                const date =
                  getSessionDate(
                    session
                  );


                if (!date) {
                  return false;
                }


                return (
                  date.getFullYear() ===
                    currentYear &&
                  date.getMonth() ===
                    currentMonth
                );

              }
            );


          const completedReports =
            sessions.filter(
              (session) =>
                session.status ===
                "Completed"
            );


          setChildrenCount(
            children.length
          );


          setSessionsThisMonth(
            monthlySessions.length
          );


          setReportsCount(
            completedReports.length
          );

        } catch (loadError) {

          console.error(
            "Failed to load dashboard stats:",
            loadError
          );


          setError(true);

        } finally {

          setLoading(false);

        }

      };


    loadStats();

  }, []);


  const getValue = (
    value: number | null
  ) => {

    if (loading) {
      return "...";
    }


    if (
      error ||
      value === null
    ) {
      return "—";
    }


    return String(
      value
    );

  };


  const stats = [

    {
      title:
        "Children",

      value:
        getValue(
          childrenCount
        ),

      subtitle:
        "Registered children",

      trend:
        loading || error
          ? "—"
          : "Live",

      icon:
        <Users
          size={24}
          color="#7B6EF6"
        />,
    },


    {
      title:
        "Sessions",

      value:
        getValue(
          sessionsThisMonth
        ),

      subtitle:
        "This month",

      trend:
        loading || error
          ? "—"
          : "Live",

      icon:
        <CalendarCheck
          size={24}
          color="#63B3ED"
        />,
    },


    {
      title:
        "Reports",

      value:
        getValue(
          reportsCount
        ),

      subtitle:
        "Generated reports",

      trend:
        loading || error
          ? "—"
          : "Live",

      icon:
        <FileText
          size={24}
          color="#F6AD55"
        />,
    },


    {
      title:
        "AI Insights",

      value:
        "—",

      subtitle:
        "AI integration pending",

      trend:
        "Pending",

      icon:
        <Bot
          size={24}
          color="#48BB78"
        />,
    },

  ];


  return (

    <View
      style={
        styles.container
      }
    >

      {stats.map(
        (item) => (

          <View
            key={
              item.title
            }
            style={
              styles.cardWrapper
            }
          >

            <StatCard
              {...item}
            />

          </View>

        )
      )}

    </View>

  );

};


const styles =
  StyleSheet.create({

    container: {

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        16,

      marginTop:
        32,

    },


    cardWrapper: {

      width:
        "47%",

    },

  });


export default StatsSection;