import { useEffect } from "react";
import { Header } from "./components/Header";
import { InventoryList } from "./components/InventoryList";
import { NewInventoryForm } from "./components/NewInventoryForm";
import { NewProductForm } from "./components/NewProductForm";
import { ProductDispatch } from "./components/ProductDispatch";
import { StockLogs } from "./components/StockLogs";
import { useInventoryStore } from "./stores/useInventoryStore";
import { supabase } from "./supabaseClient";

function App() {
  const { userName, setUserName, fetchInitialData, activeForm } =
    useInventoryStore();

  // 현재 폼 열림 관리 상태 (null은 모두 닫힘)
  // const [activeForm, setActiveForm] = useState<"material" | "product" | null>(
  //   null,
  // );

  // 앱 접속 시 담당자 확인
  useEffect(() => {
    if (!userName) {
      const inputName = prompt(
        "관리자 성함을 입력해주세요.\n(이 이름은 이 기기의 모든 기록에 사용됩니다.)",
      );
      if (inputName && inputName.trim() !== "") {
        setUserName(inputName.trim());
      } else {
        setUserName("제조팀");
      }
    }
  }, [userName, setUserName]);

  useEffect(() => {
    // 앱 켜지자마자 데이터 한 번 긁어오기
    fetchInitialData();

    // 슈파베이스 실시간 감시 채널 개설
    const channel = supabase
      .channel("realtime-inventory") // 채널 이름
      .on(
        "postgres_changes",
        { event: "*", schema: "public" }, // public 스키마의 모든 변화(*) 감지
        () => fetchInitialData(),
      ) // 변화가 생기면 즉시 다시 긁어오기
      .subscribe();

    // 컴포넌트가 꺼질 때(언마운트) 구독 해제해서 메모리 아끼기
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <Header />

      {/* 선택된 폼만 아래로 내려와서 열리는 영역 */}
      <div className="transition-all duration-300">
        {activeForm === "material" && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-300">
            {/* 신규 자재 입력 공정 */}
            <NewInventoryForm />
          </div>
        )}
        {activeForm === "product" && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-300">
            {/* 신규 자재 입력 공정 */}
            <NewProductForm />
          </div>
        )}
      </div>

      {/* 완제품 생산/출고 공정 */}
      <ProductDispatch />

      <hr className="my-10 border-0 border-t border-slate-200" />

      {/* 메인 재고 현황 공정 */}
      <InventoryList />

      {/* 시스템 로그 공정 */}
      <StockLogs />
    </div>
  );
}

export default App;
