// 입출고 기록 컴포넌트

import { useInventoryStore } from "../stores/useInventoryStore";

export const StockLogs = () => {
  // Zustand에서 로그 리스트와 자재 마스터 정보를 모두 가져옴
  const { logs, items, cancelLog } = useInventoryStore();

  return (
    <section className="mt-10">
      <h2 className="m-0 text-xl font-bold">📜 최근 입출고 기록</h2>

      {/* 스크롤 가능한 로그 박스 */}
      <div className="max-h-[300px] overflow-y-auto bg-slate-100 p-4 rounded-lg border-slate-300">
        {/* 데이터가 없을 때 보여줄 안내 문구 */}
        {logs.length === 0 && (
          <p className="text-slate-500 italic">입출고 내역이 없습니다.</p>
        )}

        <div className="flex flex-col">
          {/* 최신순으로 정렬된 로그를 하나씩 화면에 출력 */}
          {logs.map((log) => {
            // 데이터 조회
            // 만약 삭제된 자재라면 "삭제된 자재"라고 표시하여 오류를 방지
            const itemName =
              items.find((i) => i.id === log.itemId)?.name || "삭제된 자재";
            const isIncoming = log.type === "IN";

            return (
              <div
                key={log.id} // 리스트 렌더링을 위한 고유 키값
                className={`text-sm py-2.5 border-b border-slate-300 last:border-0 flex justify-between items-center transition-colors hover:bg-slate-200 ${isIncoming ? "text-emerald-800" : "text-red-800"}`}
              >
                <div className="flex-1">
                  {/* 발생 시간 / 담당자 정보 */}
                  <span>
                    <strong>
                      [{log.timestamp}] [{log.handler}]{" "}
                    </strong>
                  </span>

                  {/* 입출고 내역 */}
                  <span>
                    {itemName} {log.type === "IN" ? "입고 " : "출고 "}:{" "}
                    {log.quantity}
                    ea
                  </span>
                </div>

                {/* 기록 취소 버튼 */}
                <button
                  onClick={() => {
                    // 실수를 방지하기 위한 안전장치
                    if (
                      window.confirm(
                        `[${itemName}]의 해당 내역을 취소하고 재고를 원상복구하시겠습니까?`
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
