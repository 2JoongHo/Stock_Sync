import { useEffect } from "react";
import { InventoryList } from "./components/InventoryList";
import { NewInventoryForm } from "./components/NewInventoryForm";
import { NewProductForm } from "./components/NewProductForm";
import { ProductDispatch } from "./components/ProductDispatch";
import { StockLogs } from "./components/StockLogs";
import { useInventoryStore } from "./stores/useInventoryStore";
import type { InventoryItem } from "./types/inventory";

function App() {
  const { setItems } = useInventoryStore();

  useEffect(() => {
    // 초기 마스터 데이터 로드
    const initialData: InventoryItem[] = [
      {
        id: "1",
        name: "디스플레이",
        spec: "27인치",
        category: "부품",
        currentStock: 100,
        unit: "ea",
        location: "A-1-1",
      },
      {
        id: "2",
        name: "M10 볼트",
        spec: "STS304",
        category: "부품",
        currentStock: 500,
        unit: "ea",
        location: "A-2-1",
      },
    ];
    setItems(initialData);
  }, [setItems]);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1
          style={{ color: "#1e293b", fontSize: "2.5rem", marginBottom: "10px" }}
        >
          StockSync
        </h1>
        <p style={{ color: "#64748b" }}>
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
        style={{
          margin: "40px 0",
          border: "0",
          borderTop: "1px solid #e2e8f0",
        }}
      />

      {/* 메인 재고 현황 공정 */}
      <InventoryList />

      {/* 시스템 로그 공정 */}
      <StockLogs />
    </div>
  );
}

export default App;
