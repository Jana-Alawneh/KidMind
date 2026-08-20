import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  deleteChild,
  getChildren,
} from "@/api/childrenApi";

import AddChildModal from "@/components/children/AddChildModal";
import ChildrenHeader from "@/components/children/ChildrenHeader";
import ChildrenTable from "@/components/children/ChildrenTable";
import EditChildModal from "@/components/children/EditChildModal";

import type {
  Child,
} from "@/api/childrenApi";


export default function Children() {

  const [
    openModal,
    setOpenModal,
  ] = useState(false);

  const [
    editingChild,
    setEditingChild,
  ] = useState<Child | null>(
    null
  );

  const [
    children,
    setChildren,
  ] = useState<Child[]>([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const loadChildren =
    useCallback(
      async () => {

        try {

          const data =
            await getChildren();

          setChildren(
            data
          );

        } catch (error) {

          console.error(
            "Failed to load children:",
            error
          );

          Alert.alert(
            "Connection Error",
            error instanceof Error
              ? error.message
              : "Failed to load children"
          );

        } finally {

          setLoading(false);
          setRefreshing(false);

        }

      },
      []
    );


  useEffect(() => {

    loadChildren();

  }, [
    loadChildren,
  ]);


  const handleRefresh =
    () => {

      setRefreshing(true);

      loadChildren();

    };


  const handleDelete = (
    child: Child
  ) => {

    Alert.alert(
      "Delete Child",
      `Are you sure you want to delete ${child.full_name}?`,
      [
        {
          text:
            "Cancel",
          style:
            "cancel",
        },
        {
          text:
            "Delete",
          style:
            "destructive",

          onPress:
            async () => {

              try {

                await deleteChild(
                  child.id
                );

                await loadChildren();


                Alert.alert(
                  "Success",
                  "Child deleted successfully"
                );

              } catch (error) {

                console.error(
                  "Failed to delete child:",
                  error
                );

                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to delete child"
                );

              }

            },
        },
      ]
    );

  };


  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();


  const idSearch =
    normalizedSearch.startsWith(
      "#"
    )
      ? normalizedSearch.slice(
          1
        )
      : normalizedSearch;


  const filteredChildren =
    normalizedSearch
      ? children.filter(
          (child) => {

            const childId =
              String(
                child.id ?? ""
              ).toLowerCase();

            const childName =
              String(
                child.full_name ?? ""
              ).toLowerCase();

            const parentName =
              String(
                child.parent_name ?? ""
              ).toLowerCase();

            const region =
              String(
                child.region ?? ""
              ).toLowerCase();


            return (
              childId.includes(
                idSearch
              ) ||
              childName.includes(
                normalizedSearch
              ) ||
              parentName.includes(
                normalizedSearch
              ) ||
              region.includes(
                normalizedSearch
              )
            );

          }
        )
      : children;


  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        refreshControl={

          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              "#7B6EF6"
            ]}
          />

        }
      >

        <ChildrenHeader
          onAdd={() => {
            setOpenModal(
              true
            );
          }}
          searchQuery={
            searchQuery
          }
          onSearchChange={
            setSearchQuery
          }
        />


        <View
          style={
            styles.tableContainer
          }
        >

          {loading ? (

            <View
              style={
                styles.loadingBox
              }
            >

              <ActivityIndicator
                size="large"
                color="#7B6EF6"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading children...
              </Text>

            </View>

          ) : (

            <ChildrenTable
              children={
                filteredChildren
              }
              onEdit={(
                child
              ) => {
                setEditingChild(
                  child
                );
              }}
              onDelete={
                handleDelete
              }
            />

          )}

        </View>


        {openModal && (

          <AddChildModal
            close={() => {
              setOpenModal(
                false
              );
            }}
            onSuccess={
              loadChildren
            }
          />

        )}


        {editingChild && (

          <EditChildModal
            child={
              editingChild
            }
            close={() => {
              setEditingChild(
                null
              );
            }}
            onSuccess={
              loadChildren
            }
          />

        )}

      </ScrollView>

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
    },

    content: {
      padding: 20,
      paddingTop: 100,
      paddingBottom: 50,
    },

    tableContainer: {
      marginTop: 30,
    },

    loadingBox: {
      alignItems:
        "center",
      paddingVertical: 50,
      gap: 12,
    },

    loadingText: {
      color:
        "#64748B",
    },

  });