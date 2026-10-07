"use client"

// Simple SVG barcode renderer — no external library needed
export function BarcodeDisplay({ value }: { value: string }) {
  // Convert string to numeric bar pattern using char codes
  const bars: boolean[] = []
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    for (let b = 7; b >= 0; b--) {
      bars.push(Boolean((code >> b) & 1))
    }
  }

  const barWidth = 2
  const totalWidth = bars.length * barWidth
  const height = 60

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="max-w-full"
        style={{ shapeRendering: "crispEdges" }}
      >
        {bars.map((filled, i) =>
          filled ? (
            <rect
              key={i}
              x={i * barWidth}
              y={0}
              width={barWidth}
              height={height}
              fill="black"
            />
          ) : null,
        )}
      </svg>
      <p className="font-mono text-xs text-gray-600">{value}</p>
    </div>
  )
}
