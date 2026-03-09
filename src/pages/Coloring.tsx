import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const COLORS = [
  "#E31E24", "#FF6B35", "#FFD700", "#4CAF50", "#2196F3",
  "#9C27B0", "#FF69B4", "#00BCD4", "#795548", "#FF9800",
  "#000000", "#FFFFFF", "#9E9E9E", "#F5F5F5", "#8BC34A",
  "#E91E63", "#3F51B5", "#009688", "#CDDC39", "#FFC107",
];

const CAT_IMAGE = "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/f25e0dc6-e608-45b0-a7f6-31277725305c.jpg";
const PROXY_URL = "https://functions.poehali.dev/86688b07-9265-42b9-8dad-f85c7b8b5d6f";

export default function Coloring() {
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const catImgEl = useRef<HTMLImageElement | null>(null);
  const [selectedColor, setSelectedColor] = useState("#FFD700");
  const [brushSize, setBrushSize] = useState(18);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgBlobUrl, setImgBlobUrl] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Загружаем картинку через прокси (обход CORS) для последующего сохранения на canvas
    fetch(`${PROXY_URL}?url=${encodeURIComponent(CAT_IMAGE)}`)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImgBlobUrl(url);
        const img = new Image();
        img.onload = () => { catImgEl.current = img; };
        img.src = url;
      })
      .catch(() => {});
    return () => {
      if (imgBlobUrl) URL.revokeObjectURL(imgBlobUrl);
    };
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const paintDot = (x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.globalAlpha = tool === "eraser" ? 1 : 0.8;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : selectedColor;
    ctx.fill();
  };

  const paintLine = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.globalAlpha = tool === "eraser" ? 1 : 0.8;
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    paintDot(pos.x, pos.y);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (lastPos.current) {
      paintLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    }
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleReset = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;

    const merged = document.createElement("canvas");
    merged.width = drawCanvas.width;
    merged.height = drawCanvas.height;
    const ctx = merged.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, merged.width, merged.height);

    if (catImgEl.current) {
      ctx.drawImage(catImgEl.current, 0, 0, merged.width, merged.height);
    }
    ctx.drawImage(drawCanvas, 0, 0);

    const link = document.createElement("a");
    link.download = "kot-van-gog.png";
    link.href = merged.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="bg-gradient-to-b from-yellow-50 to-white py-5 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-heading font-bold text-primary mb-1">
            🎨 Раскрась Кота Ван Гога!
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Используй кисть и цвета, чтобы оживить нашего любимого кота. Готовую раскраску можно скачать!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
          {/* Панель инструментов */}
          <div className="bg-white rounded-3xl shadow-lg p-4 flex flex-col gap-3 w-full lg:w-52 order-2 lg:order-1" style={{ maxHeight: 'calc(95vh - 160px)', overflowY: 'auto' }}>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Цвета</p>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setTool("brush"); }}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color && tool === "brush" ? "#E31E24" : "#e2e8f0",
                      boxShadow: selectedColor === color && tool === "brush" ? "0 0 0 2px #E31E24" : undefined,
                      transform: selectedColor === color && tool === "brush" ? "scale(1.2)" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Размер кисти</p>
              <input
                type="range" min={4} max={50} value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Тонкая</span><span>Толстая</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant={tool === "brush" ? "default" : "outline"} className="rounded-xl w-full" onClick={() => setTool("brush")}>
                <Icon name="Paintbrush" className="mr-2" size={16} />Кисть
              </Button>
              <Button variant={tool === "eraser" ? "default" : "outline"} className="rounded-xl w-full" onClick={() => setTool("eraser")}>
                <Icon name="Eraser" className="mr-2" size={16} />Ластик
              </Button>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" className="rounded-xl w-full" onClick={handleReset}>
                <Icon name="RotateCcw" className="mr-2" size={16} />Очистить
              </Button>
              <Button className="rounded-xl w-full bg-primary hover:bg-primary/90" onClick={handleDownload}>
                <Icon name="Download" className="mr-2" size={16} />Скачать
              </Button>
            </div>
          </div>

          {/* Холст */}
          <div
            ref={containerRef}
            className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white order-1 lg:order-2 flex-1"
            style={{ cursor: tool === "eraser" ? "cell" : "crosshair", maxHeight: 'calc(95vh - 160px)' }}
          >
            {/* Картинка-подложка */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10 rounded-3xl">
                <Icon name="Loader2" className="animate-spin text-primary" size={40} />
              </div>
            )}
            <img
              ref={imgRef}
              src={imgBlobUrl || CAT_IMAGE}
              alt="Кот Ван Гог"
              className="block select-none pointer-events-none w-full h-full object-contain"
              style={{ maxHeight: 'calc(95vh - 160px)' }}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
            {/* Слой рисования поверх */}
            {imageLoaded && (
              <canvas
                ref={drawCanvasRef}
                width={700}
                height={700}
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={startDraw}
                onMouseMove={moveDraw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={moveDraw}
                onTouchEnd={stopDraw}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-200 shadow"
            style={{ backgroundColor: tool === "eraser" ? "#fff" : selectedColor }}
          />
          <span className="text-slate-500 text-sm font-medium">
            {tool === "eraser" ? "Ластик активен" : "Выбранный цвет"}
          </span>
        </div>
      </div>
    </div>
  );
}