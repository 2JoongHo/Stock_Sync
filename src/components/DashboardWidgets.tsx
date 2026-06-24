// 대시보드 위젯 컴포넌트

import { useInventoryStore } from "../stores/useInventoryStore";

export const DashboardWidgets = () => {
  const { items, products, logs } = useInventoryStore();

  // 데이터 계산 엔진
  const totalItems = items.length;
  const totalProducts = products.length;

  // 안전재고 미달 자재 계산 (101 기준)
  const shortageCount = items.filter(
    (item) => item.currentStock < (item.safetyStock ?? 101),
  ).length;

  // 오늘 발생한 입출고 건수 계산 (log의 id에 저장된 타임스탬프 활용)
  const today = new Date();
  const todayLogsCount = logs.filter((log) => {
    // 로그 ID 예시: LOG-1717741234567-itemA
    const parts = log.id.split("-");
    if (parts.length > 1) {
      const timestamp = parseInt(parts[1]);
      if (!isNaN(timestamp)) {
        const logDate = new Date(timestamp);
        return logDate.toDateString() === today.toDateString();
      }
    }
    return false;
  }).length;

  // 특정 구역으로 스크롤 후,파란색 테두리 표시
  const scrollToSection = (
    elementId: string,
    ringColor: string = "ring-blue-500",
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // 현재 클릭한 위젯의 스크롤을 상단으로 스크롤
      const scrollableContainer = element.querySelector(".overflow-y-auto");
      if (scrollableContainer) {
        scrollableContainer?.scrollTo({ top: 0, behavior: "smooth" });
      }

      element.classList.add(
        "ring-4",
        ringColor,
        "transition-all",
        "duration-500",
      );
      setTimeout(() => {
        element.classList.remove("ring-4", ringColor);
      }, 1500);
    }
  };

  return (
    // 모바일에서는 2칸씩 2줄, PC에서는 가로로 4칸
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 총 자재 종류 */}
      <div
        onClick={() => scrollToSection("inventory-list")}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 cursor-pointer hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-500">등록된 자재</p>
          <span className="text-xl">🛠️</span>
        </div>
        <h3 className="text-3xl font-black text-slate-800">
          {totalItems}
          <span className="text-sm font-bold text-slate-500 ml-1">종</span>
        </h3>
      </div>

      {/* 총 완제품 종류 */}
      <div
        onClick={() => scrollToSection("product-dispatch")}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 cursor-pointer hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-500">등록된 완제품</p>
          <span className="text-xl">📦</span>
        </div>
        <h3 className="text-3xl font-black text-slate-800">
          {totalProducts}
          <span className="text-sm font-bold text-slate-500 ml-1">종</span>
        </h3>
      </div>

      {/* 오늘의 입출고 */}
      <div
        onClick={() => scrollToSection("stock-logs")}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center transition-transform hover:-translate-y-1 cursor-pointer hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-500">오늘의 입출고</p>
          <span className="text-xl">📜</span>
        </div>
        <h3 className="text-3xl font-black text-slate-800">
          {todayLogsCount}
          <span className="text-sm font-bold text-slate-500 ml-1">건</span>
        </h3>
      </div>

      {/* 안전재고 알람 */}
      <div
        onClick={
          shortageCount > 0
            ? () => scrollToSection("inventory-list", "ring-rose-500")
            : undefined
        }
        className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 ${
          shortageCount > 0
            ? "bg-rose-50 border-rose-200 cursor-pointer hover:shadow-md"
            : "bg-emerald-50 border-emerald-200 cursor-default"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className={`text-sm font-bold ${
              shortageCount > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            안전재고 미달
          </p>
          <span
            className={`text-xl ${shortageCount > 0 ? "animate-bounce" : ""}`}
          >
            {shortageCount > 0 ? "🚨" : "✅"}
          </span>
        </div>
        <h3
          className={`text-3xl font-black ${
            shortageCount > 0 ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {shortageCount}
          <span className="text-sm font-bold ml-1">건</span>
        </h3>
      </div>
    </section>
  );
};
