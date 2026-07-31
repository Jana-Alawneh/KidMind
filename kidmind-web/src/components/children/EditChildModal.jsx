import { useState } from "react";

import {
    X,
    Pencil
} from "lucide-react";

import { updateChild } from "../../api/childrenApi";


const EditChildModal = ({
    child,
    close,
    onSuccess
}) => {

    const [formData, setFormData] = useState({
        full_name:
            child.full_name ||
            child.name ||
            "",
        age: child.age || "",
        gender: child.gender || "Female",
        parent_name: child.parent_name || "",
        notes: child.notes || "",
    });

    const [saving, setSaving] = useState(false);


    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);

            await updateChild(
                child.id,
                {
                    ...formData,
                    age: Number(formData.age),
                }
            );

            await onSuccess();

            close();

        } catch (error) {

            console.error(
                "Failed to update child:",
                error
            );

            alert(
                error.message ||
                "Failed to update child"
            );

        } finally {

            setSaving(false);

        }

    };


    return (

        <div
            className="
            fixed
            inset-0
            bg-black/30
            flex
            items-center
            justify-center
            z-50
            "
        >

            <div
                className="
                bg-white
                w-[520px]
                max-h-[90vh]
                overflow-y-auto
                rounded-3xl
                p-8
                shadow-xl
                "
            >

                <div
                    className="
                    flex
                    justify-between
                    items-center
                    mb-8
                    "
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="
                            w-12
                            h-12
                            rounded-2xl
                            bg-blue-100
                            flex
                            items-center
                            justify-center
                            "
                        >

                            <Pencil className="text-blue-600" />

                        </div>

                        <div>

                            <h2 className="text-2xl font-bold">

                                Edit Child

                            </h2>

                            <p className="text-sm text-slate-500">

                                Update child information

                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={close}
                    >

                        <X className="text-slate-400" />

                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="text-sm text-slate-500">

                            Child Name

                        </label>

                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter name"
                            className="
                            w-full
                            mt-2
                            h-12
                            rounded-xl
                            border
                            px-4
                            outline-none
                            focus:border-[#7B6EF6]
                            "
                            required
                        />

                    </div>


                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="text-sm text-slate-500">

                                Age

                            </label>

                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Age"
                                min="1"
                                className="
                                w-full
                                mt-2
                                h-12
                                rounded-xl
                                border
                                px-4
                                outline-none
                                focus:border-[#7B6EF6]
                                "
                                required
                            />

                        </div>


                        <div>

                            <label className="text-sm text-slate-500">

                                Gender

                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="
                                w-full
                                mt-2
                                h-12
                                rounded-xl
                                border
                                px-4
                                outline-none
                                focus:border-[#7B6EF6]
                                "
                            >

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                            </select>

                        </div>

                    </div>


                    <div>

                        <label className="text-sm text-slate-500">

                            Parent Name

                        </label>

                        <input
                            type="text"
                            name="parent_name"
                            value={formData.parent_name}
                            onChange={handleChange}
                            placeholder="Parent name"
                            className="
                            w-full
                            mt-2
                            h-12
                            rounded-xl
                            border
                            px-4
                            outline-none
                            focus:border-[#7B6EF6]
                            "
                            required
                        />

                    </div>


                    <div>

                        <label className="text-sm text-slate-500">

                            Notes

                        </label>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional notes"
                            rows="3"
                            className="
                            w-full
                            mt-2
                            rounded-xl
                            border
                            p-4
                            resize-none
                            outline-none
                            focus:border-[#7B6EF6]
                            "
                        />

                    </div>


                    <div className="flex gap-4 pt-4">

                        <button
                            type="button"
                            onClick={close}
                            disabled={saving}
                            className="
                            flex-1
                            h-12
                            rounded-xl
                            border
                            disabled:opacity-50
                            "
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="
                            flex-1
                            h-12
                            rounded-xl
                            bg-[#7B6EF6]
                            text-white
                            hover:bg-[#6959F5]
                            disabled:opacity-50
                            "
                        >

                            {saving
                                ? "Saving..."
                                : "Save Changes"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};


export default EditChildModal;