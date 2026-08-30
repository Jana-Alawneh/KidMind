import {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Activity,
  CalendarCheck,
  FileText,
  Users,
} from "lucide-react-native";

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
  ] =
    useState<number | null>(
      null
    );


  const [
    sessionsThisMonth,
    setSessionsThisMonth,
  ] =
    useState<number | null>(
      null
    );


  const [
    reportsCount,
    setReportsCount,
  ] =
    useState<number | null>(
      null
    );


  const [
    totalSessionsCount,
    setTotalSessionsCount,
  ] =
    useState<number | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState(false);


  useEffect(
    () => {

      const loadStats =
        async () => {

          try {

            setLoading(
              true
            );

            setError(
              false
            );


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
                session => {

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
                session =>
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


            setTotalSessionsCount(
              sessions.length
            );

          } catch (
            loadError
          ) {

            console.error(
              "Failed to load dashboard stats:",
              loadError
            );


            setError(
              true
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      loadStats();

    },
    []
  );


  const getValue = (
    value: number | null
  ) => {

    if (
      loading ||
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
        "Assigned children",

      icon:
        Users,

      color:
        "#7566EB",

      background:
        "#F0EDFF",
    },

    {
      title:
        "Sessions",

      value:
        getValue(
          sessionsThisMonth
        ),

      subtitle:
        "Sessions this month",

      icon:
        CalendarCheck,

      color:
        "#5595DD",

      background:
        "#EDF6FF",
    },

    {
      title:
        "Reports",

      value:
        getValue(
          reportsCount
        ),

      subtitle:
        "Completed assessments",

      icon:
        FileText,

      color:
        "#D867B4",

      background:
        "#FFF0FA",
    },

    {
      title:
        "All Sessions",

      value:
        getValue(
          totalSessionsCount
        ),

      subtitle:
        "Total session records",

      icon:
        Activity,

      color:
        "#48A784",

      background:
        "#ECFAF4",
    },
  ];


  return (

    <View
      style={
        styles.container
      }
    >

      {
        stats.map(
          item => {

            const Icon =
              item.icon;


            return (

              <View
                key={
                  item.title
                }
                style={
                  styles.card
                }
              >

                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        item.background,
                    },
                  ]}
                >

                  <Icon
                    size={21}
                    color={
                      item.color
                    }
                  />

                </View>


                <Text
                  style={
                    styles.label
                  }
                >
                  {item.title}
                </Text>


                <Text
                  style={
                    styles.value
                  }
                >
                  {item.value}
                </Text>


                <Text
                  style={
                    styles.subtitle
                  }
                  numberOfLines={
                    1
                  }
                >
                  {item.subtitle}
                </Text>

              </View>

            );

          }
        )
      }

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

      justifyContent:
        "space-between",

      gap:
        12,

      marginTop:
        18,

    },


    card: {

      width:
        "48%",

      minHeight:
        132,

      padding:
        15,

      borderRadius:
        19,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.04,

      shadowRadius:
        12,

      elevation:
        2,

    },


    iconBox: {

      width:
        41,

      height:
        41,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        12,

    },


    label: {

      color:
        "#85899D",

      fontSize:
        10.5,

      fontWeight:
        "500",

    },


    value: {

      marginTop:
        2,

      color:
        "#2E3054",

      fontSize:
        23,

      lineHeight:
        29,

      fontWeight:
        "800",

    },


    subtitle: {

      marginTop:
        1,

      color:
        "#A0A3B3",

      fontSize:
        9.5,

    },

  });


export default StatsSection;