import type { SyntheticEvent } from "react";

/**
 * 이벤트가 "실제로 발생한" 시각을 반환한다.
 *
 * 핸들러 안에서 performance.now() 를 읽으면 이벤트 큐가 밀린 만큼 늦게 잡히고,
 * requestAnimationFrame 이 갱신하는 state 를 읽으면 마지막으로 커밋된
 * 프레임의 값이라 최대 한 프레임(60Hz 기준 16.7ms) 뒤처진다.
 * 반응속도·타이밍 측정에서는 둘 다 그대로 오차가 된다.
 *
 * e.timeStamp 는 이벤트 발생 시점의 값이고 performance.now() 와 같은
 * time origin 을 쓰므로 서로 빼서 쓸 수 있다.
 * 아주 오래된 브라우저는 여기에 epoch ms 를 넣으므로 그 경우만 걸러낸다.
 */
export function eventTime(e: SyntheticEvent): number {
  const t = e.timeStamp;
  if (typeof t === "number" && t > 0 && t < 1e12) return t;
  return performance.now();
}
