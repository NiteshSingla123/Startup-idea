"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
    const router = useRouter();

    async function selectRole(role: "customer" | "shop") {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        await supabase.from("users").insert({
            id: user.id,
            role,
            phone: user.phone,
        });

        router.push(role === "shop" ? "/shop" : "/customer");
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">I am a...</h2>

            <button
                onClick={() => selectRole("customer")}
                className="bg-green-600 text-white px-4 py-2 w-full mb-3"
            >
                Customer
            </button>

            <button
                onClick={() => selectRole("shop")}
                className="bg-blue-600 text-white px-4 py-2 w-full"
            >
                Shop Owner
            </button>
        </div>
    );
}
