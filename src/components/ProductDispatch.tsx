// 완제품 단위 출고 컴포넌트

import { useState } from "react";
import { InventorySearch } from "../components/InventorySearch";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { Product } from "../types/inventory";

export const ProductDispatch = () => {
  // Zustand에서 완제품 목록(products)과 생산 실행 함수를 가져옴
  const { products, items, dispatchProduct, removeProduct } =
    useInventoryStore();

  // 편집모드 상태
  const [isEditMode, setIsEditMode] = useState(false);

  // 펼쳤을 때 상태
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  // 각 제품별 생산 수량을 관리하기 위한 바구니 (ID별로 수량 저장)
  const [amounts, setAmounts] = useState<{ [key: string]: number | undefined }>(
    {},
  );

  // 개별 제품의 수량을 변경하는 함수
  const handleAmountChange = (productId: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setAmounts((prev) => ({ ...prev, [productId]: numValue }));
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

    // 입력창을 다시 placeholder로 초기화
    setAmounts((prev) => ({ ...prev, [product.id]: undefined }));
  };

  // 검색 로직: 상황실에 있는 모든 완제품 중 검색어에 맞는 것만 필터링
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section>
      <div className="flex justify-between mb-5 items-center">
        <h2 className="mt-0 text-xl font-bold text-slate-900 flex items-center gap-2">
          📦 완제품 출고
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {/* 편집모드 버튼 */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-9 px-3 py-1.5 rounded font-bold text-xs transition-colors cursor-pointer text-white ${isEditMode ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {isEditMode ? "수정완료" : "수정하기"}
            </button>
          </div>

          {/* 검색창 연결 */}
          <InventorySearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-slate-500 text-center py-5">
          {searchTerm
            ? "검색 결과와 일치하는 완제품이 없습니다."
            : "등록된 완제품이 없습니다. 제품을 먼저 등록해주세요."}
        </p>
      ) : (
        filteredProducts.map((product) => {
          const currentAmount = amounts[product.id] || "";

          return (
            <div
              key={product.id}
              className="flex flex-col p-4 mb-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 text-lg">
                      {product.name}
                    </span>
                    <div className="text-[0.7rem] text-slate-400 mt-0.5">
                      {product.id}
                    </div>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === product.id ? null : product.id,
                        )
                      }
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 cursor-pointer bg-blue-50 px-2 py-1 rounded"
                    >
                      {expandedId === product.id
                        ? "▲ 제품 구성"
                        : "▼ 제품 구성"}
                    </button>
                  </div>

                  {/* 생산 수량 입력 및 버튼 (한 줄로 정렬) */}
                  <div className="flex flex-wrap gap-4 items-center mt-2">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`qty-${product.id}`}
                        className="font-bold text-sm text-slate-700"
                      >
                        생산 수량 :
                      </label>
                      <input
                        id={`qty-${product.id}`}
                        type="number"
                        placeholder="수량"
                        min="1"
                        value={currentAmount}
                        // 입력창에 타이핑하면 숫자로 변환하여 해당 제품 ID의 수량으로 저장
                        onChange={(e) =>
                          handleAmountChange(product.id, e.target.value)
                        }
                        className="w-20 p-2 border border-slate-300 rounded text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="font-bold text-slate-700">대</span>
                    </div>
                    <button
                      onClick={() => handleDispatch(product)}
                      className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow active:scale-[0.98] cursor-pointer text-sm"
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
                    className="ml-4 bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 cursor-pointer text-sm whitespace-nowrap"
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 제품 구성 상세 리스트 (클릭 시에만 보임) */}
              {expandedId === product.id && (
                <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-2">
                    {product.bom.map((b) => {
                      const material = items.find((i) => i.id === b.materialId);
                      return (
                        <div
                          key={b.materialId}
                          className="flex justify-between text-sm py-1 border-b border-slate-200 border-dashed"
                        >
                          <span className="text-slate-600">
                            • {material?.name || "알 수 없는 자재"}
                          </span>
                          <span className="font-medium text-slate-900">
                            {b.quantity} ea
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
};
