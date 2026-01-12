"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CustomerPage() {
  const [order, setOrder] = useState<any>(null);

  async function placeOrder() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { data, error } = await supabase
          .from("orders")
          .insert([
            {
              status: "pending",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          ])
          .select()
          .single();

        if (error) {
          alert("Error placing order");
        } else {
          setOrder(data);
        }
      },
      () => alert("Location permission denied")
    );
  }

  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel("order-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Customer</h2>

      {!order && (
        <button
          onClick={placeOrder}
          className="mt-4 bg-black text-white px-4 py-2"
        >
          Place Order
        </button>
      )}

      {order && (
        <div className="mt-6 border p-4">
          <p><b>Order ID:</b> {order.id}</p>
          <p><b>Status:</b> {order.status}</p>

          {order.status === "pending" && <p>Waiting for shop to accept…</p>}
          {order.status === "accepted" && <p>Shop accepted your order 🚀</p>}
          {order.status === "delivered" && <p>Order delivered 🎉</p>}
        </div>
      )}
    </div>
  );
}
