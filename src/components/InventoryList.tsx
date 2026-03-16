// 자재 현황 리스트 컴포넌트

import { useState } from "react";
import downloadIcon from "../assets/downloadIcon.svg";
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
      item.spec.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 입출고 실행 함수
  const handleManualUpdate = (itemId: string, type: "IN" | "OUT") => {
    // 특정 자재의 입력창을 ID로 직접 찾아옴 (DOM 접근)
    const inputElement = document.getElementById(
      `input-${itemId}`,
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
    <section className="mt-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="m-0 text-xl font-bold text-slate-900 flex items-center gap-2">
          📊 실시간 자재 현황
        </h2>

        {/* 오른쪽 정렬 그룹: 엑셀버튼 + 수정버튼 + 검색창 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* 엑셀 내보내기 버튼 */}
            <button
              onClick={() => exportFullInventoryReport(items, logs)}
              className="flex items-center justify-center w-9 h-9 bg-emerald-500 text-white rounded font-bold cursor-pointer hover:bg-emerald-600 transition-all shadow-sm"
            >
              <img
                src={downloadIcon}
                alt="download"
                className="w-5 h-5 invert"
              />
            </button>

            {/* 자재 관리 모드 버튼 */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-9 px-4 rounded font-bold text-xs transition-colors cursor-pointer text-white ${isEditMode ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {isEditMode ? "수정완료" : "수정하기"}
            </button>
          </div>

          {/* 검색창 */}
          <InventorySearch value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* 필터링된 결과가 0개일 때와 있을 때를 나누어 화면을 그림 (조건부 렌더링) */}
      {filteredItems.length === 0 ? (
        <p className="text-center text-slate-500 py-5">
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
              className={`mb-4 p-4 flex items-center justify-between rounded-lg border transition-all ${isLowStock ? "bg-rose-50 border-rose-300 border-2" : "bg-white border-slate-200"}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900">{item.name}</strong>
                  {/* 재고가 위험 기준치 이하면 경고 배지를 보여줌 */}
                  {isLowStock && (
                    <span className="bg-rose-600 text-white text-[0.7rem] px-1.5 py-0.5 rounded font-bold">
                      재고부족
                    </span>
                  )}
                </div>
                <small className="text-slate-500 text-xs">
                  {/* 규격 | 제품코드 */}
                  {item.spec} | {item.id}
                </small>{" "}
                <div className="mt-1">
                  <span className="text-medium text-slate-600">현 재고: </span>
                  <strong
                    className={`text-xl ${isLowStock ? "text-rose-600" : "text-slate-900"}`}
                  >
                    {item.currentStock}
                  </strong>
                  <span className="text-sm text-slate-600 ml-1">
                    {item.unit}
                  </span>
                </div>
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
                  className="bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 cursor-pointer text-sm"
                >
                  삭제
                </button>
              ) : (
                // 일반 모드일 때는 입출고 입력창 노출
                <div className="flex gap-2">
                  <input
                    id={`input-${item.id}`}
                    type="number"
                    placeholder="수량"
                    className="w-20 p-1.5 border border-slate-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleManualUpdate(item.id, "IN")}
                    className="bg-emerald-500 text-white px-3 py-2 rounded font-bold hover:bg-emerald-600 cursor-pointer text-sm"
                  >
                    입고
                  </button>
                  <button
                    onClick={() => handleManualUpdate(item.id, "OUT")}
                    className="bg-red-500 text-white px-3 py-2 rounded font-bold hover:bg-red-600 cursor-pointer text-sm"
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
