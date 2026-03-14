// 엑셀로 내보내는 유틸

import * as XLSX from "xlsx";
import type { InventoryItem, StockLog } from "../types/inventory";

// 자재 현황과 입출고 기록을 한번에 엑셀로 내보내기
export const exportFullInventoryReport = (
  items: InventoryItem[],
  logs: StockLog[]
) => {
  // 자재 현황
  const inventoryData = items.map((item) => ({
    "자재 ID": item.id,
    자재명: item.name,
    "규격/스펙": item.spec,
    "현재 재고": item.currentStock,
    단위: item.unit,
    "안전 재고": item.safetyStock || 100,
    상태:
      item.currentStock <= (item.safetyStock || 100) ? "⚠️재고부족" : "정상",
  }));

  // 입출고 기록
  const historyData = logs
    .map((log) => {
      // 🔍 로그의 itemId로 자재 리스트에서 이름을 찾아옵니다.
      const targetItem = items.find((i) => i.id === log.itemId);

      return {
        일시: log.timestamp,
        자재명: targetItem ? targetItem.name : "삭제된 자재", // 이름 연결
        구분: log.type === "IN" ? "입고" : "출고",
        수량: log.quantity, // quantity로 이름 맞춤
        담당자: log.handler,
      };
    })
    .reverse(); // 최신 기록이 위로 오게 정렬

  // 워크북
  const workbook = XLSX.utils.book_new();

  // 각 시트 생성
  const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
  const historySheet = XLSX.utils.json_to_sheet(historyData);

  // 시트들 추가
  XLSX.utils.book_append_sheet(workbook, inventorySheet, "자재현황");
  XLSX.utils.book_append_sheet(workbook, historySheet, "입출고 기록");

  // 파일 생성 및 다운로드
  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `자재관리_${date}.xlsx`);
};
