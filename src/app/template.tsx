// App Router template: 매 네비게이션마다 리마운트되어 enter 애니메이션이 재생된다.
// 페이지 이동 시 콘텐츠가 "팍" 튀지 않고 부드럽게 스며들도록 opacity fade 적용.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>
}
