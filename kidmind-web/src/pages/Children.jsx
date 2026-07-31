import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildrenHeader from "../components/children/ChildrenHeader";
import ChildrenTable from "../components/children/ChildrenTable";
import AddChildModal from "../components/children/AddChildModal";

import { useEffect, useState } from "react";

import {
    deleteChild,
    getChildren
} from "../api/childrenApi";


const Children = () => {

    const [openModal, setOpenModal] = useState(false);

    const [children, setChildren] = useState([]);


    useEffect(() => {

        loadChildren();

    }, []);


    const loadChildren = async () => {

    try {

        const data = await getChildren();

        const formattedChildren = data.map((child) => ({

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
                    ? String(child.score).includes("%")
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

        }));

        setChildren(formattedChildren);

    } catch (error) {

        console.error(
            "Failed to load children:",
            error
        );

    }

};


    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this child?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteChild(id);

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


    return (

        <div className="flex bg-[#F7F8FC] min-h-screen">

            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">

                <Navbar />

                <ChildrenHeader
                    onAdd={() => setOpenModal(true)}
                />

                <div className="mt-8">

                    <ChildrenTable
                        children={children}
                        onDelete={handleDelete}
                    />

                </div>

                {openModal && (

                    <AddChildModal
                        close={() => setOpenModal(false)}
                        onSuccess={loadChildren}
                    />

                )}

            </main>

        </div>

    );

};


export default Children;