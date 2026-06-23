// 코치 마크 컴포넌트

import { useEffect, useState } from "react";

// 코치 마크용 id 정보
const GUIDE_STEPS = [
  // 자재 등록 & 제품 등록
  {
    targetId: "guide-step-1",
    title: "새로운 자재/제품 등록",
    content: "새로운 자재와 제품의 구성을\n설정할 수 있습니다.",
  },
  // 차트
  {
    targetId: "guide-step-2",
    title: "실시간 차트",
    content:
      "위험 수준에 도달한 자재나,\n변동 수량등을 한눈에\n파악 할 수 있습니다.",
  },
  // 실시간 자재 현황
  {
    targetId: "guide-step-3",
    title: "자재 입출고 관리",
    content:
      "목록에서 즉시 입출고를 기록하거나,\n현재 재고를 확인 할 수 있습니다.",
  },
  // 완제품 출고
  {
    targetId: "guide-step-4",
    title: "완제품 출고 관리",
    content:
      "목록에서 즉시 출고를 기록하거나,\n클릭하여 상세 내역을 볼 수 있습니다.",
  },
];

export const CoachMarks = () => {
  // 첫 방문시에만 실행 후 로컬 스토리지에 기록하여 다시는 안뜨게 함
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("hasSeenGuide") !== "true";
  });

  const [currentStep, setCurrentStep] = useState(0); // 현재 가이드 스텝 인덱스
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null); // 현재 스텝의 타겟 요소 위치와 크기 저장

  // 스텝이 변경될 때마다 화면 중앙으로 부드럽게 자동 스크롤 (크롬 랩퍼 스크롤 대응)
  useEffect(() => {
    if (!isVisible) return;

    const targetElement = document.getElementById(
      GUIDE_STEPS[currentStep].targetId
    );
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();

      // 실시간 차트처럼 높이가 화면의 50%를 넘는 요소는 꼭대기에 맞춤
      if (rect.height > window.innerHeight * 0.5) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // 일반적인 작은 버튼이나 입력창은 화면 정중앙에 맞춤
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep, isVisible]);

  // 현재 스텝의 타겟 요소(ID) 위치와 크기를 추적하여 targetRect 상태에 저장
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(
        GUIDE_STEPS[currentStep].targetId
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

    // 가이드가 끝날 때 화면 최상단으로 이동
    // scrollIntoView와 scrollTo를 둘 다 적용항여 확실하게 상단 복귀
    const firstElement = document.getElementById(GUIDE_STEPS[0].targetId);
    if (firstElement) {
      firstElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  // 브라우저 화면 크기를 가져와서 툴팁 위치를 동적으로 계산
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 0;

  // 툴팁의 최대 너비는 300px로 하되, 초소형 모바일 기기에서는 화면 양옆 여백(32px)을 빼고 딱 맞추기
  const tooltipWidth = Math.min(300, screenWidth - 32);

  // 툴팁이 오른쪽 화면 밖으로 나가지 않도록 안전한 X 좌표(left) 계산
  const safeLeft = Math.min(
    Math.max(16, targetRect.left), // 왼쪽으로는 16px 이상 유지
    screenWidth - tooltipWidth - 16 // 오른쪽으로도 16px 이상 유지
  );

  // 툴팁이 크롬 브라우저 뷰포트 안에서 안 짤리게 통제
  let tooltipTop = targetRect.bottom + 16; // 기본: 타겟 아래에 배치

  // 툴팁이 화면 아래로 벗어날 시
  if (tooltipTop + 200 > screenHeight) {
    tooltipTop = targetRect.top - 180; // 위쪽으로 배치 변경

    // 툴팁이 화면 상단을 벗어날 시
    if (tooltipTop < 16) {
      // 타겟 요소의 상단 안쪽(top + 20px) 자리에 안정적으로 띄워 가독성을 확보
      tooltipTop = Math.max(16, targetRect.top + 20);

      // 이마저도 바닥 경계선에 걸린다면 최종 안전 마진 확보
      if (tooltipTop + 200 > screenHeight) {
        tooltipTop = screenHeight - 220;
      }
    }
  }

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
        className="absolute bg-white rounded-xl shadow-2xl p-5 pointer-events-auto transition-all duration-500 ease-in-out"
        style={{
          width: `${tooltipWidth}px`,
          top: `${tooltipTop}px`,
          left: safeLeft,
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg">{stepInfo.title}</h3>
          <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full shrink-0 ml-2">
            {currentStep + 1} / {GUIDE_STEPS.length}
          </span>
        </div>

        {/* 내용 입력 표기 */}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {stepInfo.content.split("\n").map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
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
