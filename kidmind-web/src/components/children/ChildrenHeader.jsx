import {
    Plus,
    Search
} from "lucide-react";


const ChildrenHeader = ({
    onAdd,
    searchQuery = "",
    onSearchChange = () => {}
}) => {


    return (

        <section
            className="
                children-page-header
            "
        >

            <div
                className="
                    children-heading-row
                "
            >

                <div
                    className="
                        children-heading-copy
                    "
                >

                    <span
                        className="
                            children-eyebrow
                        "
                    >
                        CHILD MANAGEMENT
                    </span>


                    <h1>
                        Children
                    </h1>


                    <p>
                        Manage children&apos;s profiles,
                        assessments and progress.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        onAdd
                    }
                    className="
                        add-child-button
                    "
                >

                    <Plus
                        size={17}
                    />

                    Add Child

                </button>

            </div>


            <div
                className="
                    children-search-panel
                "
            >

                <div
                    className="
                        children-search
                    "
                >

                    <Search
                        size={17}
                    />


                    <input
                        type="text"
                        value={
                            searchQuery
                        }
                        onChange={
                            event => {

                                onSearchChange(
                                    event.target.value
                                );

                            }
                        }
                        placeholder="Search by ID, child, parent or region..."
                    />

                </div>

            </div>


            <style>
                {`

                .children-page-header {
                    width: 100%;
                }

                .children-heading-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                }

                .children-heading-copy {
                    min-width: 0;
                }

                .children-eyebrow {
                    color: #8172EA;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: .1em;
                }

                .children-heading-copy h1 {
                    margin: 6px 0 5px;
                    color: #303253;
                    font-size: 28px;
                    line-height: 1.2;
                    font-weight: 750;
                }

                .children-heading-copy p {
                    margin: 0;
                    color: #9699AC;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .add-child-button {
                    height: 40px;
                    flex: 0 0 auto;
                    padding: 0 15px;
                    border: 0;
                    border-radius: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #FFFFFF;
                    background: #7969EA;
                    box-shadow:
                        0 5px 14px
                        rgba(121, 105, 234, .16);
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 11px;
                    font-weight: 700;
                    transition:
                        background .18s ease,
                        transform .18s ease,
                        box-shadow .18s ease;
                }

                .add-child-button:hover {
                    background: #6D5DE1;
                    box-shadow:
                        0 7px 17px
                        rgba(121, 105, 234, .22);
                    transform: translateY(-1px);
                }

                .children-search-panel {
                    margin-top: 22px;
                    padding: 14px;
                    border: 1px solid #ECECF4;
                    border-radius: 18px;
                    background: #FFFFFF;
                    box-shadow:
                        0 5px 18px
                        rgba(61, 62, 94, .025);
                }

                .children-search {
                    width: 100%;
                    height: 43px;
                    padding: 0 14px;
                    border: 1px solid #E7E7F0;
                    border-radius: 13px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #A0A3B6;
                    background: #FBFBFD;
                    transition:
                        border-color .18s ease,
                        box-shadow .18s ease,
                        background .18s ease;
                }

                .children-search:focus-within {
                    border-color: #CFC8FA;
                    background: #FFFFFF;
                    box-shadow:
                        0 0 0 3px
                        rgba(123, 110, 246, .07);
                }

                .children-search input {
                    width: 100%;
                    height: 100%;
                    min-width: 0;
                    border: 0;
                    outline: 0;
                    color: #343654;
                    background: transparent;
                    font-family: inherit;
                    font-size: 12.5px;
                }

                .children-search input::placeholder {
                    color: #A9ACBC;
                }

                @media (max-width: 700px) {

                    .children-heading-row {
                        flex-direction: column;
                    }

                    .add-child-button {
                        width: 100%;
                    }

                }

                `}
            </style>

        </section>

    );

};


export default ChildrenHeader;