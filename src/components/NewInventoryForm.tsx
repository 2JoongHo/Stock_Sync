// 신규 자재 등록 컴포넌트

import { useState } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { InventoryItem } from "../types/inventory";

export const NewInventoryForm = () => {
  // Zustand에서 현재 자재 리스트와 리스트 업데이트 함수를 가져옴
  const { items, setItems } = useInventoryStore();

  // 사용자가 입력 중인 폼 데이터를 실시간으로 저장
  // 입력을 시작하기 전의 깨끗한 상태
  const [formData, setFormData] = useState({
    name: "",
    spec: "",
    location: "",
    currentStock: 0,
    unit: "ea",
  });

  // 자재 등록 함수
  const handleAddItem = (e: React.FormEvent) => {
    // 폼 제출 시 페이지가 새로고침되는 브라우저의 기본 동작을 막음 (Single Page App 유지)
    e.preventDefault();

    // 데이터 검증: 필수 정보인 자재명이 비어있으면 중단 및 경고
    if (!formData.name) return alert("자재명을 입력해주세요.");

    // 새로운 자재 객체 생성
    const newItem: InventoryItem = {
      ...formData, // 기존 입력값들을 그대로 복사
      id: `ITEM-${Date.now()}`, // 등록 시점의 밀리초 숫자를 고유 ID로 활용
      category: "부품", // 기본 카테고리 할당
    };

    // 리스트를 업데이트 (기본 자재 + 새 자재)
    setItems([...items, newItem]);

    // 등록 성공 후 입력창들을 초기값으로
    setFormData({
      name: "",
      spec: "",
      location: "",
      currentStock: 0,
      unit: "ea",
    });

    alert("새 자재가 등록되었습니다.");
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
      <h2 style={{ marginTop: 0 }}>➕ 신규 자재 등록</h2>

      <form
        onSubmit={handleAddItem}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        {/* 입력창 */}
        <input
          placeholder="자재명"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: "8px" }}
        />
        <input
          placeholder="규격(Spec)"
          value={formData.spec}
          onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
          style={{ padding: "8px" }}
        />
        <input
          type="number"
          placeholder="초기재고"
          value={formData.currentStock}
          // 숫자로 입력받기 위해 Number() 변환 처리
          onChange={(e) =>
            setFormData({ ...formData, currentStock: Number(e.target.value) })
          }
          style={{ padding: "8px" }}
        />

        <button
          type="submit"
          style={{
            gridColumn: "span 3", // 3칸을 가득 채우기
            padding: "10px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          등록
        </button>
      </form>
    </section>
  );
};
