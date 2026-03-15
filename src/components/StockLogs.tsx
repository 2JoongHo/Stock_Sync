// 입출고 기록 컴포넌트

import { useInventoryStore } from "../stores/useInventoryStore";

export const StockLogs = () => {
  // Zustand에서 로그 리스트와 자재 마스터 정보를 모두 가져옴
  const { logs, items, cancelLog } = useInventoryStore();

  return (
    <section style={{ marginTop: "40px" }}>
      <h2>📜 최근 입출고 기록</h2>

      {/* 스크롤 가능한 로그 박스 */}
      <div
        style={{
          maxHeight: "300px", // 로그가 많아지면 박스 안에서만 스크롤되도록 고정
          overflowY: "auto",
          backgroundColor: "#f1f5f9",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
        }}
      >
        {/* 데이터가 없을 때 보여줄 안내 문구 */}
        {logs.length === 0 && (
          <p style={{ color: "#64748b" }}>아직 기록이 없습니다.</p>
        )}

        {/* 최신순으로 정렬된 로그를 하나씩 화면에 출력 */}
        {logs.map((log) => {
          // 데이터 조회
          // 만약 삭제된 자재라면 "삭제된 자재"라고 표시하여 오류를 방지
          const itemName =
            items.find((i) => i.id === log.itemId)?.name || "삭제된 자재";

          return (
            <div
              key={log.id} // 리스트 렌더링을 위한 고유 키값
              style={{
                fontSize: "0.9rem",
                padding: "8px 0",
                borderBottom: "1px solid #cbd5e1",
                display: "flex",
                justifyContent: "space-between",
                // 입고(IN)는 초록색, 출고(OUT)는 빨간색
                color: log.type === "IN" ? "#166534" : "#991b1b",
              }}
            >
              <div style={{ flex: 1 }}>
                {/* 발생 시간 / 담당자 정보 */}
                <span>
                  <strong>[{log.timestamp}]</strong> {log.handler}
                </span>

                {/* 입출고 내역 */}
                <span>
                  {itemName} {log.type === "IN" ? "입고" : "출고"}:{" "}
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
                      `[${itemName}]의 해당 내역을 취소하고 재고를 원상복구하시겠습니까?`,
                    )
                  ) {
                    cancelLog(log.id);
                  }
                }}
                style={{
                  marginLeft: "10px",
                  padding: "4px 8px",
                  backgroundColor: "#fff",
                  color: "#ef4444",
                  border: "1px solid #ef4444",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
              >
                취소
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
