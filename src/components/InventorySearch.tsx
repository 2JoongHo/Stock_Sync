// 검색창 컴포넌트

interface SearchProps {
  value: string; // 현재 검색어
  onChange: (value: string) => void; // 검색어가 바뀔 때 실행할 함수
}

export const InventorySearch = ({ value, onChange }: SearchProps) => {
  return (
    <input
      type="text"
      placeholder="자재명 또는 규격 검색..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="py-1.5 px-3 rounded border border-slate-300 w-[250px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  );
};
