// 헤더 컴포넌트

import LockIcon from "../assets/lockIcon.svg";
import UnlockIcon from "../assets/unlockIcon.svg";
import { useInventoryStore } from "../stores/useInventoryStore";

export const Header = () => {
  const {
    userName,
    setUserName,
    isEditMode,
    toggleEditMode,
    activeForm,
    setActiveForm,
  } = useInventoryStore();

  return (
    <header className="p-4 md:p-8 max-w-6xl mx-auto font-sans bg-slate-50">
      {/* 담당자 표시 */}
      <div className="flex justify-end mb-4 gap-3">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
          <span className="text-[0.65rem] md:text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
            관리자
          </span>
          <span className="text-xs md:text-sm font-bold text-slate-700">
            {userName || "확인 중..."}
          </span>
          <button
            onClick={() => {
              const newName = prompt(
                "변경할 담당자 이름을 입력하세요.",
                userName,
              );
              if (newName) setUserName(newName);
            }}
            className="ml-1 text-[0.6rem] md:text-[0.65rem] text-blue-500 hover:underline cursor-pointer"
          >
            변경
          </button>
        </div>

        {/* 전역 수정 모드 버튼 */}
        <button
          onClick={toggleEditMode}
          className={`h-9 px-4 rounded-full font-bold text-xs transition-all shadow-md cursor-pointer ${
            isEditMode
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {isEditMode ? (
            <img src={UnlockIcon} alt="unlock" className="w-5 h-5 invert" />
          ) : (
            <img src={LockIcon} alt="lock" className="w-5 h-5 invert" />
          )}
        </button>
      </div>

      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div text-center lg:text-left>
          <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
            StockSync
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            실시간 재고 관리 및 BOM 자동 동기화 시스템
          </p>
        </div>

        {/* 폼 열기/닫기 제어 버튼 그룹 */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={() =>
              setActiveForm(activeForm === "material" ? null : "material")
            }
            className={`flex-1 lg:flex-none px-4 py-3 lg:py-2 rounded-xl font-bold text-xs md:text-sm transition-all border-2 cursor-pointer ${
              activeForm === "material"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {activeForm === "material" ? "✖️ 자재등록" : "➕ 자재등록"}
          </button>
          <button
            onClick={() =>
              setActiveForm(activeForm === "product" ? null : "product")
            }
            className={`flex-1 lg:flex-none px-4 py-3 lg:py-2 rounded-xl font-bold text-xs md:text-sm transition-all border-2 cursor-pointer ${
              activeForm === "product"
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {activeForm === "product" ? "✖️ 제품등록" : "➕ 제품등록"}
          </button>
        </div>
      </div>
    </header>
  );
};
