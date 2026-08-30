import Card from "../ui/Card";

import {
    Eye,
    Pencil,
    Trash2
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";


const getChildInitial = (
    child
) => {

    return String(
        child?.name ||
        child?.full_name ||
        "C"
    )
        .trim()
        .charAt(0)
        .toUpperCase();

};


const ChildrenTable = ({
    children = [],
    onDelete,
    onEdit
}) => {

    const navigate =
        useNavigate();


    return (

        <Card
            className="
                children-list-card
            "
        >

            <div
                className="
                    children-list-header
                "
            >

                <div>

                    <h2>
                        Children List
                    </h2>

                    <p>
                        All registered children
                    </p>

                </div>


                <div
                    className="
                        children-count
                    "
                >

                    {children.length}

                    {" "}

                    {
                        children.length === 1
                            ? "Child"
                            : "Children"
                    }

                </div>

            </div>


            {
                children.length === 0
                    ? (

                        <div
                            className="
                                children-empty-state
                            "
                        >

                            <div
                                className="
                                    empty-avatar
                                "
                            >
                                C
                            </div>


                            <h3>
                                No children found
                            </h3>


                            <p>
                                Try another search or add a child.
                            </p>

                        </div>

                    )
                    : (

                        <div
                            className="
                                children-table-shell
                            "
                        >

                            <div
                                className="
                                    children-table-scroll
                                "
                            >

                                <table
                                    className="
                                        children-table
                                    "
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                Child
                                            </th>

                                            <th>
                                                Age
                                            </th>

                                            <th>
                                                Score
                                            </th>

                                            <th>
                                                Last Assessment
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th
                                                className="
                                                    actions-heading
                                                "
                                            >
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            children.map(
                                                child => (

                                                    <tr
                                                        key={
                                                            child.id
                                                        }
                                                    >

                                                        <td>

                                                            <div
                                                                className="
                                                                    child-cell
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        child-avatar
                                                                    "
                                                                >

                                                                    {
                                                                        getChildInitial(
                                                                            child
                                                                        )
                                                                    }

                                                                </div>


                                                                <div
                                                                    className="
                                                                        child-copy
                                                                    "
                                                                >

                                                                    <h3>
                                                                        {child.name}
                                                                    </h3>


                                                                    <p>
                                                                        ID #{child.id}

                                                                        {
                                                                            child.gender
                                                                                ? `  •  ${child.gender}`
                                                                                : ""
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className="
                                                                    normal-cell
                                                                "
                                                            >

                                                                {
                                                                    child.age ??
                                                                    "—"
                                                                }

                                                                {
                                                                    child.age !==
                                                                    null &&
                                                                    child.age !==
                                                                    undefined
                                                                        ? " Years"
                                                                        : ""
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className="
                                                                    score-badge
                                                                "
                                                            >
                                                                {child.score}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className="
                                                                    assessment-date
                                                                "
                                                            >
                                                                {child.lastAssessment}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className="
                                                                    status-badge
                                                                "
                                                            >
                                                                {child.status}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div
                                                                className="
                                                                    child-actions
                                                                "
                                                            >

                                                                <button
                                                                    type="button"
                                                                    title="View child"
                                                                    aria-label={`View ${child.name}`}
                                                                    onClick={() => {

                                                                        navigate(
                                                                            `/children/${child.id}`
                                                                        );

                                                                    }}
                                                                    className="
                                                                        action-button
                                                                        view-button
                                                                    "
                                                                >

                                                                    <Eye
                                                                        size={16}
                                                                    />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    title="Edit child"
                                                                    aria-label={`Edit ${child.name}`}
                                                                    onClick={() => {

                                                                        onEdit(
                                                                            child
                                                                        );

                                                                    }}
                                                                    className="
                                                                        action-button
                                                                        edit-button
                                                                    "
                                                                >

                                                                    <Pencil
                                                                        size={15}
                                                                    />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    title="Delete child"
                                                                    aria-label={`Delete ${child.name}`}
                                                                    onClick={() => {

                                                                        onDelete(
                                                                            child.id
                                                                        );

                                                                    }}
                                                                    className="
                                                                        action-button
                                                                        delete-button
                                                                    "
                                                                >

                                                                    <Trash2
                                                                        size={15}
                                                                    />

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )
                                        }

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )
            }


            <style>
                {`

                .children-list-card {
                    overflow: hidden;
                }

                .children-list-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 17px;
                }

                .children-list-header h2 {
                    margin: 0;
                    color: #333554;
                    font-size: 16px;
                    line-height: 1.25;
                    font-weight: 700;
                }

                .children-list-header p {
                    margin: 4px 0 0;
                    color: #A0A3B4;
                    font-size: 11.5px;
                }

                .children-count {
                    min-height: 31px;
                    flex: 0 0 auto;
                    padding: 0 11px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7566EB;
                    background: #F3F0FF;
                    font-size: 10.5px;
                    font-weight: 700;
                }

                .children-table-shell {
                    width: 100%;
                    overflow: hidden;
                    border: 1px solid #EFEFF5;
                    border-radius: 16px;
                }

                .children-table-scroll {
                    width: 100%;
                    overflow-x: auto;
                }

                .children-table {
                    width: 100%;
                    min-width: 840px;
                    border-collapse: collapse;
                    table-layout: auto;
                }

                .children-table thead {
                    background: #FAFAFC;
                }

                .children-table th {
                    height: 45px;
                    padding: 0 14px;
                    border-bottom: 1px solid #EFEFF5;
                    color: #999CAD;
                    text-align: left;
                    white-space: nowrap;
                    font-size: 10.5px;
                    font-weight: 650;
                }

                .children-table th:first-child,
                .children-table td:first-child {
                    padding-left: 17px;
                }

                .children-table th:last-child,
                .children-table td:last-child {
                    padding-right: 17px;
                }

                .children-table td {
                    height: 74px;
                    padding: 10px 14px;
                    border-bottom: 1px solid #F1F1F6;
                    vertical-align: middle;
                }

                .children-table tbody tr:last-child td {
                    border-bottom: 0;
                }

                .children-table tbody tr {
                    background: #FFFFFF;
                    transition: background .16s ease;
                }

                .children-table tbody tr:hover {
                    background: #FCFBFF;
                }

                .child-cell {
                    min-width: 190px;
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .child-avatar {
                    width: 42px;
                    height: 42px;
                    flex: 0 0 42px;
                    border-radius: 13px;
                    display: grid;
                    place-items: center;
                    color: #7968E9;
                    background:
                        linear-gradient(
                            135deg,
                            #F0EDFF,
                            #FCEEFF
                        );
                    font-size: 14px;
                    font-weight: 800;
                }

                .child-copy {
                    min-width: 0;
                }

                .child-copy h3 {
                    max-width: 180px;
                    margin: 0;
                    overflow: hidden;
                    color: #373953;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 12.5px;
                    font-weight: 700;
                }

                .child-copy p {
                    margin: 3px 0 0;
                    color: #A0A3B4;
                    font-size: 9.5px;
                    white-space: nowrap;
                }

                .normal-cell,
                .assessment-date {
                    color: #707388;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .assessment-date {
                    color: #7E8194;
                }

                .score-badge {
                    min-width: 51px;
                    padding: 7px 10px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #7566EB;
                    background: #F3F0FF;
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                .status-badge {
                    padding: 5px 10px;
                    border-radius: 999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #3E9E7D;
                    background: #ECFAF4;
                    font-size: 9.5px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .actions-heading {
                    text-align: center !important;
                }

                .child-actions {
                    min-width: 128px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                }

                .action-button {
                    width: 35px;
                    height: 35px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition:
                        transform .16s ease,
                        background .16s ease,
                        border-color .16s ease;
                }

                .action-button:hover {
                    transform: translateY(-1px);
                }

                .view-button {
                    border: 1px solid #E5E0FF;
                    color: #7565E6;
                    background: #F7F4FF;
                }

                .view-button:hover {
                    background: #EEE9FF;
                }

                .edit-button {
                    border: 1px solid #DCEBF7;
                    color: #4D87B5;
                    background: #F2F8FD;
                }

                .edit-button:hover {
                    background: #E9F3FB;
                }

                .delete-button {
                    border: 1px solid #F6DDE2;
                    color: #C95166;
                    background: #FFF4F6;
                }

                .delete-button:hover {
                    background: #FFECEF;
                }

                .children-empty-state {
                    min-height: 260px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .empty-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 15px;
                    display: grid;
                    place-items: center;
                    color: #7968E9;
                    background:
                        linear-gradient(
                            135deg,
                            #F0EDFF,
                            #FCEEFF
                        );
                    font-size: 15px;
                    font-weight: 800;
                }

                .children-empty-state h3 {
                    margin: 12px 0 0;
                    color: #55586C;
                    font-size: 13px;
                }

                .children-empty-state p {
                    margin: 4px 0 0;
                    color: #A0A3B4;
                    font-size: 10.5px;
                }

                `}
            </style>

        </Card>

    );

};


export default ChildrenTable;