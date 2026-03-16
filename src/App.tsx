import { useEffect } from "react";
import { InventoryList } from "./components/InventoryList";
import { NewInventoryForm } from "./components/NewInventoryForm";
import { NewProductForm } from "./components/NewProductForm";
import { ProductDispatch } from "./components/ProductDispatch";
import { StockLogs } from "./components/StockLogs";
import { useInventoryStore } from "./stores/useInventoryStore";

function App() {
  const { items, setItems } = useInventoryStore();

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
    <div
      // style={{
      //   padding: "20px",
      //   maxWidth: "800px",
      //   margin: "0 auto",
      //   fontFamily: "sans-serif",
      // }}
      className="p-5 max-w-200 mx-auto font-sans"
    >
      <header
        // style={{ marginBottom: "40px", textAlign: "center" }}
        className="mb-10 text-center"
      >
        <h1
          // style={{
          //   color: "#1e293b",
          //   fontSize: "2.5rem",
          //   marginBottom: "10px",
          // }}
          className="text-slate-900 text-4xl mb-3"
        >
          StockSync
        </h1>
        <p
          // style={{ color: "#64748b" }}
          className="text-slate-500"
        >
          실시간 재고 관리 및 BOM 자동 동기화 시스템
        </p>
      </header>

      {/* 신규 자재 입력 공정 */}
      <NewInventoryForm />

      {/* 신규 자재 입력 공정 */}
      <NewProductForm />

      {/* 완제품 생산/출고 공정 */}
      <ProductDispatch />

      <hr
        // style={{
        //   margin: "40px 0",
        //   border: "0",
        //   borderTop: "1px solid #e2e8f0",
        // }}
        className="my-10 border-0 border-t border-slate-200"
      />

      {/* 메인 재고 현황 공정 */}
      <InventoryList />

      {/* 시스템 로그 공정 */}
      <StockLogs />
    </div>
  );
}

export default App;
