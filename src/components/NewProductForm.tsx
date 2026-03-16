// 완제품 및 BOM 등록 폼 컴포넌트

import { useState } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { BOMItem, Product } from "../types/inventory";

export const NewProductForm = () => {
  // Zustand에서 자재 목록(items)과 완제품 등록 함수(addProduct)를 가져옴
  const { items, addProduct } = useInventoryStore();

  // 폼 입력 상태 관리
  const [productName, setProductName] = useState(""); // 완제품 이름
  const [selectedMaterialId, setSelectedMaterialId] = useState(""); // 선택된 자재 ID
  const [materialQuantity, setMaterialQuantity] = useState<number>(0); // 선택된 자재의 소모량
  const [bomList, setBomList] = useState<BOMItem[]>([]); // 현재 조립 중인 BOM 리스트

  // BOM 리스트에 자재 추가
  const handleAddBOM = () => {
    if (!selectedMaterialId || materialQuantity <= 0) {
      return alert("자재를 선택하고 수량을 입력해주세요.");
    }

    // 이미 추가된 자재인지 확인
    if (bomList.find((b) => b.materialId === selectedMaterialId)) {
      return alert("이미 BOM에 추가된 자재입니다.");
    }

    const newItem: BOMItem = {
      materialId: selectedMaterialId,
      quantity: materialQuantity,
    };

    setBomList([...bomList, newItem]);
    setSelectedMaterialId(""); // 선택 초기화
    setMaterialQuantity(0); // 수량 초기화
  };

  // 최종 완제품 등록
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (!productName || bomList.length === 0) {
      return alert("제품명과 최소 하나 이상의 BOM 항목이 필요합니다.");
    }

    const newProduct: Product = {
      id: `PROD-${Date.now()}`, // 고유 번호 생성
      name: productName,
      bom: bomList,
    };

    addProduct(newProduct); // 저장

    // 폼 초기화
    setProductName("");
    setBomList([]);
    alert(`${productName}이(가) 등록되었습니다!`);
  };

  return (
    <section
      // style={{
      //   marginBottom: "30px",
      //   padding: "20px",
      //   backgroundColor: "#f1f5f9",
      //   borderRadius: "8px",
      // }}
      className="mb-8 p-5 bg-slate-100 rounded-lg"
    >
      <h2
        // style={{ marginTop: 0 }}
        className="mt-0 mb-4 text-xl font-bold text-slate-900"
      >
        ➕ 신규 제품 등록
      </h2>

      {/* 전체를 form으로 감싸고 onSubmit을 연결하여 엔터키 지원 */}
      <form onSubmit={handleSaveProduct}>
        {/* 제품명 입력 */}
        <div
          // style={{ marginBottom: "15px" }}
          className="mb-4"
        >
          <label
            // style={{
            //   display: "block",
            //   fontWeight: "bold",
            //   marginBottom: "5px",
            // }}
            className="block font-bold mb-1.5 text-slate-700"
          >
            제품명
          </label>
          <input
            type="text"
            placeholder="ONE TOUCH ROTATE"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            // style={{
            //   width: "100%",
            //   padding: "10px",
            //   borderRadius: "4px",
            //   border: "1px solid #cbd5e1",
            //   boxSizing: "border-box",
            // }}
            className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* BOM 구성 */}
        <div
          // style={{ marginBottom: "15px" }}
          className="mb-4"
        >
          <label
            // style={{
            //   display: "block",
            //   fontWeight: "bold",
            //   marginBottom: "5px",
            // }}
            className="block font-bold mb-1.5 text-slate-700"
          >
            자재 구성
          </label>
          <div
            // style={{ display: "flex", gap: "10px" }}
            className="flex gap-2.5"
          >
            {/* 자재 선택 */}
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              // style={{ flex: 2, padding: "8px" }}
              className="flex-[2] p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">자재 선택</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.spec})
                </option>
              ))}
            </select>

            {/* 수량 입력 */}
            <input
              type="number"
              placeholder="수량"
              value={materialQuantity}
              onChange={(e) => setMaterialQuantity(Number(e.target.value))}
              // style={{ flex: 1, padding: "8px" }}
              className="flex-[1] p-2 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* 추가 버튼 */}
            <button
              type="button"
              onClick={handleAddBOM}
              // style={{ padding: "8px 15px", cursor: "pointer" }}
              className="px-3 py-1.5 bg-blue-500 text-white rounded font-bold hover:bg-blue-900 cursor-pointer transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        <hr
          // style={{
          //   border: "0",
          //   borderTop: "1px solid #bfdbfe",
          //   margin: "20px 0",
          // }}
          className="border-0 border-t border-blue-200 my-5"
        />

        {/* 현재 추가된 BOM 목록 미리보기 */}
        <div
          // style={{
          //   backgroundColor: "white",
          //   padding: "10px",
          //   borderRadius: "4px",
          //   minHeight: "50px",
          //   marginBottom: "20px",
          //   border: "1px solid #cbd5e1",
          // }}
          className="bg-white p-3 rounded border border-slate-300 min-h-[50px] mb-5 shadow-inner"
        >
          <p
            // style={{
            //   margin: "0 0 10px 0",
            //   fontSize: "0.85rem",
            //   color: "#64748b",
            // }}
            className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            포함된 자재 리스트 :
          </p>
          {bomList.length === 0 && (
            <p
              // style={{ fontSize: "0.85rem", color: "#94a3b8" }}
              className="text-sm text-slate-400 italic"
            >
              자재를 선택해주세요
            </p>
          )}
          {bomList.map((bom, index) => {
            const material = items.find((i) => i.id === bom.materialId);
            return (
              <div
                key={index}
                // style={{
                //   fontSize: "0.9rem",
                //   borderBottom: "1px solid #f1f5f9",
                //   padding: "4px 0",
                // }}
                className="text-sm border-b border-slate-50 last:border-0 py-1.5 flex justify-between items-center"
              >
                <span className="text-slate-700 font-medium">
                  • {material?.name}
                </span>
                <span className="text-slate-900">
                  <strong className="text-emerald-600">{bom.quantity}</strong>{" "}
                  개
                </span>
              </div>
            );
          })}
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          // style={{
          //   width: "100%",
          //   padding: "10px",
          //   backgroundColor: "#10b981",
          //   color: "white",
          //   border: "none",
          //   borderRadius: "4px",
          //   fontWeight: "bold",
          //   cursor: "pointer",
          // }}
          className="w-full p-2.5 bg-emerald-500 text-white rounded font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-[0.99] cursor-pointer"
        >
          등록
        </button>
      </form>
    </section>
  );
};
