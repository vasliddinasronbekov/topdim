import type { Item } from "@/lib/types";

export function ItemPoster({
  item,
  className = "",
}: {
  item: Item;
  className?: string;
}) {
  return (
    <div
      className={`poster ${className}`}
      style={{
        background: `linear-gradient(145deg, hsl(${item.hue} 55% 42%), hsl(${(item.hue + 40) % 360} 40% 22%))`,
        minHeight: 180,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, white, transparent 40%), repeating-linear-gradient(135deg, transparent 0 10px, rgba(255,255,255,.06) 10px 12px)",
        }}
      />
      <div className="relative z-10 flex h-full min-h-[180px] flex-col justify-between p-5 text-white">
        <span className="text-5xl drop-shadow">{item.emoji}</span>
        <div className="text-sm font-medium opacity-90">
          {item.color ? item.color : "—"} {item.brand ? `· ${item.brand}` : ""}
        </div>
      </div>
    </div>
  );
}
