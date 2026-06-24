import { useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import crossIcon from "../assets/crossIcon.svg";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { InventoryItem } from "../types/inventory";

interface MaterialDetailModalProps {
  item: InventoryItem | null; // 클릭한 자재 정보
  isOpen: boolean; // 모달 열림 여부
  onClose: () => void; // 닫기 함수
}

export const MaterialDetailModal = ({
  item,
  isOpen,
  onClose,
}: MaterialDetailModalProps) => {
  const { logs } = useInventoryStore();

  // ESC 키를 누르면 모달이 닫힘
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 모달이 열려있을 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      // 모달이 열리면 배경의 스크롤을 숨기고 고정
      document.body.style.overflow = "hidden";
    } else {
      // 모달이 닫히면 다시 원래대로
      document.body.style.overflow = "unset";
    }

    // 클린업 함수: 혹시라도 모달이 갑자기 강제 종료될 때를 대비
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]); // isOpen 상태가 변할 때마다 이 로직이 실행

  if (!isOpen || !item) return null;

  // 해당 자재의 로그만 필터링 (StockLog의 itemId 활용)
  const materialLogs = logs.filter((log) => log.itemId === item.id);

  // 시간순으로 오름차순 정렬 (왼쪽이 과거, 오른쪽이 최신)
  const sortedLogs = [...materialLogs].sort((a, b) => {
    const timeA = parseInt(a.id.split("-")[1]);
    const timeB = parseInt(b.id.split("-")[1]);
    return timeA - timeB;
  });

  // 재고량 역산 시간 계산기
  // 현재 재고를 기준으로 과거 로그를 거슬러 올라가며 그 시점의 재고를 계산
  let tempStock = item.currentStock;
  const historyWithStock = [];

  // 최신 로그부터 과거로 거꾸로 내려가면서 계산
  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    const log = sortedLogs[i];

    // id에서 타임스탬프 추출
    const safeTimestamp = parseInt(log.id.split("-")[1]);

    // 현재 시점의 재고를 기록 (unshift로 배열 맨 앞에 넣어서 다시 과거->최신 순서로 정렬)
    historyWithStock.unshift({
      timestamp: safeTimestamp, // NaN 방지용 안전한 타임스탬프 저장
      quantity: log.quantity,
      type: log.type,
      stockAfter: tempStock,
    });

    // 다음 과거 시점을 구하기 위해 행동을 '반대로' 되돌림 (입고였으면 빼고, 출고였으면 더함)
    if (log.type === "IN") {
      tempStock -= log.quantity;
    } else {
      tempStock += log.quantity;
    }
  }

  // 최근 10건만 잘라내기
  const recentHistory = historyWithStock.slice(-10);

  // Recharts용 데이터 가공
  const chartData = recentHistory.map((data) => {
    const date = new Date(data.timestamp);
    return {
      날짜: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`,
      재고량: data.stockAfter,
    };
  });

  // 로그가 없을 경우 초기 재고 표기
  const displayData =
    chartData.length > 0
      ? chartData
      : [{ 날짜: "현재", 재고량: item.currentStock }];

  return (
    // 배경을 덮는 딤(Dim) 처리 영역
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 모달창 흰색 박스 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{item.name}</h2>
            <p className="text-sm text-slate-500 mt-1">자재코드: {item.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-50 transition-colors cursor-pointer group"
          >
            <img
              src={crossIcon}
              alt="닫기"
              className="w-7 h-7 opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </button>
        </div>

        {/* 모달 본문 (차트 영역) */}
        <div className="p-6">
          {/* 요약 위젯 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600 mb-1">현재 재고</p>
              <p className="text-2xl font-black text-slate-800">
                {item.currentStock}{" "}
                <span className="text-sm font-normal">{item.unit}</span>
              </p>
            </div>
            <div className="flex-1 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-600 mb-1">
                안전 재고
              </p>
              <p className="text-2xl font-black text-slate-800">
                {item.safetyStock ?? 100}{" "}
                <span className="text-sm font-normal">{item.unit}</span>
              </p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-600 mb-4">
            최근 10건 재고 변동 추이
          </h3>

          {/* Recharts 차트 조립 구역 */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={displayData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                {/* 배경 점선 그리드 */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                {/* X축 (실제 시간) */}
                <XAxis
                  dataKey="날짜"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickMargin={10}
                  // 초 단위 삭제
                  tickFormatter={(timeStr) => timeStr.slice(0, -3)}
                />
                {/* Y축 (수량) */}
                <YAxis stroke="#94a3b8" fontSize={12} />
                {/* 마우스 올렸을 때 뜨는 툴팁 */}
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => {
                    const isDanger = value <= (item.safetyStock ?? 100);
                    return [
                      <span
                        className={
                          isDanger
                            ? "text-rose-600 font-black"
                            : "text-slate-700 font-bold"
                        }
                      >
                        {Number(value).toLocaleString()}{" "}
                        <span className="font-normal text-sm">{item.unit}</span>
                      </span>,
                      "재고량",
                    ];
                  }}
                  // 초 단위 삭제 시 주석 해제
                  //   labelFormatter={(label) =>
                  //     typeof label === "string" ? label.slice(0, -3) : label
                  //   }
                />
                {/* 안전재고 기준선 (빨간 점선) */}
                <ReferenceLine
                  y={item.safetyStock ?? 100}
                  label="안전재고"
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
                {/* 실제 데이터를 그리는 꺾은선 */}
                <Line
                  type="monotone" // 부드러운 곡선
                  dataKey="재고량"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  animationDuration={1500} // 등장 애니메이션 시간 (1.5초)
                  // 평소에 보이는 점(Dot) 커스텀: 안전재고 이하면 빨간점, 아니면 파란 테두리 흰점
                  dot={(props: any) => {
                    const { cx, cy, payload, key } = props;
                    const isDanger =
                      payload.재고량 <= (item.safetyStock ?? 100);
                    return (
                      <circle
                        key={key}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={isDanger ? "#ef4444" : "#ffffff"}
                        stroke={isDanger ? "#ef4444" : "#3b82f6"}
                        strokeWidth={2}
                      />
                    );
                  }}
                  // 마우스 올렸을 때 커지는 점(ActiveDot)
                  activeDot={(props: any) => {
                    const { cx, cy, payload, key } = props;
                    const isDanger =
                      payload.재고량 <= (item.safetyStock ?? 100);
                    return (
                      <circle
                        key={key}
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={isDanger ? "#ef4444" : "#3b82f6"}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
