// 카메라 스캐너 모달 컴포넌트

import jsQR from "jsqr"; // QR코드 인식 라이브러리
import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js"; // OCR 라이브러리

interface CameraScannerModalProps {
  onClose: () => void; // 모달 닫기 함수
  onScanSuccess: (data: string) => void; // 스캔 성공 시 데이터를 부모에게 던져주는 통로
}

export const CameraScannerModal = ({
  onClose,
  onScanSuccess,
}: CameraScannerModalProps) => {
  // OCR 공정용 임시 상태
  const [ocrLoading, setOcrLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 컴포넌트가 화면에 나타날 때 startCamera를 자동으로 실행
  useEffect(() => {
    const startCamera = async () => {
      try {
        // 장치에 비디오 스트림 요청
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            // 스마트폰 후면 우선, 없을 경우(PC) 아무 카메라나 가져오도록 설정
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        // videoRef 준비되면 카메라 화면 공급받기
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
          }
        }, 200); // 200ms 대기로 안정성 확보
      } catch (err) {
        console.error("카메라 하드웨어 접근 실패:", err);
        alert(
          "카메라 장치를 켤 수 없습니다. 권한 허용 여부 또는 연결을 확인하세요.",
        );
        onClose(); // 에러 나면 모달 강제 닫기
      }
    };

    startCamera();

    // 컴포넌트가 꺼질 때 안전하게 카메라 전원 차단
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onClose]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onClose(); // 모달 닫기
  };

  // 통합 스마트 판독 공정 (QR 우선 판독 -> 실패 시 AI를 통한 글자 인식)
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) return;

    // 1. 카메라 화면 크기에 맞춰 캔버스 사이즈 조정
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    // 2. 캔버스에 현재 카메라 화면을 그려서 스냅샷 찍기
    const scale = Math.max(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight,
    );
    const scaledWidth = video.videoWidth * scale;
    const scaledHeight = video.videoHeight * scale;
    const dx = (canvas.width - scaledWidth) / 2;
    const dy = (canvas.height - scaledHeight) / 2;

    // 3. 내 눈에 보이는 부분만 정확히 잘라서 도화지에 그리기
    context.drawImage(video, dx, dy, scaledWidth, scaledHeight);

    // 캔버스에서 픽셀 데이터 가져오기 (QR 코드 인식용)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // 1 - QR 스캔
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert", // 속도 최적화 : 색상 반전 안함
    });

    if (code) {
      console.log("QR 코드 인식 성공:", code.data);
      alert(`[QR 스캔 성공!]\n\n데이터: ${code.data}`);
      onScanSuccess(code.data); // 부모로 데이터 전송
      stopCamera();
      return;
    }

    // 2 - AI 글자 인식(OCR) (QR 코드가 없을 때 대체 공정으로 실행)
    console.log("QR 없음. AI 텍스트 인식을 시작합니다...");
    setOcrLoading(true); // "분석 중..." 로딩 켜기

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(
        canvas.toDataURL("image/png"),
        "kor+eng+chi_tra",
      ); // 한국어, 영어, 중국어 번체 인식 설정

      console.log("AI가 읽어낸 텍스트:", text);
      alert(`[AI 글자 인식 성공!]\n\n내용:\n${text}`);
      onScanSuccess(text); // 부모로 데이터 전송
      stopCamera();
    } catch (error) {
      console.error("AI 인식 실패:", error);
      alert("데이터를 읽어내지 못했습니다. 다시 촬영해 주세요.");
    } finally {
      setOcrLoading(false); // 로딩 끄기
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
          제품 / 자재 라벨 스캔
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          자재의 [품명, 수량, 코드]가 화면 중앙에 오도록 비춰주세요.
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

        {/* 임시 스냅샷 전용 도화지 */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          <button
            onClick={stopCamera}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            닫기
          </button>
          <button
            onClick={captureAndRecognize}
            disabled={ocrLoading}
            className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              ocrLoading ? "bg-slate-400" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {ocrLoading ? "🤖 AI 분석 중..." : "스캔"}
          </button>
        </div>
      </div>
    </div>
  );
};
