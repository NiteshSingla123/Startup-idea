"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const router = useRouter();

    // 🔥 AUTO-DETECT SESSION AFTER MAGIC LINK
    useEffect(() => {
        async function checkSession() {
            const { data } = await supabase.auth.getSession();

            if (data.session) {
                const user = data.session.user;

                const { data: profile } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (!profile) {
                    router.replace("/select-role");
                } else {
                    router.replace(
                        profile.role === "shop" ? "/shop" : "/customer"
                    );
                }
            }
        }

        checkSession();
    }, [router]);

    async function sendLoginLink() {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: "http://localhost:3000/login",
            },
        });

        if (error) {
            alert(error.message);
        } else {
            setSent(true);
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Login</h2>

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full mb-3"
            />

            {!sent ? (
                <button
                    onClick={sendLoginLink}
                    className="bg-blue-600 text-white px-4 py-2 w-full"
                >
                    Send Login Link
                </button>
            ) : (
                <p className="text-green-600">
                    Login link sent! Check your email 📩
                    (You will be redirected automatically after clicking it)
                </p>
            )}
        </div>
    );
}
