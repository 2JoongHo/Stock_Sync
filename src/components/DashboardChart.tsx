// 재고관리 차트 컴포넌트

import { useState } from "react";
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
  // 탭 상태 관리 추가 (디폴트는 안전재고(DANGER))
  const [chartMode, setChartMode] = useState<"DANGER" | "MOST" | "ACTIVE">(
    "DANGER",
  );

  // Zustand에서 데이터 가져오기 (logs 추가)
  const { items, logs } = useInventoryStore();
  const GLOBAL_SAFETY_STOCK = 100; // 개별 설정이 없을 때 안전 재고 기준

  // 차트용 데이터 가공 (탭 모드에 따라 다르게)
  let chartData: any[] = [];
  let yAxisDataKey = "재고량";

  if (chartMode === "DANGER") {
    yAxisDataKey = "재고량";
    chartData = [...items]
      .filter(
        (item) =>
          item.currentStock <= (item.safetyStock ?? GLOBAL_SAFETY_STOCK),
      )
      .sort((a, b) => {
        const aRatio = a.currentStock / (a.safetyStock ?? GLOBAL_SAFETY_STOCK);
        const bRatio = b.currentStock / (b.safetyStock ?? GLOBAL_SAFETY_STOCK);
        return aRatio - bRatio; // 위험도(비율)가 낮은 순
      })
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        재고량: item.currentStock,
        안전재고: item.safetyStock ?? GLOBAL_SAFETY_STOCK,
        isLow: true,
      }));
  } else if (chartMode === "MOST") {
    yAxisDataKey = "재고량";
    chartData = [...items]
      .sort((a, b) => b.currentStock - a.currentStock) // 재고 많은 순
      .slice(0, 10)
      .map((item) => {
        const safetyLimit = item.safetyStock ?? GLOBAL_SAFETY_STOCK;
        return {
          name: item.name,
          재고량: item.currentStock,
          안전재고: safetyLimit,
          isLow: item.currentStock <= safetyLimit,
        };
      });
  } else if (chartMode === "ACTIVE") {
    yAxisDataKey = "변동건수";
    const frequencyMap: Record<string, number> = {};
    logs.forEach((log) => {
      frequencyMap[log.itemId] = (frequencyMap[log.itemId] || 0) + 1;
    });

    chartData = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1]) // 건수 많은 순
      .slice(0, 10)
      .map(([itemId, count]) => {
        const item = items.find((i) => i.id === itemId);
        return {
          name: item?.name || "삭제된 자재",
          변동건수: count,
          isLow: false,
        };
      });
  }

  // 막대 색상 결정 함수
  const getBarColor = (entry: any) => {
    if (chartMode === "DANGER") return "#F43F5E";
    if (chartMode === "ACTIVE") return "#10B981";
    return entry.isLow ? "#F43F5E" : "#3B82F6";
  };

  // 차트 제목 동적 렌더링
  const headerInfo = {
    DANGER: {
      title: "🚨 안전재고 미달 TOP 10",
      desc: "시급히 입고가 필요한 위험 자재 목록입니다.",
    },
    MOST: {
      title: "📊 자재 재고 TOP 10",
      desc: "현재 창고에 가장 많이 보유 중인 핵심 자재 현황입니다.",
    },
    ACTIVE: {
      title: "🔥 최근 변동 TOP 10",
      desc: "최근 입출고 작업이 가장 많이 발생한 자재입니다.",
    },
  }[chartMode];

  // 데이터가 없을 경우 표시
  // if (chartData.length === 0) {
  //   return (
  //     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8 h-[300px] flex items-center justify-center">
  //       <p className="text-slate-400 font-bold">
  //         {chartMode === "DANGER"
  //           ? "현재 안전재고 미달 자재가 없습니다."
  //           : "표시할 자재 데이터가 없습니다."}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
      {/* 상단 헤더 & 탭 스위치 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <div>
          <h2 className="m-0 text-xl font-black text-slate-900 transition-all duration-300">
            {headerInfo.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1 transition-all duration-300">
            {headerInfo.desc}
          </p>
        </div>

        {/* 탭 버튼 */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            id="guide-step-2" // 코치 마크용 id
            onClick={() => setChartMode("DANGER")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              chartMode === "DANGER"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            🚨 부족 재고
          </button>
          <button
            onClick={() => setChartMode("MOST")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              chartMode === "MOST"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            📊 최다 보유
          </button>
          <button
            onClick={() => setChartMode("ACTIVE")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              chartMode === "ACTIVE"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
          >
            🔥 최근 변동
          </button>
        </div>
      </div>

      {/* 차트 구성 */}
      <div className="h-[300px] w-full relative">
        {/* 데이터가 없을 때 표시 */}
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-center px-4">
              {chartMode === "DANGER"
                ? "현재 안전재고 미달 자재가 없습니다."
                : "표시할 자재 데이터가 없습니다."}
            </p>
          </div>
        ) : (
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
              {/* dataKey 동적으로 변경 */}
              <Bar dataKey={yAxisDataKey} radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // 모드에 따라 색상이 결정
                    fill={getBarColor(entry)}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};
