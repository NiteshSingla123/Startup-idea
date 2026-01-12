"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SHOP_ID = "11111111-1111-1111-1111-111111111111";

function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export default function ShopPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!online) return;

    supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .then(({ data }) => {
        console.log("Fetched pending orders:", data);
        setOrders(data || []);
      });

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("Realtime order received:", payload.new);
          setOrders((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [online]);


  async function toggleOnline() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newStatus = !online;
        setOnline(newStatus);

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("Shop location:", latitude, longitude);

        await supabase.from("shops").upsert({
          id: SHOP_ID,
          name: "Test Shop",
          is_online: newStatus,
          latitude,
          longitude,
        });
      },
      (error) => {
        console.error(error);
        alert("Location permission denied");
      }
    );
  }


  async function acceptOrder(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "accepted",
        accepted_by: SHOP_ID,
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .select();

    if (error) {
      alert("Error accepting order");
    } else if (!data || data.length === 0) {
      alert("Order already accepted by another shop");
    } else {
      alert("Order accepted successfully");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Shopkeeper</h2>

      {/* ONLINE / OFFLINE BUTTON */}
      <button
        onClick={toggleOnline}
        className={`mb-4 px-4 py-2 text-white ${online ? "bg-red-600" : "bg-green-600"
          }`}
      >
        {online ? "Go Offline" : "Go Online"}
      </button>

      {/* ORDERS */}
      {!online && <p>You are offline</p>}

      {online && orders.length === 0 && <p>No pending orders</p>}

      {online &&
        orders.map((order) => (
          <div key={order.id} className="border p-3 mt-3">
            {order.status === "pending" && (
              <button
                onClick={() => acceptOrder(order.id)}
                className="mt-2 bg-green-600 text-white px-3 py-1"
              >
                Accept Order
              </button>
            )}

            {order.status === "accepted" && (
              <button
                onClick={async () => {
                  await supabase
                    .from("orders")
                    .update({ status: "delivered" })
                    .eq("id", order.id);

                  alert("Order delivered");
                }}
                className="mt-2 bg-blue-600 text-white px-3 py-1"
              >
                Mark Delivered
              </button>
            )}

          </div>
        ))}
    </div>
  );
}
