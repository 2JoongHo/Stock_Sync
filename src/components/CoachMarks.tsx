// 코치 마크 컴포넌트

import { useEffect, useState } from "react";

const GUIDE_STEPS = [
  // 자재 등록
  {
    targetId: "guide-step-1",
    title: "새로운 자재 등록",
    content: "새로 들어온 자재의 이름과 안전재고 기준을 설정할 수 있습니다.",
  },
  // 차트
  {
    targetId: "guide-step-2",
    title: "실시간 재고 차트",
    content:
      "위험 수준에 도달한 자재나 가장 많이 보유한 자재를 한눈에 파악하세요.",
  },
  // 실시간 자재 현황
  {
    targetId: "guide-step-3",
    title: "자재 입출고 관리",
    content:
      "목록에서 즉시 입출고를 기록하거나, 클릭하여 상세 내역을 볼 수 있습니다.",
  },
];

export const CoachMarks = () => {
  // 첫 방문시에만 실행 후 로컬 스토리지에 기록하여 다시는 안뜨게 함
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("hasSeenGuide") !== "true";
  });

  const [currentStep, setCurrentStep] = useState(0); // 현재 가이드 스텝 인덱스
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null); // 현재 스텝의 타겟 요소 위치와 크기 저장

  // 현재 스텝의 타겟 요소(ID) 위치와 크기를 추적하여 targetRect 상태에 저장
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(
        GUIDE_STEPS[currentStep].targetId,
      );
      if (targetElement) {
        // 요소의 현재 브라우저 상의 좌표와 크기를 가져옴
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    // 처음 렌더링 시 측정
    // 약간의 딜레이를 주어 UI가 모두 그려진 후 측정하게 함
    const timer = setTimeout(updatePosition, 100);

    // 창 크기가 변하거나 스크롤할 때 좌표 다시 계산
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, isVisible]);

  // 가이드 완전 종료 함수 (다시는 안 뜨게 로컬 스토리지에 기록)
  const handleClose = () => {
    localStorage.setItem("hasSeenGuide", "true");
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose(); // 마지막 스텝이면 종료
    }
  };

  if (!isVisible || !targetRect) return null;

  const stepInfo = GUIDE_STEPS[currentStep];

  return (
    // z-[9999]로 화면 가장 최상단에 배치
    <div className="fixed inset-0 z-[9999] pointer-events-none transition-all duration-300">
      {/* 가이드를 제외한 화면 전체를 덮는 까만 배경 */}
      <div
        className="absolute rounded-lg transition-all duration-500 ease-in-out border-2 border-blue-500"
        style={{
          top: targetRect.top - 8, // 여백을 위해 8px씩 늘려줌
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.75)", // 슬레이트 색상 반투명 덮개
        }}
      />

      {/* 툴팁 (설명창) */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl p-5 w-[300px] pointer-events-auto transition-all duration-500 ease-in-out"
        style={{
          // 타겟 요소 바로 아래에 툴팁을 배치 (화면 아래로 넘어가면 위로 배치하는 로직 추가 가능)
          top: targetRect.bottom + 16,
          left: Math.max(16, targetRect.left), // 화면 왼쪽 밖으로 나가지 않게 방어
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg">{stepInfo.title}</h3>
          <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            {currentStep + 1} / {GUIDE_STEPS.length}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {stepInfo.content}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-sm font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            건너뛰기
          </button>

          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 cursor-pointer transition-colors"
          >
            {currentStep === GUIDE_STEPS.length - 1 ? "시작하기" : "다음으로"}
          </button>
        </div>
      </div>
    </div>
  );
};
