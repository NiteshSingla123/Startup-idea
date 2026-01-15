"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const STATES: Record<string, string[]> = {
    Punjab: ["Mohali", "Ludhiana", "Amritsar"],
    Haryana: ["Gurgaon", "Faridabad"],
};

export default function CustomerSignup() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");

    async function signup() {
        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error || !data.user) {
            alert(error?.message || "Signup failed");
            return;
        }

        await supabase.from("customers").upsert({
            user_id: data.user.id,
            name,
            address_line: address,
            city,
            state,
        });

        router.push("/customer");
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Customer Signup</h2>

            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
            <input placeholder="Full Name" onChange={e => setName(e.target.value)} />
            <input placeholder="Address" onChange={e => setAddress(e.target.value)} />

            <select onChange={e => setState(e.target.value)}>
                <option value="">Select State</option>
                {Object.keys(STATES).map(s => (
                    <option key={s}>{s}</option>
                ))}
            </select>

            <select onChange={e => setCity(e.target.value)}>
                <option value="">Select City</option>
                {STATES[state]?.map(c => (
                    <option key={c}>{c}</option>
                ))}
            </select>

            <button onClick={signup} className="bg-green-600 text-white px-4 py-2 mt-4">
                Create Account
            </button>
        </div>
    );
}
