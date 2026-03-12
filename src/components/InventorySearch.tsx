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
      style={{
        padding: "8px 12px",
        borderRadius: "20px",
        border: "1px solid #cbd5e1",
        width: "250px",
      }}
    />
  );
};
