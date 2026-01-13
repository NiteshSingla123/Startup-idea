"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function DeliverPage() {
    const { token } = useParams();
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        async function loadOrder() {
            const { data } = await supabase
                .from("orders")
                .select("*")
                .eq("delivery_token", token)
                .single();

            setOrder(data);
        }

        loadOrder();
    }, [token]);

    if (!order) return <p>Loading...</p>;

    if (order.delivery_status === "delivered") {
        return <h2>Order already delivered ✅</h2>;
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Delivery</h2>

            <p><b>Order ID:</b> {order.id}</p>

            {/* Google Maps link */}
            <a
                href={`https://www.google.com/maps?q=${order.customer_latitude},${order.customer_longitude}`}
                target="_blank"
                className="text-blue-600 underline"
            >
                Open Map
            </a>

            <button
                onClick={async () => {
                    await supabase
                        .from("orders")
                        .update({
                            delivery_status: "delivered",
                            status: "delivered",
                        })
                        .eq("delivery_token", token);

                    alert("Order delivered successfully 🎉");
                    location.reload();
                }}
                className="block mt-4 bg-green-600 text-white px-4 py-2"
            >
                Mark Delivered
            </button>
        </div>
    );
}
