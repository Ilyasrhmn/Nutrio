import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Package, MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

interface OrderCardProps {
  order: {
    id: string;
    vendorName: string;
    items: { name: string; qty: number; unit: string }[];
    total: number;
    status: string;
    deliveryDate: string;
    deliveryAddress: string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    new: { label: "Baru", className: "bg-blue-100 text-blue-700" },
    processed: { label: "Diproses", className: "bg-amber-100 text-amber-700" },
    shipped: { label: "Dikirim", className: "bg-indigo-100 text-indigo-700" },
    completed: { label: "Selesai", className: "bg-green-100 text-green-700" },
  };

  const config = statusConfig[order.status] || statusConfig.new;

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:border-green-200 transition-colors shadow-sm active:scale-[0.98]">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-slate-400">{order.id}</p>
              <h3 className="font-bold text-slate-900 leading-none">{order.vendorName}</h3>
            </div>
            <Badge className={cn("border-none font-bold", config.className)}>
              {config.label}
            </Badge>
          </div>

          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <Package className="h-3.5 w-3.5" />
                <span>{item.name} • {item.qty} {item.unit}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {order.deliveryDate}
            </div>
            <p className="font-black text-slate-900">
              Rp {(order.total / 1000).toLocaleString()}k
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
