import type { ReactNode } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <TopBar />
      <main className="flex-1 overflow-auto flex justify-center">
        {/* 가운데 고정 폭 컨테이너 */}
        <div className="w-full max-w-md p-4">
          {children}
        </div>
      </main>
      <BottomBar />
    </div>
  );
}
