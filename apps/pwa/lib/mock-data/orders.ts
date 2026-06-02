export const mockOrders = [
  {
    id: "PO-2024-001",
    vendorName: "Dapur Sehat Bu Sari",
    items: [{ name: "Ayam Broiler", qty: 52, unit: "kg", price: 35000 }],
    total: 1820000,
    status: "new",
    deliveryDate: "2024-03-20",
    deliveryAddress: "Jl. Veteran No. 12, Pontianak",
  },
  {
    id: "PO-2024-002",
    vendorName: "Catering Berkah",
    items: [{ name: "Beras Sentra Ramos", qty: 100, unit: "kg", price: 15000 }],
    total: 1500000,
    status: "processed",
    deliveryDate: "2024-03-20",
    deliveryAddress: "Jl. Merdeka No. 45, Pontianak",
  },
  {
    id: "PO-2024-003",
    vendorName: "Warung Makan Sedap",
    items: [{ name: "Telur Ayam", qty: 30, unit: "kg", price: 28000 }],
    total: 840000,
    status: "shipped",
    deliveryDate: "2024-03-19",
    deliveryAddress: "Jl. Gajah Mada No. 8, Pontianak",
  },
];
