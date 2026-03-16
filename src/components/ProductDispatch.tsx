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
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section
    // style={{
    //   marginBottom: "30px",
    //   padding: "20px",
    //   backgroundColor: "#f8fafc",
    //   border: "2px solid #e2e8f0",
    //   borderRadius: "8px",
    // }}
    // className="mb-8 p-5 bg-slate-50 border-2 border-slate-200 rounded-lg shadow-sm"
    >
      <div
        // style={{
        //   display: "flex",
        //   justifyContent: "space-between",
        //   marginBottom: "20px",
        // }}
        className="flex justify-between mb-5 items-center"
      >
        <h2
          // style={{ marginTop: 0 }}
          className="mt-0 text-xl font-bold text-slate-900 flex items-center gap-2"
        >
          📦 완제품 출고
        </h2>

        <div className="flex items-center gap-4">
          {/* 편집모드 버튼 */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            // style={{
            //   padding: "5px 10px",
            //   fontSize: "0.8rem",
            //   backgroundColor: isEditMode ? "#64748b" : "#ef4444",
            //   color: "white",
            //   border: "none",
            //   borderRadius: "4px",
            //   cursor: "pointer",
            // }}
            className={`px-3 py-1.5 text-xs font-bold text-white rounded cursor-pointer transition-colors ${isEditMode ? "bg-emerald-500" : "bg-red-500"}`}
          >
            {isEditMode ? "수정완료" : "수정하기"}
          </button>
          {/* 검색창 연결 */}
          <InventorySearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p
          // style={{ color: "#64748b", textAlign: "center", padding: "20px" }}
          className="text-slate-500 text-center py-5"
        >
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
              // style={{
              //   position: "relative",
              //   padding: "15px",
              //   backgroundColor: "white",
              //   borderRadius: "8px",
              //   border: "1px solid #e2e8f0",
              //   marginBottom: "15px",
              // }}
              className="flex items-center justify-between p-4 mb-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex-1">
                <p
                  // style={{ fontSize: "0.9rem", color: "#64748b", marginTop: 0 }}
                  className="text-sm text-slate-500 mt-0 mb-0"
                >
                  {/* 현장 관리자가 보기 편하게 제품 소모 규격을 상단에 노출 */}
                  <span className="font-bold text-slate-800">
                    {product.name}
                  </span>{" "}
                  - [
                  {product.bom
                    .map((b) => `${b.materialId} : ${b.quantity}ea`)
                    .join(", ")}
                  ]
                </p>

                <div
                  // style={{ display: "flex", gap: "10px", alignItems: "center" }}
                  className="flex flex-wrap gap-4 items-center"
                >
                  {/* 생산 수량 입력창 그룹 */}
                  <div
                    // style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    className="flex items-center gap-2"
                  >
                    <label
                      htmlFor={`qty-${product.id}`}
                      // style={{ fontWeight: "bold", fontSize: "0.9rem" }}
                      className="font-bold text-sm text-slate-700"
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
                      // style={{
                      //   width: "80px",
                      //   padding: "8px",
                      //   borderRadius: "4px",
                      //   border: "1px solid #cbd5e1",
                      //   textAlign: "right",
                      // }}
                      className="w-20 p-2 border border-slate-300 rounded text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span
                      // style={{ fontWeight: "bold" }}
                      className="font-bold text-slate-700"
                    >
                      대
                    </span>
                  </div>

                  {/* 통합 출고 버튼 */}
                  <button
                    onClick={() => handleDispatch(product)}
                    // style={{
                    //   padding: "10px 20px",
                    //   backgroundColor: "#3b82f6",
                    //   color: "white",
                    //   border: "none",
                    //   borderRadius: "4px",
                    //   cursor: "pointer",
                    //   fontWeight: "bold",
                    // }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors shadow active:scale-[0.98] cursor-pointer"
                  >
                    생산
                  </button>
                </div>
              </div>

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
                  // style={{
                  //   position: "absolute",
                  //   top: "-10px",
                  //   right: "-10px",
                  //   backgroundColor: "#ef4444",
                  //   color: "white",
                  //   border: "none",
                  //   borderRadius: "50%",
                  //   width: "24px",
                  //   height: "24px",
                  //   cursor: "pointer",
                  //   fontWeight: "bold",
                  //   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  //   display: "flex",
                  //   alignItems: "center",
                  //   justifyContent: "center",
                  // }}
                  className="ml-4 bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 cursor-pointer text-sm whitespace-nowrap"
                >
                  삭제
                </button>
              )}

              {/* 사용자가 수량을 입력하면 총 소모량을 미리 계산해서 보여줌 */}
              {currentAmount > 0 && (
                <p
                  // style={{
                  //   marginTop: "10px",
                  //   fontSize: "0.8rem",
                  //   color: "#ef4444",
                  // }}
                  className="mt-3 text-xs text-rose-500 font-medium"
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
