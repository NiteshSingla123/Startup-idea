import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Blinket</h1>

      <Link href="/login">
        <button className="bg-black text-white px-4 py-2 mr-4">
          Sign In
        </button>
      </Link>

      <Link href="/signup">
        <button className="bg-green-600 text-white px-4 py-2">
          Sign Up
        </button>
      </Link>
    </div>
  );
}
