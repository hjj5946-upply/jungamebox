import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameLayout from "../layouts/GameLayout";

export type Entry = {
  name: string;
  weight: number;
};

function parseEntries(raw: string): Entry[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      const [namePart, weightPart] = token.split("*").map((t) => t.trim());
      const name = namePart || "";
      const weightNum = Number(weightPart);
      const weight = Number.isFinite(weightNum) && weightNum > 0 ? weightNum : 1;
      return { name, weight };
    })
    .filter((e) => e.name.length > 0);
}

export default function PinballPage() {
  const navigate = useNavigate();

  const [rawInput, setRawInput] = useState<string>(
    "철수*5, 짱구*3, 훈이*2, 유리*1"
  );

  const entries = useMemo(() => parseEntries(rawInput), [rawInput]);
  const totalWeight = useMemo(
    () => entries.reduce((sum, e) => sum + e.weight, 0),
    [entries]
  );

  const handleStartPinball = () => {
    if (!entries.length) {
      alert("이름을 최소 1개 이상 입력해 주세요.");
      return;
    }

    // 너무 많은 공 방지용(그래도 *수만큼은 유지)
    const totalBalls = entries.reduce((sum, e) => sum + e.weight, 0);
    if (totalBalls > 120) {
      const ok = window.confirm(
        `총 공 갯수가 ${totalBalls}개입니다. 너무 많으면 렉이 걸릴 수 있어요.\n그래도 진행할까요?`
      );
      if (!ok) return;
    }

    navigate("/games/pinball/play", {
      state: { entries },
    });
  };

  return (
    <GameLayout title="핀볼룰렛 설정">
      <div className="flex flex-col gap-4 text-slate-100 text-sm">
        {/* 설명 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
          <h2 className="mb-1 text-xs font-semibold text-slate-200">
            사용 방법
          </h2>
          <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-300">
            <li>이름*갯수 형식으로 입력합니다. (예: 철수*5, 짱구*3)</li>
            <li>* 뒤 숫자 = 핀볼에서 떨어질 공 개수입니다.</li>
            <li>“핀볼 시작”을 누르면 다음 화면에서 공들이 한꺼번에 떨어집니다.</li>
            <li>맨 아래 골 구역에 가장 먼저 도착한 공의 주인이 당첨됩니다.</li>
          </ul>
        </section>

        {/* 입력 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
          <label className="mb-2 block text-xs font-semibold text-slate-200">
            참가자 이름 / 공 개수 입력
          </label>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-400"
            placeholder="예) 철수*5, 짱구*3, 훈이*2"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
            <span>참가자 수: {entries.length}명</span>
            <span>총 공 개수: {totalWeight}</span>
          </div>
        </section>

        {/* 참가자 목록 */}
        {entries.length > 0 && (
          <section className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">참가자 목록</span>
              <span className="text-[11px] text-slate-400">
                (숫자 = 떨어질 공 개수)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entries.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center gap-1 rounded-full border border-slate-600 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-200"
                >
                  <span>{e.name}</span>
                  <span className="text-[10px] text-slate-400">×{e.weight}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 시작 버튼 */}
        <section className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
          <button
            type="button"
            onClick={handleStartPinball}
            disabled={entries.length === 0}
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            핀볼 시작
          </button>
          <p className="mt-2 text-[11px] text-slate-400">
            다음 화면에서 긴 핀볼판이 생성되고, 모든 공이 한 번에 떨어집니다.
          </p>
        </section>
      </div>
    </GameLayout>
  );
}
