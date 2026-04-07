import { useEffect, useRef } from "react";

function TodoItem({ todo, index, onToggle, onDelete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (todo.done && todo.crack && canvasRef.current) {
      drawCracks(canvasRef.current, todo.crack);
    }
  }, [todo.done, todo.crack]);

  function drawCracks(canvas, crack) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center hole
    ctx.beginPath();
    ctx.ellipse(crack.cx, crack.cy, 5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fill();

    crack.lines.forEach((line) => {
      setTimeout(() => {
        drawAnimatedLine(ctx, line.points, line.opacity);
      }, line.delay * 1000);
    });
  }

  function drawAnimatedLine(ctx, points, opacity) {
    if (points.length < 2) return;

    let seg = 0;
    const totalSegs = points.length - 1;

    function step() {
      if (seg >= totalSegs) return;
      const p1 = points[seg];
      const p2 = points[seg + 1];

      // Main crack line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Refraction glow
      ctx.beginPath();
      ctx.moveTo(p1.x + 1, p1.y + 1);
      ctx.lineTo(p2.x + 1, p2.y + 1);
      ctx.strokeStyle = `rgba(180,220,255,${opacity * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Noise dots
      for (let n = 0; n < 4; n++) {
        const tx = p2.x - p1.x;
        const ty = p2.y - p1.y;
        const len = Math.sqrt(tx * tx + ty * ty);
        const nx = -ty / len;
        const ny = tx / len;
        const spread = Math.random() * 6 - 3;
        const along = Math.random();
        const px = p1.x + tx * along + nx * spread;
        const py = p1.y + ty * along + ny * spread;

        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
        ctx.fill();
      }

      seg++;
      requestAnimationFrame(step);
    }

    step();
  }

  function generateCracks(cx, cy) {
    const lines = [];
    const numMain = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numMain; i++) {
      const angle = (360 / numMain) * i + (Math.random() * 30 - 15);
      const rad = angle * (Math.PI / 180);
      const length = 60 + Math.random() * 120;

      let points = [{ x: cx, y: cy }];
      let x = cx;
      let y = cy;

      const segments = 3 + Math.floor(Math.random() * 4);
      const segLen = length / segments;

      for (let s = 0; s < segments; s++) {
        const jitter = (Math.random() * 20 - 10) * (Math.PI / 180);
        x += Math.cos(rad + jitter) * segLen;
        y += Math.sin(rad + jitter) * segLen;
        points.push({ x, y });

        if (s === 1 && Math.random() > 0.4) {
          const bAngle = rad + (Math.random() * 60 - 30) * (Math.PI / 180);
          const bLen = segLen * (0.4 + Math.random() * 0.5);
          lines.push({
            points: [
              { x, y },
              { x: x + Math.cos(bAngle) * bLen, y: y + Math.sin(bAngle) * bLen }
            ],
            opacity: 0.3 + Math.random() * 0.3,
            delay: 0.1 + Math.random() * 0.2
          });
        }
      }

      lines.push({
        points,
        opacity: 0.5 + Math.random() * 0.4,
        delay: (i / numMain) * 0.15
      });
    }

    return lines;
  }

  function handleToggle(e) {
    if (todo.done) {
      onToggle(index, null);
      return;
    }

    const rect = e.currentTarget.closest("li").getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const crackData = {
      cx,
      cy,
      lines: generateCracks(cx, cy),
    };

    onToggle(index, crackData);
  }

  return (
    <li className={`todo-item ${todo.warping ? "warping" : ""}`}>
      <span
        className={`todo-text ${todo.done ? "done" : ""}`}
        onClick={handleToggle}
      >
        {todo.text}
      </span>

      {todo.done && todo.crack && (
        <canvas
          ref={canvasRef}
          className="crack-canvas"
          width={500}
          height={60}
        />
      )}

      <button className="delete-btn" onClick={() => onDelete(index)}>✕</button>
    </li>
  );
}

export default TodoItem;