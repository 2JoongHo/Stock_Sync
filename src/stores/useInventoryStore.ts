import { create } from "zustand";
import { supabase } from "../supabaseClient"; // 클라이언트 가져오기
import type { InventoryItem, Product, StockLog } from "../types/inventory";

interface InventoryState {
  items: InventoryItem[];
  logs: StockLog[];
  products: Product[];
  userName: string;
  setUserName: (name: string) => void;

  // DB에서 데이터 가져오기 (초기 로딩용)
  fetchInitialData: () => Promise<void>;

  // 자재 관련
  updateStock: (itemId: string, amount: number) => Promise<void>;
  addItem: (newItem: InventoryItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  // 완제품 관련
  addProduct: (newProduct: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  dispatchProduct: (product: Product, productAmount: number) => Promise<void>;

  // 로그 관련
  cancelLog: (logId: string) => Promise<void>;

  // 편집모드
  isEditMode: boolean;
  toggleEditMode: () => void;

  activeForm: "material" | "product" | null;
  setActiveForm: (form: "material" | "product" | null) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  logs: [],
  products: [],
  userName: localStorage.getItem("stocksync-user") || "", // 이름은 로컬에 저장

  setUserName: (name) => {
    localStorage.setItem("stocksync-user", name);
    set({ userName: name });
  },

  // 앱 시작 시 DB에서 데이터를 싹 긁어오는 함수
  fetchInitialData: async () => {
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .order("name");
    const { data: products } = await supabase.from("products").select("*");
    const { data: logs } = await supabase
      .from("logs")
      .select("*")
      .order("id", { ascending: false })
      .limit(100);

    set({
      items:
        items?.map((i) => ({
          ...i,
          currentStock: i.current_stock,
          safetyStock: i.safety_stock,
        })) || [], // DB 필드명 대응
      products: products || [],
      logs:
        logs?.map((l) => ({
          ...l,
          itemId: l.item_id,
          productName: l.product_name,
        })) || [],
    });
  },

  // 단일 자재 입출고 (DB 반영)
  updateStock: async (itemId, amount) => {
    const { items, userName } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item || (amount < 0 && item.currentStock + amount < 0)) return;

    const newStock = item.currentStock + amount;

    // DB의 자재 수량 업데이트
    await supabase
      .from("items")
      .update({ current_stock: newStock })
      .eq("id", itemId);

    // DB에 로그 추가
    await supabase.from("logs").insert([
      {
        id: `LOG-${Date.now()}`,
        item_id: itemId, // DB 이름표 사용
        type: amount > 0 ? "IN" : "OUT",
        quantity: Math.abs(amount),
        timestamp: new Date().toLocaleString(),
        handler: userName || "미지정",
      },
    ]);

    // 로컬 상태 갱신 (실시간성 확보)
    await get().fetchInitialData();
  },

  // 완제품 출고 (BOM 자동 차감)
  dispatchProduct: async (product, productAmount) => {
    const { items, userName } = get();

    // 재고 검증
    for (const bomInfo of product.bom) {
      const item = items.find((i) => i.id === bomInfo.materialId);
      const totalRequired = bomInfo.quantity * productAmount;
      if (!item || item.currentStock < totalRequired) {
        alert(`재고 부족: [${item?.name}]`);
        return;
      }
    }

    // 자재 차감 및 로그 생성 공정
    for (const bomInfo of product.bom) {
      const item = items.find((i) => i.id === bomInfo.materialId)!;
      const deduction = bomInfo.quantity * productAmount;
      const newStock = item.currentStock - deduction;

      await supabase
        .from("items")
        .update({ current_stock: newStock })
        .eq("id", item.id);

      // DB 업데이트
      await supabase.from("logs").insert([
        {
          id: `LOG-${Date.now()}-${item.id}`,
          item_id: item.id,
          product_name: product.name, // DB 이름표 사용
          type: "OUT",
          quantity: deduction,
          timestamp: new Date().toLocaleString(),
          handler: userName || "미지정",
        },
      ]);
    }

    await get().fetchInitialData();
  },

  // 완제품 추가
  addProduct: async (newProduct) => {
    await supabase.from("products").insert([newProduct]);
    await get().fetchInitialData();
  },

  // 자재 추가 (기존 setItems 대체용)
  addItem: async (newItem) => {
    await supabase.from("items").insert([
      {
        id: newItem.id,
        name: newItem.name,
        spec: newItem.spec,
        current_stock: newItem.currentStock,
        unit: newItem.unit,
        category: newItem.category,
        safety_stock: newItem.safetyStock,
      },
    ]);
    await get().fetchInitialData();
  },

  removeItem: async (itemId) => {
    await supabase.from("items").delete().eq("id", itemId);
    await get().fetchInitialData();
  },

  removeProduct: async (productId) => {
    await supabase.from("products").delete().eq("id", productId);
    await get().fetchInitialData();
  },

  cancelLog: async (logId) => {
    const { logs, items } = get();
    const targetLog = logs.find((l) => l.id === logId);
    if (!targetLog) return;

    const recovery =
      targetLog.type === "IN" ? -targetLog.quantity : targetLog.quantity;
    const item = items.find((i) => i.id === targetLog.itemId);

    if (item) {
      await supabase
        .from("items")
        .update({ current_stock: item.currentStock + recovery })
        .eq("id", item.id);
      await supabase.from("logs").delete().eq("id", logId);
    }
    await get().fetchInitialData();
  },

  isEditMode: false,
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

  activeForm: null,
  setActiveForm: (form) =>
    set((state) => ({
      activeForm: state.activeForm === form ? null : form,
    })),
}));
