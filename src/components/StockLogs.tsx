// 입출고 기록 컴포넌트

import { useState } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";

export const StockLogs = () => {
  // Zustand에서 로그 리스트와 자재 마스터 정보를 모두 가져옴
  const { logs, items, cancelLog } = useInventoryStore();

  // 필터 및 검색 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, IN(입고), OUT(출고)

  // 최신순으로 정렬 + 검색/필터 적용
  const displayLogs = logs
    .map((log) => {
      // 자재 이름을 검색에 활용하기 위해 미리 찾아서 합치기
      const targetItem = items.find((i) => i.id === log.itemId);
      return { ...log, itemName: targetItem?.name || "삭제된 자재" };
    })
    .filter((log) => {
      // 검색 및 필터 로직
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        log.itemName.toLowerCase().includes(searchLower) ||
        (log.productName || "").toLowerCase().includes(searchLower) ||
        (log.lotNo || "").toLowerCase().includes(searchLower);

      const matchesType = filterType === "ALL" || log.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.id.localeCompare(a.id))
    // 보여주는 개수를 10개에서 30개로 증가
    .slice(0, 30);

  // 날짜 형식을 [2026/03/23 13:03:22] 형태로 변환하는 함수
  const formatStockDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(" ");
      if (parts.length < 5) return dateStr;

      const year = parts[0].replace(".", "");
      const month = parts[1].replace(".", "").padStart(2, "0");
      const day = parts[2].replace(".", "").padStart(2, "0");

      const ampm = parts[3]; // "오전" 또는 "오후"
      const timeParts = parts[4].split(":"); // [1, 03, 22]

      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const seconds = timeParts[2];

      // 오전/오후를 24시간제로 변환
      if (ampm === "오후" && hours < 12) hours += 12;
      if (ampm === "오전" && hours === 12) hours = 0;

      const formattedHours = String(hours).padStart(2, "0");

      return `${year}/${month}/${day} ${formattedHours}:${minutes}:${seconds}`;
    } catch (e) {
      console.log("날짜 변환 중 에러 발생 : ", e);
      return dateStr; // 에러 시 원본 출력
    }
  };

  // 필터 버튼을 변수로 분리하여 재사용성 강화
  const filterButtons = (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
      {["ALL", "IN", "OUT"].map((type) => {
        const unselectedStyle = "text-slate-500 hover:text-slate-700";
        let selectedStyle = "";
        if (type === "ALL") selectedStyle = "bg-white text-slate-900 shadow-sm";
        else if (type === "IN")
          selectedStyle = "bg-blue-500 text-white shadow-sm";
        else if (type === "OUT")
          selectedStyle = "bg-red-500 text-white shadow-sm";

        return (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterType === type ? selectedStyle : unselectedStyle
            }`}
          >
            {type === "ALL" ? "전체" : type === "IN" ? "입고" : "출고"}
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="stock-logs" className="mt-10">
      {/* 반응형 레이아웃 분리 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* 모바일 상단 (제목 + 필터) / PC 좌측 (제목) */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <h2 className="m-0 text-xl font-bold whitespace-nowrap">
            📜 최근 입출고 기록
          </h2>
          {/* 모바일에서만 보이는 필터 버튼 */}
          <div className="md:hidden">{filterButtons}</div>
        </div>

        {/* 모바일 하단 (검색창) / PC 우측 (필터 + 검색창) */}
        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
          {/* PC에서만 보이는 필터 버튼 */}
          <div className="hidden md:block">{filterButtons}</div>
          <input
            type="text"
            placeholder="자재 / 제품 / Lot 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded border border-slate-300 bg-white w-full md:w-64 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* 스크롤 가능한 로그 박스 */}
      <div className="max-h-[300px] overflow-y-auto bg-slate-100 p-4 rounded-lg border border-slate-300 mt-4">
        {/* 데이터가 없을 때 보여줄 안내 문구 */}
        {displayLogs.length === 0 && (
          <p className="text-slate-500 italic text-center py-5">
            입출고 내역이 없습니다.
          </p>
        )}

        {/* 타임라인 세로 선 */}
        <div className="flex flex-col relative border-l-2 border-slate-300 ml-2 pl-4">
          {/* 최신순으로 정렬된 로그를 하나씩 화면에 출력 */}
          {displayLogs.map((log) => {
            // 데이터 조회
            const itemName = log.itemName;
            const isIncoming = log.type === "IN";

            return (
              <div key={log.id} className="relative">
                {/* 타임라인 동그라미 점 */}
                <div
                  className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-slate-100 ${
                    isIncoming ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                <div
                  className={`text-sm py-2.5 border-b border-slate-300 last:border-0 flex justify-between items-center transition-colors hover:bg-slate-200 ${
                    isIncoming ? "text-emerald-800" : "text-red-800"
                  }`}
                >
                  <div className="flex-1">
                    {/* 발생 시간 / 담당자 정보 */}
                    <div className="mb-0.5">
                      <strong className="text-slate-700">
                        [{formatStockDate(log.timestamp)}] [{log.handler}]
                      </strong>
                      {/* 완제품 출고 시 어떤 제품 때문인지 표시 */}
                      <div>
                        {log.productName && (
                          <span className="ml-2 text-[0.65rem] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                            {log.productName}
                            {/* Lot No가 있을 때만 추가 표시 */}
                            {log.lotNo && (
                              <span className="ml-2 text-[0.65rem] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                                {log.lotNo}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 입출고 내역 */}
                    <div className="text-slate-700">
                      {itemName} {log.type === "IN" ? "입고 " : "출고 "}:{" "}
                      <span className="font-bold">
                        {log.quantity.toLocaleString()}
                      </span>
                      ea
                    </div>
                  </div>

                  {/* 기록 취소 버튼 */}
                  <button
                    onClick={() => {
                      // 실수를 방지하기 위한 안전장치
                      if (
                        window.confirm(
                          `[${itemName}]의 해당 내역을 취소하고 재고를 원상복구하시겠습니까?`,
                        )
                      ) {
                        cancelLog(log.id);
                      }
                    }}
                    className="ml-2 px-2 py-1 bg-white text-red-500 border border-red-500 rounded text-[0.75rem] font-bold cursor-pointer hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    취소
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
