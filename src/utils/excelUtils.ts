// 엑셀로 내보내는 유틸

import * as XLSX from "xlsx";
import type { InventoryItem, StockLog } from "../types/inventory";

interface ExcelRow {
  제품명?: string;
  제품코드?: string;
  "현재 재고"?: number;
  단위?: string;
  규격?: string;
  "규격/스펙"?: string;
  카테고리?: string;
  "안전 재고"?: number;
}

// 자재 현황과 입출고 기록을 한번에 엑셀로 내보내기
export const exportFullInventoryReport = (
  items: InventoryItem[],
  logs: StockLog[],
) => {
  // 오늘 날짜
  const now = new Date();
  const today = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}.`;

  // 당일 발생한 입출고 내역만 필터링
  const todayLogs = logs.filter((log) => {
    // timestamp에서 날짜 부분만 가져와서 숫자 빼고 다 지우기 (예: 20260317)
    const logDate = log.timestamp.split("오")[0].trim();
    return logDate === today;
  });

  // 자재 현황
  const inventoryData = items.map((item) => ({
    제품명: item.name,
    제품코드: item.id,
    "현재 재고": item.currentStock,
    단위: item.unit,
    규격: item.spec,
    // "안전 재고": item.safetyStock || 100,
    상태: item.currentStock <= (item.safetyStock || 100) ? "재고부족" : "정상",
  }));

  // 입출고 기록
  const historyData = todayLogs
    .map((log) => {
      // 로그의 itemId로 자재 리스트에서 이름을 찾아옵니다.
      const targetItem = items.find((i) => i.id === log.itemId);

      return {
        날짜: log.timestamp,
        자재명: targetItem ? targetItem.name : "삭제된 자재",
        제품코드: targetItem ? targetItem.id : log.itemId,
        구분: log.type === "IN" ? "입고" : "출고",
        수량: log.quantity,
        완제품명: log.productName || "",
        담당자: log.handler || "미지정",
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

// 엑셀 파일을 읽어서 자재 데이터 끌고오기
export const importInventoryFromExcel = (
  file: File,
): Promise<InventoryItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
        const worksheet = workbook.Sheets[sheetName];

        // 시트 데이터를 JSON 객체 배열로 반환
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 엑셀 한글 헤더명을 매핑
        const mappedData: InventoryItem[] = (jsonData as ExcelRow[]).map(
          (row) => ({
            id: String(row["제품코드"] || "-"),
            name: String(row["제품명"] || "이름없음"),
            spec: String(row["규격"] || "-"),
            currentStock: Number(row["현재 재고"]) || 0,
            unit: String(row["단위"] || "ea"),
            category: String(row["카테고리"] || "미분류"),
            safetyStock: Number(row["안전 재고"]) || 100,
          }),
        );

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
