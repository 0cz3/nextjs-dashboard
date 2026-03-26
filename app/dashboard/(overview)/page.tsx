// /app/dashboard/page.tsx

import { Card } from "@/app/ui/dashboard/cards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { lusitana } from "@/app/ui/fonts";
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from "../../lib/data";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";

export default async function Page() {
  // ウォーターフォール各データ取得が 直列的に実行されているため、全体の処理時間が長くなる可能性
  // 先行するデータに依存する後続処理が必要な場合には、ウォーターフォールが向いている
  // 並列実行するにはPromise.all() や Promise.allSettled()を使用する
//   const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const { numberOfInvoices, numberOfCustomers, totalPaidInvoices, totalPendingInvoices } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card title="Total Customers" value={numberOfCustomers} type="customers" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton/ >}>
			<RevenueChart />
		</Suspense >
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
