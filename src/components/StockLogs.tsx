// 입출고 기록 컴포넌트

import { useInventoryStore } from "../stores/useInventoryStore";

export const StockLogs = () => {
  // Zustand에서 로그 리스트와 자재 마스터 정보를 모두 가져옴
  const { logs, items, cancelLog } = useInventoryStore();

  // 최신순으로 정렬 후 역순으로 표기
  const displayLogs = [...logs]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 10);

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

  return (
    <section className="mt-10">
      <h2 className="m-0 text-xl font-bold">📜 최근 입출고 기록</h2>

      {/* 스크롤 가능한 로그 박스 */}
      <div className="max-h-[300px] overflow-y-auto bg-slate-100 p-4 rounded-lg border border-slate-300 mt-4">
        {/* 데이터가 없을 때 보여줄 안내 문구 */}
        {displayLogs.length === 0 && (
          <p className="text-slate-500 italic text-center py-5">
            입출고 내역이 없습니다.
          </p>
        )}

        <div className="flex flex-col">
          {/* 최신순으로 정렬된 로그를 하나씩 화면에 출력 */}
          {displayLogs.map((log) => {
            // 데이터 조회
            // 만약 삭제된 자재라면 "삭제된 자재"라고 표시하여 오류를 방지
            const targetItem = items.find((i) => i.id === log.itemId);
            const itemName = targetItem?.name || "삭제된 자재";
            const isIncoming = log.type === "IN";

            return (
              <div
                key={log.id} // 리스트 렌더링을 위한 고유 키값
                className={`text-sm py-2.5 border-b border-slate-300 last:border-0 flex justify-between items-center transition-colors hover:bg-slate-200 ${isIncoming ? "text-emerald-800" : "text-red-800"}`}
              >
                <div className="flex-1">
                  {/* 발생 시간 / 담당자 정보 */}
                  <div className="mb-0.5">
                    <strong className="text-slate-700">
                      [{formatStockDate(log.timestamp)}] [{log.handler}]
                    </strong>
                    {/* 완제품 출고 시 어떤 제품 때문인지 표시 */}
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
            );
          })}
        </div>
      </div>
    </section>
  );
};
