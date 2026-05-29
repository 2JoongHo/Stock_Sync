// 신규 자재 등록 컴포넌트

import { useState } from "react";
import cameraIcon from "../assets/cameraIcon.svg";
import uploadIcon from "../assets/uploadIcon.svg";
import { useInventoryStore } from "../stores/useInventoryStore";
import type { InventoryItem } from "../types/inventory";
import { importInventoryFromExcel } from "../utils/excelUtils"; // 엑셀로 불러오기
import { CameraScannerModal } from "./CameraScannerModal"; // 카메라 스캔 모달 컴포넌트 불러오기

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

  // 카메라 스캔 모달 열림 상태
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // 스캐너가 데이터를 물어오면 실행되는 함수 (데이터 자동 입력)
  const handleScanData = (data: string) => {
    try {
      // 1. QR 데이터가 JSON 규칙(예: {"id": "A-1", "name": "볼트", "qty": 50})이라고 가정하고 쪼갭니다.
      const parsedData = JSON.parse(data);

      // 2. 쪼갠 데이터를 현재 폼 바구니(formData)에 스르륵 덮어씌웁니다.
      setFormData((prev) => ({
        ...prev,
        id: parsedData.id || prev.id, // QR에 ID가 있으면 넣고, 없으면 원래 있던 값 유지
        name: parsedData.name || prev.name,
        currentStock: parsedData.qty || prev.currentStock,
      }));

      // 완료 팝업창
      alert(
        `스캔 완료! 폼에 데이터가 자동으로 입력되었습니다.\n내용을 확인하고 [등록]을 눌러주세요.`,
      );
    } catch {
      // =====================================
      // 🤖 2. AI 텍스트 스캔 (거름망 필터 적용)
      // =====================================
      console.log("🤖 원본 텍스트:\n", data);

      // 🔪 거름망: '품명:', '코드:', '수량:' 뒤에 오는 글자나 숫자만 예리하게 잘라냅니다.
      const nameMatch = data.match(/품명[:\s]*([^\n]+)/); // '품명:' 뒤부터 줄바꿈 전까지
      const idMatch = data.match(/코드[:\s]*([a-zA-Z0-9-]+)/); // '코드:' 뒤의 영문/숫자/- 기호
      const qtyMatch = data.match(/수량[:\s]*(\d+)/); // '수량:' 뒤의 숫자만

      // 세 개 중 하나라도 건진 게 있다면?
      if (nameMatch || idMatch || qtyMatch) {
        setFormData((prev) => ({
          ...prev,
          name: nameMatch ? nameMatch[1].trim() : prev.name, // 추출한 품명 넣기
          id: idMatch ? idMatch[1].trim() : prev.id, // 추출한 코드 넣기
          currentStock: qtyMatch ? Number(qtyMatch[1]) : prev.currentStock, // 추출한 수량 넣기
        }));

        alert(`[AI 글자 인식 완료]\n인식된 항목만 칸에 맞게 분류했습니다.`);
      } else {
        // 아무리 찾아도 우리가 정한 양식(품명, 코드, 수량)이 없을 때
        alert(
          `[인식 실패] 엉뚱한 글자가 읽혔습니다.\n\n카메라 초점을 맞추고 다시 시도해주세요.\n(원본: ${data.substring(0, 30)}...)`,
        );
      }
    }
  };

  // 엑셀 업로드 핸들러 구현
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedItems = await importInventoryFromExcel(file);
      if (
        window.confirm(
          `엑셀 파일에서 ${importedItems.length}개의 자재를 새로 추가하시겠습니까?`,
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

        <div className="flex gap-2 mb-4">
          {/* 엑셀 가져오기 버튼 */}
          <label className="flex items-center justify-center gap-1 w-9 h-9 md:w-auto md:px-3 bg-emerald-500 text-white rounded font-bold cursor-pointer hover:bg-emerald-600 transition-all shadow-sm">
            <img src={uploadIcon} alt="upload" className="w-5 h-5 invert" />
            <span className="hidden md:inline">엑셀 불러오기</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* 카메라 버튼 */}
          <button
            type="button" // form 제출을 막기 위해 type="button" 명시
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center justify-center gap-1 w-9 h-9 md:w-auto md:px-3 bg-purple-600 text-white rounded font-bold cursor-pointer hover:bg-purple-700 transition-all shadow-sm"
          >
            <img src={cameraIcon} alt="camera" className="w-5 h-5 invert" />
            <span className="hidden md:inline">스캔</span>
          </button>
        </div>
      </div>

      {/* 카메라 스캔 모달 */}
      {isCameraOpen && (
        <CameraScannerModal
          onClose={() => setIsCameraOpen(false)}
          onScanSuccess={handleScanData}
        />
      )}

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
