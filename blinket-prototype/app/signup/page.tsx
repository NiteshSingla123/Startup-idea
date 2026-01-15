import Link from "next/link";

export default function SignupPage() {
    return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Sign Up As</h2>

            <Link href="/signup/customer">
                <button className="bg-blue-600 text-white px-4 py-2 mb-3 block w-full">
                    Customer
                </button>
            </Link>

            <Link href="/signup/shop">
                <button className="bg-purple-600 text-white px-4 py-2 block w-full">
                    Shop
                </button>
            </Link>
        </div>
    );
}
