"use client";

import { useRouter } from "next/navigation";

export default function SignupChoicePage() {
    const router = useRouter();

    return (
        <div className="p-6 text-center space-y-4">
            <h2 className="text-xl font-bold">Sign Up As</h2>

            <button
                onClick={() => router.push("/signup/customer")}
                className="w-64 bg-green-600 text-white py-2"
            >
                Customer
            </button>

            <button
                onClick={() => router.push("/signup/shop")}
                className="w-64 bg-blue-600 text-white py-2"
            >
                Shop
            </button>
        </div>
    );
}
