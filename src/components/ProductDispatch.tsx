// 완제품 단위 출고 컴포넌트

import { useState } from "react";
import { InventorySearch } from "../components/InventorySearch";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { Product } from "../types/inventory";

export const ProductDispatch = () => {
  // Zustand에서 완제품 목록(products)과 생산 실행 함수를 가져옴
  const { products, dispatchProduct, removeProduct } = useInventoryStore();

  // 편집모드 상태
  const [isEditMode, setIsEditMode] = useState(false);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  // 각 제품별 생산 수량을 관리하기 위한 바구니 (ID별로 수량 저장)
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});

  // 개별 제품의 수량을 변경하는 함수
  const handleAmountChange = (productId: string, value: number) => {
    setAmounts((prev) => ({ ...prev, [productId]: value }));
  };

  // 생산 실행 핸들러
  const handleDispatch = (product: Product) => {
    const dispatchAmount = amounts[product.id] || 0;

    // 유효성 검사: 생산 수량이 0이면 중단
    if (dispatchAmount <= 0) {
      return alert("생산 수량을 입력해주세요.");
    }

    // dispatchProduct 함수 호출
    // 선택된 제품과 입력된 수량을 전달하면 모든 자재를 한꺼번에 차감
    dispatchProduct(product, dispatchAmount);

    // 입력창을 다시 0으로 초기화
    handleAmountChange(product.id, 0);
  };

  // 검색 로직: 상황실에 있는 모든 완제품 중 검색어에 맞는 것만 필터링
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section
      style={{
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f8fafc",
        border: "2px solid #e2e8f0",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>📦 완제품 출고</h2>

        {/* 편집모드 버튼 */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: "5px 10px",
            fontSize: "0.8rem",
            backgroundColor: isEditMode ? "#ef4444" : "#64748b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isEditMode ? "편집 완료" : "목록 편집"}
        </button>
      </div>

      {/* 🔍 검색창 연결 */}
      <div style={{ marginBottom: "20px" }}>
        <InventorySearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
          {searchTerm
            ? "검색 결과와 일치하는 완제품이 없습니다."
            : "등록된 완제품이 없습니다. 제품을 먼저 등록해주세요."}
        </p>
      ) : (
        filteredProducts.map((product) => {
          const currentAmount = amounts[product.id] || 0;

          return (
            <div
              key={product.id}
              style={{
                position: "relative",
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "15px",
              }}
            >
              {/* 편집모드 시 삭제버튼 등장 */}
              {isEditMode && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(`'${product.name}' 제품을 삭제할까요?`)
                    ) {
                      removeProduct(product.id);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              )}

              <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: 0 }}>
                {/* 현장 관리자가 보기 편하게 제품 소모 규격을 상단에 노출 */}
                <strong>{product.name}</strong> 1대당 [
                {product.bom
                  .map((b) => `자재ID ${b.materialId} ${b.quantity}개`)
                  .join(", ")}
                ] 소모
              </p>

              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {/* 생산 수량 입력창 그룹 */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <label
                    htmlFor={`qty-${product.id}`}
                    style={{ fontWeight: "bold", fontSize: "0.9rem" }}
                  >
                    생산 수량:
                  </label>
                  <input
                    id={`qty-${product.id}`}
                    type="number"
                    min="1"
                    value={currentAmount}
                    // 입력창에 타이핑하면 숫자로 변환하여 해당 제품 ID의 수량으로 저장
                    onChange={(e) =>
                      handleAmountChange(product.id, Number(e.target.value))
                    }
                    style={{
                      width: "80px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      textAlign: "right",
                    }}
                  />
                  <span style={{ fontWeight: "bold" }}>대</span>
                </div>

                {/* 통합 출고 버튼 */}
                <button
                  onClick={() => handleDispatch(product)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {product.name} 생산 실행
                </button>
              </div>

              {/* 사용자가 수량을 입력하면 총 소모량을 미리 계산해서 보여줌 */}
              {currentAmount > 0 && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.8rem",
                    color: "#ef4444",
                  }}
                >
                  * 생산 시 설정된 BOM에 따라 자재 재고가 자동 차감됩니다.
                </p>
              )}
            </div>
          );
        })
      )}
    </section>
  );
};
