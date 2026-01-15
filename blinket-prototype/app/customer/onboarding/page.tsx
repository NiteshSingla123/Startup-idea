"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CustomerOnboardingPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    async function saveProfile() {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Not logged in");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { error } = await supabase.from("customers").insert({
                    user_id: user.id,
                    name,
                    address,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                if (error) {
                    alert(error.message);
                } else {
                    router.push("/customer");
                }
            },
            () => {
                alert("Location permission required");
            }
        );
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Complete your profile</h2>

            <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full mb-3"
            />

            <textarea
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border p-2 w-full mb-3"
            />

            <button
                onClick={saveProfile}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 w-full"
            >
                Save & Continue
            </button>
        </div>
    );
}
