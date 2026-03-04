"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API_BASE = "https://zynon.onrender.com/api"

export default function EditProfilePage() {

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: "",
        bio: "",
        location: "",
        website: "",
        pronouns: "",
        profilePicture: "",
        coverPhoto: ""
    })

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null


    /* ---------------- FETCH PROFILE ---------------- */

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const res = await fetch(`${API_BASE}/profile/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    credentials: "include"
                })

                const data = await res.json()

                if (!res.ok) throw new Error(data.message)

                setForm({
                    name: data.data.name || "",
                    bio: data.data.bio || "",
                    location: data.data.location || "",
                    website: data.data.website || "",
                    pronouns: data.data.pronouns || "",
                    profilePicture: data.data.profilePicture || "",
                    coverPhoto: data.data.coverPhoto || ""
                })

            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()

    }, [])


    /* ---------------- HANDLE CHANGE ---------------- */

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }


    /* ---------------- SAVE PROFILE ---------------- */

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()

        setSaving(true)
        setError("")

        try {

            const res = await fetch(`${API_BASE}/profile/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "x-client-type": "web"
                },
                credentials: "include",
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Update failed")
            }

            router.push("/profile")

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }

    }


    /* ---------------- UI ---------------- */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-black">
                Loading profile...
            </div>
        )
    }

    return (

        <div className="min-h-screen bg-black text-white flex justify-center p-6">

            <div className="w-full max-w-xl bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

                <h1 className="text-2xl font-semibold mb-8">Edit Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* NAME */}
                    <Input
                        label="Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    {/* BIO */}
                    <TextArea
                        label="Bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                    />

                    {/* LOCATION */}
                    <Input
                        label="Location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                    />

                    {/* WEBSITE */}
                    <Input
                        label="Website"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                    />

                    {/* PRONOUNS */}
                    <Input
                        label="Pronouns"
                        name="pronouns"
                        value={form.pronouns}
                        onChange={handleChange}
                    />

                    {/* PROFILE IMAGE */}
                    <Input
                        label="Profile Picture URL"
                        name="profilePicture"
                        value={form.profilePicture}
                        onChange={handleChange}
                    />

                    {/* COVER PHOTO */}
                    <Input
                        label="Cover Photo URL"
                        name="coverPhoto"
                        value={form.coverPhoto}
                        onChange={handleChange}
                    />

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        disabled={saving}
                        className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </form>
            </div>
        </div>
    )
}


/* ---------------- REUSABLE INPUT ---------------- */

function Input({
    label,
    name,
    value,
    onChange
}: any) {

    return (
        <div className="flex flex-col gap-1">

            <label className="text-sm text-white/60">
                {label}
            </label>

            <input
                name={name}
                value={value}
                onChange={onChange}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
            />

        </div>
    )
}


/* ---------------- TEXTAREA ---------------- */

function TextArea({
    label,
    name,
    value,
    onChange
}: any) {

    return (
        <div className="flex flex-col gap-1">

            <label className="text-sm text-white/60">
                {label}
            </label>

            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30 resize-none"
            />

        </div>
    )
}