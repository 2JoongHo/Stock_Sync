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
      style={{
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f1f5f9",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>➕ 신규 제품 등록</h2>

      {/* 전체를 form으로 감싸고 onSubmit을 연결하여 엔터키 지원 */}
      <form onSubmit={handleSaveProduct}>
        {/* 제품명 입력 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            제품명
          </label>
          <input
            type="text"
            placeholder="ONE TOUCH ROTATE"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #cbd5e1",
              boxSizing: "border-box",
            }}
          />
        </div>

        <hr
          style={{
            border: "0",
            borderTop: "1px solid #bfdbfe",
            margin: "20px 0",
          }}
        />

        {/* BOM 구성 */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            자재 구성
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              style={{ flex: 2, padding: "8px" }}
            >
              <option value="">자재 선택</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.spec})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="수량"
              value={materialQuantity}
              onChange={(e) => setMaterialQuantity(Number(e.target.value))}
              style={{ flex: 1, padding: "8px" }}
            />
            <button
              type="button"
              onClick={handleAddBOM}
              style={{ padding: "8px 15px", cursor: "pointer" }}
            >
              추가
            </button>
          </div>
        </div>

        {/* 현재 추가된 BOM 목록 미리보기 */}
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            minHeight: "50px",
            marginBottom: "20px",
            border: "1px solid #cbd5e1",
          }}
        >
          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            자재 :
          </p>
          {bomList.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              자재를 선택해주세요
            </p>
          )}
          {bomList.map((bom, index) => {
            const material = items.find((i) => i.id === bom.materialId);
            return (
              <div
                key={index}
                style={{
                  fontSize: "0.9rem",
                  borderBottom: "1px solid #f1f5f9",
                  padding: "4px 0",
                }}
              >
                • {material?.name} : <strong>{bom.quantity}</strong>개
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          등록
        </button>
      </form>
    </section>
  );
};
