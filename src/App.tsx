import { useEffect } from "react";
import { useInventoryStore } from "./stores/useInventoryStore";
import type { InventoryItem, Product } from "./types/inventory";

function App() {
  const { items, logs, setItems, updateStock, dispatchProduct } =
    useInventoryStore();

  const monitorProduct: Product = {
    id: "PROD-001",
    name: "27인치 모니터",
    bom: [
      { materialId: "1", quantity: 1 },
      { materialId: "2", quantity: 20 },
    ],
  };

  useEffect(() => {
    const initialData: InventoryItem[] = [
      {
        id: "1",
        name: "M10 볼트",
        spec: "STS304",
        category: "부품",
        currentStock: 100,
        unit: "ea",
        location: "A-1-1",
      },
      {
        id: "2",
        name: "STS304 너트",
        spec: "M10",
        category: "부품",
        currentStock: 200,
        unit: "ea",
        location: "A-2-1",
      },
    ];
    setItems(initialData);
  }, [setItems]);

  return (
    <div>
      <h1>StockSync 실시간</h1>

      {/* 완제품(BOM) 출고 제어 */}
      <section
        style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#f8fafc",
          border: "2px solid #e2e8f0",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>📦 완제품 출고 (BOM 시스템)</h2>
        <p>
          <strong>{monitorProduct.name}</strong> 1대당 [디스플레이 1개, 볼트
          20개] 소모
        </p>
        <button
          onClick={() => dispatchProduct(monitorProduct, 1)}
          style={{
            padding: "10px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          모니터 1대 생산 (자재 자동 차감)
        </button>
        <button
          onClick={() => dispatchProduct(monitorProduct, 10)}
          style={{
            padding: "10px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          모니터 10대 생산 (자재 자동 차감)
        </button>
      </section>

      <hr />

      {/* 개별 자재 현황 및 수동 입출고 */}
      <section style={{ marginTop: "20px" }}>
        <h2>📊 실시간 자재 현황 (수동 관리)</h2>
        {items.map((item) => {
          // 각 자재별로 입력 수량을 관리하기 위해 임시 ID를 활용한 입력창 제어가 필요하지만,
          // 가장 간단하게 처리하기 위해 'input' 태그의 ID를 활용해 값을 가져오겠습니다.

          const inputId = `input-${item.id}`;

          const handleUpdate = (type: "IN" | "OUT") => {
            const inputElement = document.getElementById(
              inputId,
            ) as HTMLInputElement;
            const value = Number(inputElement.value);

            if (value <= 0) return alert("1 이상의 수량을 입력해주세요.");

            // 입고면 양수(+), 출고면 음수(-)로 전달
            const finalAmount = type === "IN" ? value : -value;
            updateStock(item.id, finalAmount);

            inputElement.value = ""; // 입력 후 칸 비우기
          };

          return (
            <div
              key={item.id}
              style={{
                marginBottom: "15px",
                padding: "15px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong> | <small>{item.spec}</small> <br />
                현 재고:{" "}
                <span style={{ fontSize: "1.2rem", color: "#1e293b" }}>
                  {item.currentStock}
                </span>{" "}
                {item.unit}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {/* 수량 입력창 */}
                <input
                  id={inputId}
                  type="number"
                  placeholder="수량"
                  style={{ width: "70px", padding: "5px", textAlign: "right" }}
                />

                {/* 입고 버튼 */}
                <button
                  onClick={() => handleUpdate("IN")}
                  style={{
                    padding: "5px 12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  입고
                </button>

                {/* 출고 버튼 */}
                <button
                  onClick={() => handleUpdate("OUT")}
                  style={{
                    padding: "5px 12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  출고
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <hr style={{ margin: "40px 0", border: "1px solid #e2e8f0" }} />

      {/* 최근 입출고 기록 섹션 */}
      <section style={{ marginTop: "20px" }}>
        <h2>📜 최근 입출고 기록</h2>
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "#f1f5f9",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        >
          {logs.length === 0 && (
            <p style={{ color: "#64748b" }}>아직 기록이 없습니다.</p>
          )}

          {logs.map((log) => {
            // 로그의 itemId를 가지고 현재 아이템 리스트에서 이름을 찾아옵니다.
            const itemName =
              items.find((i) => i.id === log.itemId)?.name || "삭제된 자재";

            return (
              <div
                key={log.id}
                style={{
                  fontSize: "0.9rem",
                  padding: "8px 0",
                  borderBottom: "1px solid #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  color: log.type === "IN" ? "#166534" : "#991b1b", // 입고는 초록, 출고는 빨강
                }}
              >
                <span>
                  <strong>[{log.timestamp}]</strong> {log.handler}
                </span>
                <span>
                  {itemName} {log.type === "IN" ? "입고" : "출고"}:{" "}
                  {log.quantity}ea
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default App;
