"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function signIn() {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert("Invalid credentials");
            return;
        }

        // After login → decide where to go
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data: customer } = await supabase
            .from("customers")
            .select("user_id")
            .eq("user_id", user!.id)
            .single();

        if (customer) {
            router.push("/customer");
            return;
        }

        const { data: shop } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", user!.id)
            .single();

        if (shop) {
            router.push("/shop");
            return;
        }

        router.push("/auth/signup");
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>

            <input
                placeholder="Email"
                className="border p-2 w-full mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                className="border p-2 w-full mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                onClick={signIn}
                className="bg-black text-white w-full py-2"
            >
                Sign In
            </button>
        </div>
    );
}
