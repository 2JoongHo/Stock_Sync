// 완제품 및 BOM 등록 폼 컴포넌트

import { useState } from "react";
import cameraIcon from "../assets/cameraIcon.svg"; // 카메라 아이콘 이미지
import { useInventoryStore } from "../stores/useInventoryStore";
import type { BOMItem, Product } from "../types/inventory";
import { CameraScannerModal } from "./CameraScannerModal"; // 카메라 스캐너 모달 컴포넌트

export const NewProductForm = () => {
  // Zustand에서 자재 목록(items)과 완제품 등록 함수(addProduct)를 가져옴
  const { items, addProduct } = useInventoryStore();

  // 폼 입력 상태 관리
  const [productName, setProductName] = useState(""); // 완제품 이름
  const [productId, setProductId] = useState(""); // 완제품 제품코드
  const [selectedMaterialId, setSelectedMaterialId] = useState(""); // 선택된 자재 ID
  const [materialQuantity, setMaterialQuantity] = useState<number | "">(""); // 선택된 자재의 소모량
  const [bomList, setBomList] = useState<BOMItem[]>([]); // 현재 조립 중인 BOM 리스트

  // 스캐너 제어 및 파싱 세팅
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleScanData = (data: string) => {
    console.log("🎯 스캔된 원본 데이터:\n", data);

    let parsedProductCode = ""; // 제품 코드 => 전체 CTS-
    let parsedProductName = ""; // 제품명 => HPIO, CIDR 등
    // let parsedSerialNumber = ""; // S/N (일단 추출)

    try {
      // 1. QR이 JSON 형태일 때 (기본 규격 호환)
      const jsonData = JSON.parse(data);
      parsedProductCode = jsonData.id || "";
      parsedProductName = jsonData.name || "";
    } catch {
      // 2. CanTops 라벨 전용 AI 텍스트 거름망
      const modelMatch = data.match(
        /(?:모델명\s*[:：]\s*)?(CTS-[A-Za-z0-9-]+(?:-[A-Za-z0-9-]+)*)/i,
      );

      if (modelMatch) {
        parsedProductCode = modelMatch[1].trim(); // 예: CTS-HPIO-25-PIS...

        // '-' 기호로 문자열을 쪼개서 배열에 담기
        const parts = parsedProductCode.split("-");

        // 두 번째 조각(인덱스 1)이 존재하면 그것을 '제품명'으로 사용
        if (parts.length > 1) {
          parsedProductName = parts[1]; // 예: HPIO, CIDR, CIDO
        }
      }

      // 2. S/N (시리얼 넘버) 추출
      // const snMatch = data.match(/(?:S\s*\/\s*N|序列[號号])\s*[:：]\s*([A-Za-z0-9-]+)/i);
      // if (snMatch) parsedSerialNumber = snMatch[1].trim();
    }

    // 🎯 3. 걸러낸 데이터를 폼 바구니에 정확히 꽂아넣기
    if (parsedProductCode) {
      setProductId(parsedProductCode); // 전체 CTS-... 문자열을 '제품코드' 칸에!
      setProductName(parsedProductName); // 잘라낸 HPIO를 '제품명' 칸에!

      alert(
        `[라벨 분석 완료!]\n제품코드: ${parsedProductCode}\n제품명: ${parsedProductName}\n자동 입력되었습니다.`,
      );
    } else {
      alert(
        `[인식 실패] CanTops 제품코드(CTS-)를 찾을 수 없습니다.\n(원본: ${data.substring(0, 30)}...)`,
      );
    }
  };
  // BOM 리스트에 자재 추가
  const handleAddBOM = () => {
    if (
      !selectedMaterialId ||
      !materialQuantity ||
      Number(materialQuantity) <= 0
    ) {
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
    setMaterialQuantity(""); // 수량 초기화
  };

  // 최종 완제품 등록
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (!productName || bomList.length === 0) {
      return alert("제품명과 최소 하나 이상의 BOM 항목이 필요합니다.");
    }

    const finalId = productId.trim();

    const newProduct: Product = {
      id: finalId, // 고유 번호 생성
      name: productName,
      bom: bomList,
    };

    addProduct(newProduct); // 저장

    // 폼 초기화
    setProductName("");
    setProductId("");
    setBomList([]);
    alert(`${productName}이(가) 등록되었습니다!`);
  };

  return (
    <section className="mb-8 p-5 bg-slate-100 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="mt-0 mb-4 text-xl font-bold text-slate-900">
          ➕ 신규 제품 등록
        </h2>

        {/* 카메라 버튼 */}
        <button
          type="button" // form 제출을 막기 위해 type="button" 명시
          onClick={() => setIsCameraOpen(true)}
          className="flex mb-4 items-center justify-center gap-1 w-9 h-9 md:w-auto md:px-3 bg-purple-600 text-white rounded font-bold cursor-pointer hover:bg-purple-700 transition-all shadow-sm"
        >
          <img src={cameraIcon} alt="camera" className="w-5 h-5 invert" />
          <span className="hidden md:inline">스캔</span>
        </button>
      </div>

      {/* 카메라 스캔 모달 */}
      {isCameraOpen && (
        <CameraScannerModal
          onClose={() => setIsCameraOpen(false)}
          onScanSuccess={handleScanData}
        />
      )}

      {/* 전체를 form으로 감싸고 onSubmit을 연결하여 엔터키 지원 */}
      <form onSubmit={handleSaveProduct}>
        {/* 제품명 입력 */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <input
            type="text"
            placeholder="제품명"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          {/* 제품코드 입력 */}
          <input
            type="text"
            placeholder="제품코드"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        {/* BOM 구성 */}
        <div className="mb-4">
          <label className="block font-bold mb-1.5 text-slate-700">
            자재 구성
          </label>
          <div className="flex flex-col md:flex-row gap-2.5">
            {/* 자재 선택 */}
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
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
              className="flex-[1] p-2 border text-base border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* 추가 버튼 */}
            <button
              type="button"
              onClick={handleAddBOM}
              className="px-3 py-1.5 bg-blue-500 text-white rounded font-bold hover:bg-blue-900 cursor-pointer transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        <hr className="border-0 border-t border-blue-200 my-5" />

        {/* 현재 추가된 BOM 목록 미리보기 */}
        <div className="bg-white p-3 rounded border border-slate-300 min-h-[50px] mb-5 shadow-inner">
          <p className="m-0 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            포함된 자재 리스트 :
          </p>
          {bomList.length === 0 && (
            <p className="text-sm text-slate-400 italic">자재를 선택해주세요</p>
          )}
          {bomList.map((bom, index) => {
            const material = items.find((i) => i.id === bom.materialId);
            return (
              <div
                key={index}
                className="text-sm border-b border-slate-50 last:border-0 py-1.5 flex justify-between items-center"
              >
                <span className="text-slate-900 font-medium">
                  <strong>• {material?.name}</strong>
                </span>
                <span className="text-slate-900">
                  <strong>{bom.quantity}</strong> ea
                </span>
              </div>
            );
          })}
        </div>

        {/* 등록 버튼 */}
        <button
          type="submit"
          className="w-full p-2.5 bg-emerald-500 text-white rounded font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-[0.99] cursor-pointer"
        >
          등록
        </button>
      </form>
    </section>
  );
};
