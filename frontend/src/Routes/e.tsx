import { useEffect, useRef, useState } from "react";

type Message = { from: string; text: string; ts: string };

export default function Messages({ callId }: { callId: string }) {
  const [items, setItems] = useState<Message[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  async function loadMore() {
    if (loading || nextOffset == null) return;
    setLoading(true);
    const r = await fetch(`/api/call/${callId}/messages?offset=${nextOffset}&limit=20`);
    const data = await r.json(); // { items, next_offset }
    setItems(prev => [...prev, ...data.items]);
    setNextOffset(data.next_offset); // null when there’s no more
    setLoading(false);
  }

  useEffect(() => { loadMore(); }, [callId]); // first page

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16;
      if (nearBottom) loadMore();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [listRef.current, loading, nextOffset]);

  return (
    <div
      ref={listRef}
      style={{ height: 600, overflow: "auto", border: "1px solid #ddd", padding: 8 }}
    >
      {items.map((m, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <b>{m.from}</b>: {m.text}
        </div>
      ))}
      {loading && <div style={{ padding: 8 }}>Loading…</div>}
      {nextOffset == null && <div style={{ padding: 8, opacity: 0.6 }}>No more messages</div>}
    </div>
  );
}
