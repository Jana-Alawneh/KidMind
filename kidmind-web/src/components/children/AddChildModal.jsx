import {
    useMemo,
    useState
} from "react";

import {
    UserPlus,
    X
} from "lucide-react";

import {
    addChild
} from "../../api/childrenApi";


const AddChildModal = ({
    close,
    onSuccess
}) => {

    const currentUser =
        useMemo(
            () => {

                try {

                    return JSON.parse(
                        sessionStorage.getItem(
                            "kidmind_user"
                        ) || "{}"
                    );

                } catch {

                    return {};

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
        saving,
        setSaving
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


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


                await addChild({
                    full_name:
                        fullName,

                    age,

                    gender,

                    parent_name:
                        formData.parent_name
                            .trim(),

                    region,

                    notes:
                        formData.notes
                            .trim(),

                    /*
                     * A child created by
                     * a therapist should
                     * automatically stay
                     * linked to that
                     * therapist.
                     */
                    therapist_id:
                        currentUser.role ===
                            "therapist" &&
                        currentUser.id
                            ? Number(
                                currentUser.id
                            )
                            : null,
                });


                await onSuccess?.();

                close();

            } catch (requestError) {

                console.error(
                    "Failed to add child:",
                    requestError
                );


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError
                        ?.message ||
                    "Failed to add child."
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
                                bg-[#F0EDFF]
                                text-[#7969EA]
                            "
                        >

                            <UserPlus
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
                                ADD CHILD
                            </span>


                            <h2
                                className="
                                    mt-1
                                    text-[21px]
                                    font-bold
                                    text-[#353754]
                                "
                            >
                                New Child
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    text-[#A0A2B2]
                                "
                            >
                                Create a new child profile
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


                {/* ERROR */}

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


                {/* MAIN FORM */}

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
                                transition
                                focus:border-[#A99FF4]
                                focus:bg-white
                                focus:ring-4
                                focus:ring-[#7B6EF6]/5
                                disabled:opacity-60
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
                            placeholder="Age"
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

                </div>


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
                        placeholder="Therapist notes"
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


                {/* THERAPIST LINK */}

                {
                    currentUser.role ===
                    "therapist" && (

                        <div
                            className="
                                mt-4
                                rounded-[14px]
                                border
                                border-[#E7E3FF]
                                bg-[#F8F6FF]
                                px-4
                                py-3
                            "
                        >

                            <span
                                className="
                                    block
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[.06em]
                                    text-[#897CE7]
                                "
                            >
                                Therapist Assignment
                            </span>


                            <strong
                                className="
                                    mt-1
                                    block
                                    text-[11px]
                                    text-[#52546B]
                                "
                            >
                                {
                                    currentUser.full_name ||
                                    "Current Therapist"
                                }
                            </strong>


                            <p
                                className="
                                    mt-1
                                    text-[9.5px]
                                    leading-5
                                    text-[#989AAD]
                                "
                            >
                                This child will automatically be linked to your therapist account.
                            </p>

                        </div>

                    )
                }


                {/* ACTIONS */}

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
                            transition
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
                            h-[41px]
                            min-w-[120px]
                            rounded-[12px]
                            border-0
                            bg-[#7969EA]
                            px-5
                            text-[10.5px]
                            font-bold
                            text-white
                            shadow-[0_8px_18px_rgba(121,105,234,.18)]
                            transition
                            hover:bg-[#6E5EE2]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {
                            saving
                                ? "Saving..."
                                : "Add Child"
                        }
                    </button>

                </div>

            </form>

        </div>

    );

};


export default AddChildModal;