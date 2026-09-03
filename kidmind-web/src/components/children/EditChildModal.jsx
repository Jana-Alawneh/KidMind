import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Pencil,
    RefreshCw,
    UserRound,
    X
} from "lucide-react";

import {
    getChildById,
    updateChild
} from "../../api/childrenApi";

import api from "../../services/api";


const EditChildModal = ({
    child,
    close,
    onSuccess
}) => {

    const isParent =
        useMemo(
            () => {

                try {

                    const user =
                        JSON.parse(
                            sessionStorage.getItem(
                                "kidmind_user"
                            ) || "{}"
                        );


                    return (
                        user.role ===
                        "parent"
                    );

                } catch {

                    return false;

                }

            },
            []
        );


    const [
        formData,
        setFormData
    ] = useState({
        full_name: "",
        age: "",
        gender: "",
        parent_name: "",
        region: "",
        notes: "",
    });


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        linkedParent,
        setLinkedParent
    ] = useState(null);


    useEffect(
        () => {

            let active =
                true;


            const loadFullChild =
                async () => {

                    try {

                        setLoading(
                            true
                        );

                        setError(
                            ""
                        );


                        /*
                         * Always fetch the complete
                         * child record instead of
                         * depending on the shortened
                         * table/list object.
                         */
                        const fullChild =
                            await getChildById(
                                child.id
                            );


                        if (!active) {
                            return;
                        }


                        const assignments =
                            Array.isArray(
                                fullChild?.assignments
                            )
                                ? fullChild.assignments
                                : [];


                        const parentAssignment =
                            assignments.find(
                                assignment =>
                                    assignment.link_type ===
                                        "parent" ||
                                    assignment.role ===
                                        "parent"
                            ) ||
                            null;


                        setLinkedParent(
                            parentAssignment
                        );


                        setFormData({
                            full_name:
                                fullChild?.full_name ||
                                child.full_name ||
                                child.name ||
                                "",

                            age:
                                fullChild?.age ??
                                child.age ??
                                "",

                            gender:
                                fullChild?.gender ||
                                child.gender ||
                                "",

                            /*
                             * Database parent_name
                             * first.
                             *
                             * If that value is empty,
                             * use the actual linked
                             * parent assignment.
                             */
                            parent_name:
                                fullChild?.parent_name ||
                                parentAssignment
                                    ?.user_name ||
                                child.parent_name ||
                                "",

                            region:
                                fullChild?.region ||
                                child.region ||
                                "",

                            notes:
                                fullChild?.notes ??
                                child.notes ??
                                "",
                        });

                    } catch (
                        requestError
                    ) {

                        console.error(
                            "Failed to load complete child information:",
                            requestError
                        );


                        /*
                         * Don't leave the whole
                         * modal unusable if the
                         * additional request fails.
                         * Use the data that came
                         * from the child list.
                         */
                        if (active) {

                            setFormData({
                                full_name:
                                    child.full_name ||
                                    child.name ||
                                    "",

                                age:
                                    child.age ??
                                    "",

                                gender:
                                    child.gender ||
                                    "",

                                parent_name:
                                    child.parent_name ||
                                    "",

                                region:
                                    child.region ||
                                    "",

                                notes:
                                    child.notes ||
                                    "",
                            });


                            setError(
                                requestError
                                    ?.response
                                    ?.data
                                    ?.message ||
                                "Some child information could not be refreshed."
                            );

                        }

                    } finally {

                        if (active) {

                            setLoading(
                                false
                            );

                        }

                    }

                };


            loadFullChild();


            return () => {

                active =
                    false;

            };

        },
        [
            child
        ]
    );


    const handleChange =
        event => {

            const {
                name,
                value
            } =
                event.target;


            setFormData(
                previous => ({
                    ...previous,
                    [name]:
                        value,
                })
            );

        };


    const handleSubmit =
        async event => {

            event.preventDefault();


            const fullName =
                formData.full_name
                    .trim();


            const age =
                Number(
                    formData.age
                );


            const gender =
                formData.gender
                    .trim();


            const region =
                formData.region
                    .trim();


            if (
                !fullName ||
                !Number.isInteger(
                    age
                ) ||
                age <= 0 ||
                !gender ||
                !region
            ) {

                setError(
                    "Full name, age, gender and region are required."
                );

                return;

            }


            try {

                setSaving(
                    true
                );

                setError(
                    ""
                );


                if (isParent) {

                    await api.put(
                        `/children/parent/${child.id}`,
                        {
                            full_name:
                                fullName,

                            age,

                            gender,

                            region,
                        }
                    );

                } else {

                    await updateChild(
                        child.id,
                        {
                            full_name:
                                fullName,

                            age,

                            gender,

                            parent_name:
                                formData
                                    .parent_name
                                    .trim(),

                            region,

                            notes:
                                formData
                                    .notes
                                    .trim(),
                        }
                    );

                }


                await onSuccess?.();

                close();

            } catch (
                requestError
            ) {

                console.error(
                    "Failed to update child:",
                    requestError
                );


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError
                        ?.message ||
                    "Failed to update child."
                );

            } finally {

                setSaving(
                    false
                );

            }

        };


    return (

        <div
            className="
                fixed
                inset-0
                z-[1000]
                flex
                items-center
                justify-center
                bg-[#252340]/40
                backdrop-blur-[5px]
                p-5
            "
            onMouseDown={
                event => {

                    if (
                        event.target ===
                        event.currentTarget &&
                        !saving
                    ) {

                        close();

                    }

                }
            }
        >

            <form
                onSubmit={
                    handleSubmit
                }
                className="
                    w-full
                    max-w-[720px]
                    max-h-[90vh]
                    overflow-y-auto
                    rounded-[23px]
                    bg-white
                    p-6
                    shadow-[0_25px_80px_rgba(38,35,75,.20)]
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-5
                        border-b
                        border-[#EFEFF5]
                        pb-[17px]
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-[46px]
                                w-[46px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[14px]
                                bg-[#EDF6FF]
                                text-[#5595DD]
                            "
                        >

                            <Pencil
                                size={21}
                            />

                        </div>


                        <div>

                            <span
                                className="
                                    text-[9.5px]
                                    font-extrabold
                                    tracking-[.09em]
                                    text-[#8070EA]
                                "
                            >
                                EDIT CHILD
                            </span>


                            <h2
                                className="
                                    mt-1
                                    text-[21px]
                                    font-bold
                                    text-[#353754]
                                "
                            >
                                {
                                    formData.full_name ||
                                    child.full_name ||
                                    "Child"
                                }
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    text-[#A0A2B2]
                                "
                            >
                                {
                                    isParent
                                        ? "Update basic child information"
                                        : "Update child information"
                                }
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={
                            close
                        }
                        disabled={
                            saving
                        }
                        className="
                            grid
                            h-[37px]
                            w-[37px]
                            shrink-0
                            place-items-center
                            rounded-[11px]
                            border-0
                            bg-[#F5F5F9]
                            text-[#85889B]
                            transition
                            hover:bg-[#EEEEF4]
                            disabled:opacity-50
                        "
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                {
                    loading
                        ? (

                            <div
                                className="
                                    flex
                                    min-h-[290px]
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-3
                                    text-[#8E91A5]
                                "
                            >

                                <RefreshCw
                                    size={27}
                                    className="animate-spin text-[#7969EA]"
                                />

                                <span
                                    className="
                                        text-[11px]
                                    "
                                >
                                    Loading child information...
                                </span>

                            </div>

                        )
                        : (

                            <>

                                {
                                    error && (

                                        <div
                                            className="
                                                mt-4
                                                rounded-[13px]
                                                border
                                                border-[#F5D5DD]
                                                bg-[#FFF1F4]
                                                px-4
                                                py-3
                                                text-[11px]
                                                text-[#B8445D]
                                            "
                                        >
                                            {error}
                                        </div>

                                    )
                                }


                                {/* CHILD FIELDS */}

                                <div
                                    className="
                                        mt-5
                                        grid
                                        grid-cols-1
                                        gap-[13px]
                                        md:grid-cols-2
                                    "
                                >

                                    <label
                                        className="
                                            flex
                                            flex-col
                                            gap-[7px]
                                            md:col-span-2
                                        "
                                    >

                                        <span
                                            className="
                                                text-[10.5px]
                                                font-bold
                                                text-[#6B6E83]
                                            "
                                        >
                                            Full Name
                                        </span>


                                        <input
                                            name="full_name"
                                            type="text"
                                            value={
                                                formData.full_name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Child full name"
                                            required
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[43px]
                                                w-full
                                                rounded-[12px]
                                                border
                                                border-[#E2E2EB]
                                                bg-[#FBFBFD]
                                                px-3
                                                text-[11.5px]
                                                text-[#45475F]
                                                outline-none
                                                focus:border-[#A99FF4]
                                                focus:bg-white
                                                focus:ring-4
                                                focus:ring-[#7B6EF6]/5
                                            "
                                        />

                                    </label>


                                    <label
                                        className="
                                            flex
                                            flex-col
                                            gap-[7px]
                                        "
                                    >

                                        <span
                                            className="
                                                text-[10.5px]
                                                font-bold
                                                text-[#6B6E83]
                                            "
                                        >
                                            Age
                                        </span>


                                        <input
                                            name="age"
                                            type="number"
                                            min="1"
                                            value={
                                                formData.age
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[43px]
                                                w-full
                                                rounded-[12px]
                                                border
                                                border-[#E2E2EB]
                                                bg-[#FBFBFD]
                                                px-3
                                                text-[11.5px]
                                                text-[#45475F]
                                                outline-none
                                                focus:border-[#A99FF4]
                                                focus:bg-white
                                            "
                                        />

                                    </label>


                                    <label
                                        className="
                                            flex
                                            flex-col
                                            gap-[7px]
                                        "
                                    >

                                        <span
                                            className="
                                                text-[10.5px]
                                                font-bold
                                                text-[#6B6E83]
                                            "
                                        >
                                            Gender
                                        </span>


                                        <select
                                            name="gender"
                                            value={
                                                formData.gender
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[43px]
                                                w-full
                                                rounded-[12px]
                                                border
                                                border-[#E2E2EB]
                                                bg-[#FBFBFD]
                                                px-3
                                                text-[11.5px]
                                                text-[#45475F]
                                                outline-none
                                                focus:border-[#A99FF4]
                                                focus:bg-white
                                            "
                                        >

                                            <option value="">
                                                Select gender
                                            </option>

                                            <option value="Female">
                                                Female
                                            </option>

                                            <option value="Male">
                                                Male
                                            </option>

                                        </select>

                                    </label>


                                    <label
                                        className="
                                            flex
                                            flex-col
                                            gap-[7px]
                                        "
                                    >

                                        <span
                                            className="
                                                text-[10.5px]
                                                font-bold
                                                text-[#6B6E83]
                                            "
                                        >
                                            Region
                                        </span>


                                        <input
                                            name="region"
                                            type="text"
                                            value={
                                                formData.region
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Region"
                                            required
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[43px]
                                                w-full
                                                rounded-[12px]
                                                border
                                                border-[#E2E2EB]
                                                bg-[#FBFBFD]
                                                px-3
                                                text-[11.5px]
                                                text-[#45475F]
                                                outline-none
                                                focus:border-[#A99FF4]
                                                focus:bg-white
                                            "
                                        />

                                    </label>


                                    {
                                        !isParent && (

                                            <label
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-[7px]
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-[10.5px]
                                                        font-bold
                                                        text-[#6B6E83]
                                                    "
                                                >
                                                    Parent Name
                                                </span>


                                                <input
                                                    name="parent_name"
                                                    type="text"
                                                    value={
                                                        formData.parent_name
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Parent name"
                                                    disabled={
                                                        saving
                                                    }
                                                    className="
                                                        h-[43px]
                                                        w-full
                                                        rounded-[12px]
                                                        border
                                                        border-[#E2E2EB]
                                                        bg-[#FBFBFD]
                                                        px-3
                                                        text-[11.5px]
                                                        text-[#45475F]
                                                        outline-none
                                                        focus:border-[#A99FF4]
                                                        focus:bg-white
                                                    "
                                                />

                                            </label>

                                        )
                                    }

                                </div>


                                {
                                    !isParent && (

                                        <label
                                            className="
                                                mt-[13px]
                                                flex
                                                flex-col
                                                gap-[7px]
                                            "
                                        >

                                            <span
                                                className="
                                                    text-[10.5px]
                                                    font-bold
                                                    text-[#6B6E83]
                                                "
                                            >
                                                Notes
                                            </span>


                                            <textarea
                                                name="notes"
                                                value={
                                                    formData.notes
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Therapist or admin notes"
                                                rows={4}
                                                disabled={
                                                    saving
                                                }
                                                className="
                                                    w-full
                                                    resize-y
                                                    rounded-[12px]
                                                    border
                                                    border-[#E2E2EB]
                                                    bg-[#FBFBFD]
                                                    px-3
                                                    py-3
                                                    text-[11.5px]
                                                    text-[#45475F]
                                                    outline-none
                                                    focus:border-[#A99FF4]
                                                    focus:bg-white
                                                "
                                            />

                                        </label>

                                    )
                                }


                                {/* LINKED PARENT INFO */}

                                {
                                    !isParent &&
                                    linkedParent && (

                                        <div
                                            className="
                                                mt-4
                                                flex
                                                items-center
                                                gap-3
                                                rounded-[14px]
                                                border
                                                border-[#F0DFF0]
                                                bg-[#FFF7FC]
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div
                                                className="
                                                    grid
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    place-items-center
                                                    rounded-[11px]
                                                    bg-white
                                                    text-[#BF599F]
                                                "
                                            >

                                                <UserRound
                                                    size={17}
                                                />

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <span
                                                    className="
                                                        block
                                                        text-[8.5px]
                                                        font-bold
                                                        uppercase
                                                        tracking-[.05em]
                                                        text-[#B27AA1]
                                                    "
                                                >
                                                    Linked Parent Account
                                                </span>


                                                <strong
                                                    className="
                                                        mt-1
                                                        block
                                                        truncate
                                                        text-[10.5px]
                                                        text-[#55576D]
                                                    "
                                                >
                                                    {
                                                        linkedParent.user_name
                                                    }
                                                </strong>


                                                {
                                                    linkedParent.user_email && (

                                                        <span
                                                            className="
                                                                mt-[2px]
                                                                block
                                                                truncate
                                                                text-[9px]
                                                                text-[#9C9EAE]
                                                            "
                                                        >
                                                            {
                                                                linkedParent.user_email
                                                            }
                                                        </span>

                                                    )
                                                }

                                            </div>

                                        </div>

                                    )
                                }


                                {/* BUTTONS */}

                                <div
                                    className="
                                        mt-5
                                        flex
                                        justify-end
                                        gap-[9px]
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            close
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="
                                            h-[41px]
                                            min-w-[110px]
                                            rounded-[12px]
                                            border
                                            border-[#E4E4EC]
                                            bg-white
                                            px-4
                                            text-[10.5px]
                                            font-bold
                                            text-[#777A8D]
                                            hover:bg-[#F8F8FB]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            saving
                                        }
                                        className="
                                            flex
                                            h-[41px]
                                            min-w-[130px]
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-[12px]
                                            border-0
                                            bg-[#7969EA]
                                            px-5
                                            text-[10.5px]
                                            font-bold
                                            text-white
                                            shadow-[0_8px_18px_rgba(121,105,234,.18)]
                                            hover:bg-[#6E5EE2]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        {
                                            saving && (

                                                <RefreshCw
                                                    size={14}
                                                    className="animate-spin"
                                                />

                                            )
                                        }


                                        {
                                            saving
                                                ? "Saving..."
                                                : "Save Changes"
                                        }

                                    </button>

                                </div>

                            </>

                        )
                }

            </form>

        </div>

    );

};


export default EditChildModal;