// 자재 현황 리스트 컴포넌트

import { useState } from "react";
import { InventorySearch } from "../components/InventorySearch";
import { useInventoryStore } from "../stores/useInventoryStore";
import { exportFullInventoryReport } from "../utils/excelUtils"; // 엑셀로 내보내기

export const InventoryList = () => {
  // Zustand에서 자재 데이터와 수량 업데이트 함수를 가져옴
  const { items, logs, updateStock, removeItem } = useInventoryStore();

  // 편집모드 상태
  const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const GLOBAL_SAFETY_STOCK = 100; // 개별 설정이 없을 때 적용되는 공장 전체 안전 재고 기준

  // 전체 자재 중 이름이나 규격에 검색어가 포함된 것만 골라내기
  // .filter(): 조건에 맞는 아이템만 모아 새로운 리스트를 생성
  // .toLowerCase(): 대소문자 구분 없이 검색되도록 모두 소문자로 변환하여 비교
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 입출고 실행 함수
  const handleManualUpdate = (itemId: string, type: "IN" | "OUT") => {
    // 특정 자재의 입력창을 ID로 직접 찾아옴 (DOM 접근)
    const inputElement = document.getElementById(
      `input-${itemId}`
    ) as HTMLInputElement;
    const value = Number(inputElement.value);

    // 유효성 검사: 수량이 0이거나 음수면 실행 중단 및 경고창
    if (value <= 0) return alert("1 이상의 수량을 입력해주세요.");

    // 상황실에 데이터 업데이트 요청 (입고면 양수, 출고면 음수)
    updateStock(itemId, type === "IN" ? value : -value);

    // 작업 완료 후 입력 칸을 깨끗이 비워줌
    inputElement.value = "";
  };

  return (
    <section style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h2 style={{ margin: 0 }}>📊 실시간 자재 현황</h2>

          {/* 엑셀 내보내기 버튼 추가 */}
          <button
            onClick={() => exportFullInventoryReport(items, logs)}
            style={{
              padding: "5px 12px",
              backgroundColor: "#1e293b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.8rem",
            }}
          >
            엑셀로 내보내기
          </button>

          {/* 자재 관리 모드 버튼 */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: "5px 12px",
              fontSize: "0.8rem",
              backgroundColor: isEditMode ? "#64748b" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isEditMode ? "수정완료" : "수정하기"}
          </button>
        </div>

        {/* 검색창 */}
        <InventorySearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* 필터링된 결과가 0개일 때와 있을 때를 나누어 화면을 그림 (조건부 렌더링) */}
      {filteredItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
          {searchTerm ? "검색 결과가 없습니다." : "등록된 자재가 없습니다."}
        </p>
      ) : (
        filteredItems.map((item) => {
          // 개별 안전재고 설정이 있으면 사용, 없으면(??) 공장 기준(100)을 사용
          const safetyLimit = item.safetyStock ?? GLOBAL_SAFETY_STOCK;
          const isLowStock = item.currentStock <= safetyLimit;

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
                // 재고 부족 상태(isLowStock)에 따라 배경색과 테두리를 동적으로 변경
                backgroundColor: isLowStock ? "#fff1f2" : "#fff",
                borderRadius: "8px",
                border: isLowStock ? "2px solid #fda4af" : "1px solid #eee",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>{item.name}</strong>
                  {/* 재고가 위험 기준치 이하면 경고 배지를 보여줌 */}
                  {isLowStock && (
                    <span
                      style={{
                        backgroundColor: "#e11d48",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      ⚠️ 재고부족
                    </span>
                  )}
                </div>
                <small style={{ color: "#64748b" }}>
                  {item.spec} | 안전재고: {safetyLimit}
                  {item.unit}
                </small>{" "}
                <br />현 재고:{" "}
                <strong
                  style={{
                    fontSize: "1.2rem",
                    color: isLowStock ? "#e11d48" : "#1e293b",
                  }}
                >
                  {item.currentStock}
                </strong>{" "}
                {item.unit}
              </div>

              {/* 모드에 따라 버튼 그룹을 다르게 */}
              {isEditMode ? (
                // 관리 모드일 때는 삭제 버튼 노출
                <button
                  onClick={() => {
                    if (
                      window.confirm(`'${item.name}' 자재를 삭제하시겠습니까?`)
                    ) {
                      removeItem(item.id);
                    }
                  }}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  삭제
                </button>
              ) : (
                // 일반 모드일 때는 입출고 입력창 노출
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id={`input-${item.id}`}
                    type="number"
                    placeholder="수량"
                    style={{
                      width: "60px",
                      padding: "5px",
                      textAlign: "right",
                    }}
                  />
                  <button
                    onClick={() => handleManualUpdate(item.id, "IN")}
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "5px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    입고
                  </button>
                  <button
                    onClick={() => handleManualUpdate(item.id, "OUT")}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    출고
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
};
