"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { OrderCard } from "@/components/orders/order-card";
import { mockOrders } from "@/lib/mock-data/orders";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

export default function OrdersListPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = activeTab === "all" 
    ? mockOrders 
    : mockOrders.filter(o => o.status === activeTab);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Supplier Orders" />
      
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 p-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="w-full bg-slate-100 p-1 h-11 rounded-xl">
            <TabsTrigger value="all" className="flex-1 rounded-lg font-bold text-xs">Semua</TabsTrigger>
            <TabsTrigger value="new" className="flex-1 rounded-lg font-bold text-xs">Baru</TabsTrigger>
            <TabsTrigger value="processed" className="flex-1 rounded-lg font-bold text-xs">Proses</TabsTrigger>
            <TabsTrigger value="shipped" className="flex-1 rounded-lg font-bold text-xs">Kirim</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="py-20 text-center space-y-2">
            <p className="font-bold text-slate-400">Tidak ada pesanan</p>
            <p className="text-xs text-slate-500 font-medium">Cek tab lain atau refresh halaman</p>
          </div>
        )}
      </div>
    </div>
  );
}
