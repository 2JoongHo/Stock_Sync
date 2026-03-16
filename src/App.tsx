import { useEffect, useState } from "react";
import { InventoryList } from "./components/InventoryList";
import { NewInventoryForm } from "./components/NewInventoryForm";
import { NewProductForm } from "./components/NewProductForm";
import { ProductDispatch } from "./components/ProductDispatch";
import { StockLogs } from "./components/StockLogs";
import { useInventoryStore } from "./stores/useInventoryStore";

function App() {
  const { items, setItems } = useInventoryStore();

  // 현재 폼 열림 관리 상태 (null은 모두 닫힘)
  const [activeForm, setActiveForm] = useState<"material" | "product" | null>(
    null,
  );

  useEffect(() => {
    // 초기 마스터 데이터 로드
    if (items.length === 0) {
      const initialData = [
        {
          id: "1",
          name: "디스플레이",
          currentStock: 10,
          unit: "ea",
          spec: "27인치",
          category: "메인",
        },
        {
          id: "2",
          name: "볼트",
          currentStock: 100,
          unit: "ea",
          spec: "M3",
          category: "부자재",
        },
      ];
      setItems(initialData);
    }
  }, []);

  return (
    <div className="p-5 max-w-4xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-4xl font-black tracking-tight">
            StockSync
          </h1>
          <p className="text-slate-500 font-medium">
            실시간 재고 관리 및 BOM 자동 동기화 시스템
          </p>
        </div>

        {/* 폼 열기/닫기 제어 버튼 그룹 */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setActiveForm(activeForm === "material" ? null : "material")
            }
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-2 ${
              activeForm === "material"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-800"
            }`}
          >
            {activeForm === "material" ? "✕ 자재등록 닫기" : "➕ 자재등록"}
          </button>
          <button
            onClick={() =>
              setActiveForm(activeForm === "product" ? null : "product")
            }
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer border-2 ${
              activeForm === "product"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-800"
            }`}
          >
            {activeForm === "product" ? "✕ 제품등록 닫기" : "➕ 제품등록"}
          </button>
        </div>
      </header>

      {/* 선택된 폼만 아래로 내려와서 열리는 영역 */}
      <div className="transition-all duration-300">
        {activeForm === "material" && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-300">
            {/* 신규 자재 입력 공정 */}
            <NewInventoryForm />
          </div>
        )}
        {activeForm === "product" && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-300">
            {/* 신규 자재 입력 공정 */}
            <NewProductForm />
          </div>
        )}
      </div>

      {/* 완제품 생산/출고 공정 */}
      <ProductDispatch />

      <hr className="my-10 border-0 border-t border-slate-200" />

      {/* 메인 재고 현황 공정 */}
      <InventoryList />

      {/* 시스템 로그 공정 */}
      <StockLogs />
    </div>
  );
}

export default App;
