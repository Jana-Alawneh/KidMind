import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildrenHeader from "../components/children/ChildrenHeader";
import ChildrenTable from "../components/children/ChildrenTable";
import AddChildModal from "../components/children/AddChildModal";

import { useEffect, useState } from "react";

import { getChildren } from "../api/childrenApi";

const Children = () => {

    const [openModal, setOpenModal] = useState(false);

    const [children, setChildren] = useState([]);

    useEffect(() => {

        loadChildren();

    }, []);

    const loadChildren = async () => {

        try {

            const data = await getChildren();

            setChildren(data);

        } catch (error) {

            console.error("Failed to load children:", error);

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