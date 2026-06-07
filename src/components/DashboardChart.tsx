// 재고관리 차트 컴포넌트

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useInventoryStore } from "../stores/useInventoryStore";

export const DashboardChart = () => {
  // Zustand에서 데이터 가져오기
  const { items } = useInventoryStore();

  // 차트용 데이터
  const chartData = [...items]
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 10)
    .map((item) => ({
      name: item.name,
      재고량: item.currentStock,
      안전재고: 101,
    }));

  // 데이터가 없을 경우 표시
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8 h-[300px] flex items-center justify-center">
        <p className="text-slate-400 font-bold">
          표시할 자재 데이터가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <div className="mb-6">
        <h2 className="m-0 text-xl font-black text-slate-900">
          📊 실시간 자재 재고 TOP 10
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          현재 창고에 가장 많이 보유 중인 핵심 자재 현황입니다.
        </p>
      </div>

      {/* 차트 구성 */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* 가로 점선 */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />

            {/* X축 - 자재명 */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
              dy={10}
            />

            {/* Y축 - 수량 */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94A3B8" }}
            />

            {/* 마우스 올렸을 때 뜨는 정보창 (Tooltip) */}
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                fontWeight: "bold",
              }}
            />

            {/* 차트 막대기 디자인 */}
            <Bar dataKey="재고량" radius={[6, 6, 0, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  // 안전재고 미만이면 빨간색 경고 표시
                  fill={entry.재고량 < 101 ? "#F43F5E" : "#3B82F6"}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
