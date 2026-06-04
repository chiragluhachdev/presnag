import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { Card, Button, Spinner } from "@/components/ui";
import { VendorHeader } from "./Dashboard";

export default function QR() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-qr"],
    queryFn: () => api<{ url: string; qr: string }>("/api/vendor/qr", { auth: true }),
  });

  function download() {
    if (!data) return;
    const a = document.createElement("a");
    a.href = data.qr;
    a.download = "presnag-qr.png";
    a.click();
  }

  function print() {
    if (!data) return;
    const w = window.open("");
    if (!w) return;
    w.document.write(
      `<div style="text-align:center;font-family:sans-serif;padding:40px">
        <h2>Scan to Order</h2>
        <img src="${data.qr}" style="width:300px"/>
        <p>${data.url}</p>
      </div>`
    );
    w.document.close();
    w.print();
  }

  if (isLoading || !data) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="space-y-5">
      <VendorHeader title="QR Code" subtitle="Print this at your stall — customers scan to view your menu and order instantly." />

      <Card className="mx-auto max-w-md rounded-2xl p-6 text-center sm:p-8">
        <img src={data.qr} alt="QR Code" className="mx-auto aspect-square w-full max-w-[260px] rounded-xl border border-slate-200" />
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
        >
          {data.url} <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={download}><Download className="h-4 w-4" /> Download</Button>
          <Button variant="outline" onClick={print}><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </Card>
    </div>
  );
}
