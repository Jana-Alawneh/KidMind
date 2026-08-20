import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildrenHeader from "../components/children/ChildrenHeader";
import ChildrenTable from "../components/children/ChildrenTable";
import AddChildModal from "../components/children/AddChildModal";
import EditChildModal from "../components/children/EditChildModal";

import {
    useEffect,
    useState
} from "react";

import {
    deleteChild,
    getChildren
} from "../api/childrenApi";


const Children = () => {

    const [
        openModal,
        setOpenModal
    ] = useState(false);

    const [
        editingChild,
        setEditingChild
    ] = useState(null);

    const [
        children,
        setChildren
    ] = useState([]);

    const [
        searchQuery,
        setSearchQuery
    ] = useState("");


    useEffect(() => {

        loadChildren();

    }, []);


    const loadChildren = async () => {

        try {

            const data =
                await getChildren();


            const formattedChildren =
                data.map((child) => ({

                    ...child,

                    name:
                        child.full_name ||
                        child.name ||
                        "Unnamed Child",

                    image:
                        child.image ||
                        `https://i.pravatar.cc/100?u=kidmind-${child.id}`,

                    score:
                        child.score !== null &&
                        child.score !== undefined
                            ? String(
                                child.score
                            ).includes("%")
                                ? child.score
                                : `${child.score}%`
                            : "—",

                    lastAssessment:
                        child.last_assessment ||
                        child.lastAssessment ||
                        "Not assessed",

                    status:
                        child.status ||
                        "Active",

                    region:
                        child.region ||
                        "",

                }));


            setChildren(
                formattedChildren
            );

        } catch (error) {

            console.error(
                "Failed to load children:",
                error
            );

        }

    };


    const handleEdit = (
        child
    ) => {

        setEditingChild(
            child
        );

    };


    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this child?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteChild(
                id
            );

            await loadChildren();

        } catch (error) {

            console.error(
                "Failed to delete child:",
                error
            );


            window.alert(
                "Failed to delete the child. Please try again."
            );

        }

    };


    const normalizedSearch =
        searchQuery
            .trim()
            .toLowerCase();


    const idSearch =
        normalizedSearch.startsWith(
            "#"
        )
            ? normalizedSearch.slice(1)
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
                            child.full_name ||
                            child.name ||
                            ""
                        ).toLowerCase();

                    const parentName =
                        String(
                            child.parent_name ||
                            ""
                        ).toLowerCase();

                    const region =
                        String(
                            child.region ||
                            ""
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

        <div
            className="
            flex
            bg-[#F7F8FC]
            min-h-screen
            "
        >

            <Sidebar />


            <main
                className="
                flex-1
                p-10
                overflow-y-auto
                "
            >

                <Navbar />


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


                <div
                    className="
                    mt-8
                    "
                >

                    <ChildrenTable
                        children={
                            filteredChildren
                        }
                        onDelete={
                            handleDelete
                        }
                        onEdit={
                            handleEdit
                        }
                    />

                </div>


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

            </main>

        </div>

    );

};


export default Children;