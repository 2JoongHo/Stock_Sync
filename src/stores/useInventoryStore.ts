import { create } from "zustand";
import { persist } from "zustand/middleware"; // 로컬저장을 위한 미들웨어
import type { InventoryItem, Product, StockLog } from "../types/inventory";

// StockSync 중앙 상태 관리(Store) 인터페이스
interface InventoryState {
  items: InventoryItem[]; // 자재 마스터 데이터
  logs: StockLog[]; // 입출고 이력 데이터
  products: Product[]; // 완제품 리스트
  // 담당자 이름
  userName: string;
  // 담당자 이름 설정 함수
  setUserName: (name: string) => void;
  setProducts: (newProducts: Product[]) => void; // 완제품 설정 함수
  // 자재 리스트 초기화 또는 일괄 업데이트
  setItems: (newItems: InventoryItem[]) => void;
  // 단일 자재 수동 입출고
  updateStock: (itemId: string, amount: number) => void;
  // BOM 기반 완제품 단위 통합 출고
  dispatchProduct: (product: Product, productAmount: number) => void;
  // 완제품 추가 함수
  addProduct: (newProduct: Product) => void;
  // 자재 삭제 함수
  removeItem: (itemId: string) => void;
  // 완제품 삭제 함수
  removeProduct: (productId: string) => void;
  // 로그 삭제 함수
  cancelLog: (logId: string) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      // 초기 상태
      items: [],
      logs: [],
      products: [],
      userName: "",
      setUserName: (name) => set({ userName: name }),
      setProducts: (newProducts) => set({ products: newProducts }),

      // 자재 마스터 데이터 설정
      setItems: (newItems) => set({ items: newItems }),

      /**
       * 단일 자재 입출고 처리
       * @param itemId 자재 고유 ID
       * @param amount 증감 수량 (입고: +, 출고: -)
       */
      updateStock: (itemId, amount) =>
        set((state) => {
          const item = state.items.find((i) => i.id === itemId);
          if (!item) return state; // 자재가 없으면 상태 변경 없음

          // 가용 재고 검증: 출고 시 현재 재고보다 많은 양을 뺄 수 없음
          if (amount < 0 && item.currentStock + amount < 0) {
            alert(`${item.name}의 재고가 부족하여 출고할 수 없습니다.`);
            return state;
          }

          // 이력 추적을 위한 로그 객체 생성
          const newLog: StockLog = {
            id: `LOG-${Date.now()}`,
            itemId: itemId,
            type: amount > 0 ? "IN" : "OUT",
            quantity: Math.abs(amount),
            timestamp: new Date().toLocaleString(),
            handler: state.userName || "미지정",
          };

          return {
            // 불변성을 유지하며 해당 자재의 수량만 업데이트
            items: state.items.map((i) =>
              i.id === itemId
                ? { ...i, currentStock: i.currentStock + amount }
                : i
            ),
            // 최신 로그를 상단에 추가하고 최대 50개까지만 유지 (메모리 최적화)
            logs: [newLog, ...state.logs].slice(0, 50),
          };
        }),

      /**
       * 완제품 출고 시 연결된 모든 하위 자재를 자동으로 차감 (BOM)
       * @param product 완제품 정보 (내부에 BOM 리스트 포함)
       * @param productAmount 생산/출고할 완제품 수량
       */
      dispatchProduct: (product, productAmount) =>
        set((state) => {
          // 모든 구성 자재의 재고가 충분한지 먼저 전수 확인 (Atomic Check)
          for (const bomInfo of product.bom) {
            const item = state.items.find((i) => i.id === bomInfo.materialId);
            const totalRequired = bomInfo.quantity * productAmount; // 소요량 = 단위소요량 * 생산량

            if (!item || item.currentStock < totalRequired) {
              alert(
                `재고 부족: [${item?.name || "알 수 없는 자재"}]이(가) 부족하여 ${product.name} 출고가 취소되었습니다.`
              );
              return state; // 단 하나라도 부족하면 전체 취소함
            }
          }

          // 재고 차감 처리 및 각 자재별 로그 생성
          const newLogs: StockLog[] = [];
          const updatedItems = state.items.map((item) => {
            const bomInfo = product.bom.find((b) => b.materialId === item.id);

            if (bomInfo) {
              const totalDeduction = bomInfo.quantity * productAmount;

              // 각 자재별 출고 이력 생성
              newLogs.push({
                id: `LOG-BOM-${Date.now()}-${item.id}`,
                itemId: item.id,
                type: "OUT",
                quantity: totalDeduction,
                timestamp: new Date().toLocaleString(),
                productName: product.name,
                handler: state.userName || "미지정",
              });

              return {
                ...item,
                currentStock: item.currentStock - totalDeduction,
              };
            }
            return item; // BOM에 포함되지 않은 자재는 그대로 유지
          });

          return {
            items: updatedItems,
            logs: [...newLogs, ...state.logs].slice(0, 10),
          };
        }),

      // 완제품 추가 로직
      addProduct: (newProduct) =>
        set((state) => ({
          products: [...state.products, newProduct],
        })),

      // 자재 삭제 로직
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      // 완제품 삭제 로직
      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter(
            (product) => product.id !== productId
          ),
        })),

      // 로그 삭제 로직
      cancelLog: (logId) =>
        set((state) => {
          // 취소할 로그 찾기
          const targetLog = state.logs.find((log) => log.id === logId);
          if (!targetLog) return state;

          // 재고 원상복구 계산 (입고 취소는 -, 출고 취소는 +)
          const recoveryAmount =
            targetLog.type === "IN" ? -targetLog.quantity : targetLog.quantity;

          // 해당 자재의 재고 업데이트
          const updatedItems = state.items.map((item) =>
            item.id === targetLog.itemId
              ? { ...item, currentStock: item.currentStock + recoveryAmount }
              : item
          );

          // 로그 목록에서 해당 로그 삭제
          const updatedLogs = state.logs.filter((log) => log.id !== logId);

          return {
            items: updatedItems,
            logs: updatedLogs,
          };
        }),
    }),
    { name: "stocksync-storage" }
  )
);
