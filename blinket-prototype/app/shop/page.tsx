"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

const SHOP_ID = "11111111-1111-1111-1111-111111111111";

export default function ShopPage() {
  const [online, setOnline] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // =========================
  // FETCH ORDERS (SINGLE SOURCE)
  // =========================
  async function fetchOrders() {
    // Pending orders (visible to all shops)
    const { data: pending } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending");

    // Orders accepted by THIS shop
    const { data: mine } = await supabase
      .from("orders")
      .select("*")
      .eq("accepted_by", SHOP_ID);

    setPendingOrders(pending || []);
    setMyOrders(mine || []);
  }

  // =========================
  // ONLINE EFFECT
  // =========================
  useEffect(() => {
    if (!online) return;

    // Fetch immediately
    fetchOrders();

    // Poll every 2 seconds (reliable)
    const interval = setInterval(fetchOrders, 2000);

    // Realtime (best effort)
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        fetchOrders
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [online]);

  // =========================
  // TOGGLE ONLINE
  // =========================
  async function toggleOnline() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newStatus = !online;
        setOnline(newStatus);

        await supabase.from("shops").upsert({
          id: SHOP_ID,
          name: "Test Shop",
          is_online: newStatus,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => alert("Location permission denied")
    );
  }

  // =========================
  // ACCEPT ORDER
  // =========================
  async function acceptOrder(orderId: string) {
    const token = nanoid(16);

    const { data } = await supabase
      .from("orders")
      .update({
        status: "accepted",
        accepted_by: SHOP_ID,
        delivery_token: token,
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .select()
      .single();

    if (!data) {
      alert("Order already accepted");
      return;
    }

    const deliveryLink = `${window.location.origin}/deliver/${token}`;
    alert(`Share this link with delivery boy:\n${deliveryLink}`);

    setPendingOrders((prev) =>
      prev.filter((o) => o.id !== orderId)
    );
    setMyOrders((prev) => [...prev, data]);
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Shopkeeper</h2>

      <button
        onClick={toggleOnline}
        className={`mb-4 px-4 py-2 text-white ${online ? "bg-red-600" : "bg-green-600"
          }`}
      >
        {online ? "Go Offline" : "Go Online"}
      </button>

      {!online && <p>You are offline</p>}

      {online && (
        <>
          {/* ===================== */}
          {/* PENDING ORDERS */}
          {/* ===================== */}
          <h3 className="text-lg font-bold mt-6">Pending Orders</h3>

          {pendingOrders.length === 0 && (
            <p className="text-gray-500">No pending orders</p>
          )}

          {pendingOrders.map((order) => (
            <div key={order.id} className="border p-3 mt-2">
              <p><b>Order ID:</b> {order.id}</p>

              <button
                onClick={() => acceptOrder(order.id)}
                className="mt-2 bg-green-600 text-white px-3 py-1"
              >
                Accept Order
              </button>
            </div>
          ))}

          {/* ===================== */}
          {/* MY DELIVERIES */}
          {/* ===================== */}
          <h3 className="text-lg font-bold mt-8">My Deliveries</h3>

          {myOrders.length === 0 && (
            <p className="text-gray-500">No active deliveries</p>
          )}

          {myOrders.map((order) => (
            <div key={order.id} className="border p-3 mt-2">
              <p><b>Order ID:</b> {order.id}</p>
              <p><b>Delivery Status:</b> {order.delivery_status}</p>

              {order.delivery_status === "not_started" && (
                <button
                  onClick={async () => {
                    await supabase
                      .from("orders")
                      .update({ delivery_status: "picked_up" })
                      .eq("id", order.id)
                      .eq("accepted_by", SHOP_ID);

                    fetchOrders();
                  }}
                  className="mt-2 bg-yellow-600 text-white px-3 py-1"
                >
                  Picked Up
                </button>
              )}

              {order.delivery_status === "picked_up" && (
                <button
                  onClick={async () => {
                    await supabase
                      .from("orders")
                      .update({
                        delivery_status: "delivered",
                        status: "delivered",
                      })
                      .eq("id", order.id)
                      .eq("accepted_by", SHOP_ID);

                    fetchOrders();
                  }}
                  className="mt-2 bg-blue-600 text-white px-3 py-1"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
