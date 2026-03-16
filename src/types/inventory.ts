// 재고 아이템 하나의 형태
export interface InventoryItem {
  id: string; // 고유 번호
  name: string; // 자재명
  spec: string; // 규격 (ex: sus304)
  category: string; // 분류
  currentStock: number; // 현재 수량
  unit: string; // 단위
  location?: string; // 위치 (정하지 않아도 됨)
  safetyStock?: number; // 개별 위험 재고 기준 (없으면 일괄 기준 적용)
}

// 입출고 로그 형태
export interface StockLog {
  id: string;
  itemId: string;
  type: "IN" | "OUT"; // 입고 / 출고
  quantity: number; // 수량
  timestamp: string; // 발생 시간
  handler: string; // 담당자
}

// BOM 단위 Item
export interface BOMItem {
  materialId: string; // 자재 ID
  quantity: number; // 수량
}

// 완제품 단위
export interface Product {
  id: string;
  name: string; // 완제품명
  bom: BOMItem[]; // 자재 리스트
}
