// 신규 자재 등록 컴포넌트

import { useState } from "react";
import uploadIcon from "../assets/uploadIcon.svg";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { InventoryItem } from "../types/inventory";
import { importInventoryFromExcel } from "../utils/excelUtils";

export const NewInventoryForm = () => {
  // Zustand에서 현재 자재 리스트와 리스트 업데이트 함수를 가져옴
  const { addItem } = useInventoryStore();

  // 사용자가 입력 중인 폼 데이터를 실시간으로 저장
  // 입력을 시작하기 전의 깨끗한 상태
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    spec: "",
    location: "",
    currentStock: "" as number | "",
    unit: "ea",
  });

  // 엑셀 업로드 핸들러 구현
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedItems = await importInventoryFromExcel(file);
      if (
        window.confirm(
          `엑셀 파일에서 ${importedItems.length}개의 자재를 새로 추가하시겠습니까?`
        )
      ) {
        // 기존 데이터 뒤에 새 데이터 합치기
        for (const item of importedItems) {
          await addItem(item);
        }
        alert("자재 목록을 성공적으로 불러왔습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("엑셀 읽기 실패: 파일 형식을 확인해주세요.");
    } finally {
      e.target.value = ""; // 같은 파일 재업로드 가능하도록 초기화
    }
  };

  // 자재 등록 함수
  const handleAddItem = async (e: React.FormEvent) => {
    // 폼 제출 시 페이지가 새로고침되는 브라우저의 기본 동작을 막음 (Single Page App 유지)
    e.preventDefault();

    // 데이터 검증: 필수 정보인 자재명이 비어있으면 중단 및 경고
    if (!formData.name) return alert("자재명을 입력해주세요.");

    // ID 결정 로직: 입력값이 있으면 쓰고, 없으면 자동 생성
    const finalId =
      formData.id.trim() !== "" ? formData.id : `ITEM-${Date.now()}`;

    // 새로운 자재 객체 생성
    const newItem: InventoryItem = {
      ...formData, // 기존 입력값들을 그대로 복사
      id: finalId, // 결정된 ID를 할당
      currentStock: Number(formData.currentStock) || 0,
      category: "부품", // 기본 카테고리 할당
    };

    // 리스트를 업데이트 (기본 자재 + 새 자재)
    await addItem(newItem);

    // 등록 성공 후 입력창들을 초기값으로
    setFormData({
      name: "",
      id: "",
      spec: "",
      location: "",
      currentStock: "",
      unit: "ea",
    });

    alert("새 자재가 등록되었습니다.");
  };

  return (
    <section className="mb-8 p-5 bg-slate-100 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="mt-0 mb-4 text-xl font-bold text-slate-900">
          ➕ 신규 자재 등록
        </h2>

        {/* 엑셀 가져오기 버튼 */}
        <label className="flex items-center justify-center w-9 h-9 bg-emerald-500 text-white rounded font-bold cursor-pointer hover:bg-emerald-600 transition-all shadow-sm">
          <img src={uploadIcon} alt="upload" className="w-5 h-5 invert" />
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-2.5">
        {/* 입력창 */}
        <input
          placeholder="자재명"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <input
          placeholder="제품코드"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <input
          placeholder="규격 / 스펙"
          value={formData.spec}
          onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
          className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <input
          type="number"
          placeholder="수량"
          value={formData.currentStock}
          // 숫자로 입력받기 위해 Number() 변환 처리
          onChange={(e) =>
            setFormData({ ...formData, currentStock: Number(e.target.value) })
          }
          className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="col-span-2 p-2.5 bg-emerald-500 text-white rounded font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-[0.99] cursor-pointer"
        >
          등록
        </button>
      </form>
    </section>
  );
};
