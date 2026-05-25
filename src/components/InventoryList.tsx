// 자재 현황 리스트 컴포넌트

import { useRef, useState } from "react";
import downloadIcon from "../assets/downloadIcon.svg";
import { InventorySearch } from "../components/InventorySearch";
import { useInventoryStore } from "../stores/useInventoryStore";
import { exportFullInventoryReport } from "../utils/excelUtils"; // 엑셀로 내보내기

export const InventoryList = () => {
  // Zustand에서 자재 데이터와 수량 업데이트 함수를 가져옴
  const { items, logs, products, updateStock, removeItem, isEditMode } =
    useInventoryStore();

  // 편집모드 상태
  // const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const GLOBAL_SAFETY_STOCK = 100; // 개별 설정이 없을 때 적용되는 공장 전체 안전 재고 기준

  // 전체 자재 중 이름이나 규격에 검색어가 포함된 것만 골라내기
  // .filter(): 조건에 맞는 아이템만 모아 새로운 리스트를 생성
  // .toLowerCase(): 대소문자 구분 없이 검색되도록 모두 소문자로 변환하여 비교
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || // 제품명
      item.spec.toLowerCase().includes(searchTerm.toLowerCase()) || // 규격
      item.id.toLowerCase().includes(searchTerm.toLowerCase()), // 제품코드
  );

  // 입출고 실행 함수
  const handleManualUpdate = (itemId: string, type: "IN" | "OUT") => {
    // 특정 자재의 입력창을 ID로 직접 찾아옴 (DOM 접근)
    const inputElement = document.getElementById(
      `input-${itemId}`,
    ) as HTMLInputElement;
    const value = Number(inputElement.value);

    // 유효성 검사: 수량이 0이거나 음수면 실행 중단 및 경고창
    if (value <= 0) return alert("1 이상의 수량을 입력해주세요.");

    // 상황실에 데이터 업데이트 요청 (입고면 양수, 출고면 음수)
    updateStock(itemId, type === "IN" ? value : -value);

    // 작업 완료 후 입력 칸을 깨끗이 비워줌
    inputElement.value = "";
  };

  // OCR 공정용 임시 상태
  const [isCameraOpen, setIsCameraOpen] = useState(false); // 카메라 열기 / 닫기
  const [ocrLoading, setOcrLoading] = useState(false); // AI가 글자 읽는 중인지 표시
  const videoRef = useRef<HTMLVideoElement>(null); // 실시간 카메라 화면을 보여줄 렌즈
  const canvasRef = useRef<HTMLCanvasElement>(null); // 사진을 찍어둘 임시 캔버스
  const streamRef = useRef<MediaStream | null>(null); // 카메라 전원 홀더

  // 카메라 전원 켜기
  const startCamera = async () => {
    setIsCameraOpen(true);

    try {
      // 1. 하드웨어 장치에 비디오 스트림 요청 (제약조건 최적화)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          // 스마트폰 후면을 우선하되, 없을 경우(PC) 아무 카메라나 가져오도록 설정
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream; // 전원 줄 보관

      // 렌즈 부품(videoRef)이 준비되면 카메라 화면 공급받기
      setTimeout(() => {
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;

          // 모바일 및 특정 브라우저의 자동재생 차단 정책 우회 조치
          video.setAttribute("playsinline", "true");
          video.setAttribute("autoplay", "true");

          video.play().catch((e) => {
            console.error("비디오 플레이 강제 실행 실패:", e);
          });
        } else {
          console.error("videoRef 엘리먼트 로드 실패");
        }
      }, 200); // 200ms 대기로 안정성 확보
    } catch (err) {
      console.error("카메라 하드웨어 접근 실패:", err);
      alert(
        "카메라 장치를 켤 수 없습니다. 권한 허용 여부 또는 연결을 확인하세요.",
      );
      setIsCameraOpen(false);
    }
  };

  // 카메라 전원 끄기
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // 전원 OFF
    }
    setIsCameraOpen(false);
  };

  return (
    <section className="mt-5">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-5 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto md:gap-3">
          <h2 className="m-0 text-xl font-bold text-slate-900 flex items-center gap-2">
            📊 실시간 자재 현황
          </h2>
          {/* 엑셀 내보내기 버튼 */}
          <button
            onClick={() => exportFullInventoryReport(items, logs, products)}
            className="flex items-center justify-center w-9 h-9 bg-emerald-500 text-white rounded font-bold cursor-pointer hover:bg-emerald-600 transition-all shadow-sm"
          >
            <img src={downloadIcon} alt="download" className="w-5 h-5 invert" />
          </button>

          {/* 카메라 버튼 */}
          <button
            onClick={startCamera}
            className="flex items-center gap-1 px-3 h-9 bg-purple-600 text-white rounded font-bold text-xs cursor-pointer hover:bg-purple-700 transition-all shadow-sm"
          >
            📷
          </button>
        </div>

        {/* 오른쪽 정렬 그룹: 수정버튼 + 검색창 */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            {/* 자재 관리 모드 버튼 */}
            {/* <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-9 px-4 rounded font-bold text-xs transition-colors cursor-pointer text-white ${isEditMode ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {isEditMode ? "수정완료" : "수정하기"}
            </button> */}
          </div>

          {/* 검색창 */}
          <div className="flex-1 md:flex-none md:w-64">
            <InventorySearch value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
      </div>

      {/* 카메라 켜졌을 때 팝업 모달 */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              🤖 자재 라벨 스캔룸
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              자재 박스의 [품명, 수량, 코드] 라벨이 화면 중앙에 오도록
              비춰주세요.
            </p>

            {/* 실시간 폰 카메라 화면이 나오는 렌즈 국소 */}
            <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4 shadow-inner border border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* 스캔 가이드 라인 네모 박스 */}
              <div className="absolute inset-6 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none opacity-60 animate-pulse" />
            </div>

            {/* 숨겨놓은 찰칵용 임시 스냅샷 전용 도화지 */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              <button
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={() => alert("다음 공정에서 진짜 글자를 읽어볼게요!")}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors cursor-pointer"
              >
                📸 사진 촬영
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 필터링된 결과가 0개일 때와 있을 때를 나누어 화면을 그림 (조건부 렌더링) */}
      {filteredItems.length === 0 ? (
        <p className="text-center text-slate-500 py-5">
          {searchTerm ? "검색 결과가 없습니다." : "등록된 자재가 없습니다."}
        </p>
      ) : (
        // 스크롤 구현
        <div className="max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredItems.map((item) => {
            // 개별 안전재고 설정이 있으면 사용, 없으면(??) 공장 기준(100)을 사용
            const safetyLimit = item.safetyStock ?? GLOBAL_SAFETY_STOCK;
            const isLowStock = item.currentStock <= safetyLimit;

            return (
              <div
                key={item.id}
                className={`mb-4 p-4 flex items-center justify-between rounded-lg border transition-all ${isLowStock ? "bg-rose-50 border-rose-300 border-2" : "bg-white border-slate-200"}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{item.name}</strong>
                    {/* 재고가 위험 기준치 이하면 경고 배지를 보여줌 */}
                    {isLowStock && (
                      <span className="bg-rose-600 text-white text-[0.7rem] px-1.5 py-0.5 rounded font-bold">
                        재고부족
                      </span>
                    )}
                  </div>
                  <small className="text-slate-500 text-xs">
                    {/* 규격 | 제품코드 */}
                    {item.spec} | {item.id}
                  </small>{" "}
                  <div className="mt-1">
                    <span className="text-medium text-slate-600">
                      현 재고:{" "}
                    </span>
                    <strong
                      className={`text-xl ${isLowStock ? "text-rose-600" : "text-slate-900"}`}
                    >
                      {item.currentStock}
                    </strong>
                    <span className="text-sm text-slate-600 ml-1">
                      {item.unit}
                    </span>
                  </div>
                </div>

                {/* 모드에 따라 버튼 그룹을 다르게 */}
                {isEditMode ? (
                  // 관리 모드일 때는 삭제 버튼 노출
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `'${item.name}' 자재를 삭제하시겠습니까?`,
                        )
                      ) {
                        removeItem(item.id);
                      }
                    }}
                    className="bg-red-600 text-white px-3 py-2 rounded font-bold hover:bg-red-600 cursor-pointer text-sm animate-pulse"
                  >
                    삭제
                  </button>
                ) : (
                  // 일반 모드일 때는 입출고 입력창 노출
                  <div className="flex gap-2">
                    <input
                      id={`input-${item.id}`}
                      type="number"
                      placeholder="수량"
                      min="1"
                      className="w-20 p-1.5 border border-slate-300 rounded text-center text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleManualUpdate(item.id, "IN")}
                      className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-900 cursor-pointer text-sm"
                    >
                      입고
                    </button>
                    <button
                      onClick={() => handleManualUpdate(item.id, "OUT")}
                      className="bg-orange-600 text-white px-3 py-2 rounded font-bold hover:bg-orange-900 cursor-pointer text-sm"
                    >
                      출고
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
