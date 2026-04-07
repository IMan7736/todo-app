import { useEffect, useRef } from "react";

function TodoItem({ todo, index, onToggle, onDelete }) {
  const canvasRefractRef = useRef(null);
  const canvasReflectRef = useRef(null);
  const canvasFracturesRef = useRef(null);
  const canvasMainlineRef = useRef(null);
  const canvasNoiseRef = useRef(null);
  const liRef = useRef(null);

  useEffect(() => {
    if (todo.done && todo.crack && liRef.current) {
      const canvases = [
        canvasRefractRef.current,
        canvasReflectRef.current,
        canvasFracturesRef.current,
        canvasMainlineRef.current,
        canvasNoiseRef.current,
      ];

      // Capture the card as an image for refraction
      import("html2canvas").then(({ default: html2canvas }) => {
        html2canvas(liRef.current, { backgroundColor: null }).then(snapshot => {
          renderAll(canvases, snapshot, todo.crack);
        });
      });
    }
  }, [todo.done, todo.crack]);

  function describeLinePath(p1, p2, cv) {
    const o = {};
    o.dx = p2.x - p1.x;
    o.dy = p2.y - p1.y;
    o.dl = Math.sqrt(o.dx * o.dx + o.dy * o.dy);
    o.sx = o.dx / o.dl;
    o.sy = o.dy / o.dl;
    o.tx = o.dy / o.dl;
    o.ty = -o.dx / o.dl;
    o.mpp = Math.random() * 0.5 + 0.3;
    o.mpl1 = o.dl * o.mpp;
    o.mpl2 = o.dl - o.mpl1;
    const ll = Math.log(o.dl * Math.E);
    o.cma = Math.random() * ll * cv * 5 - (ll * cv * 5) / 2;
    o.cpt = {
      x: p1.x + o.sx * o.mpl1 + o.tx * o.cma,
      y: p1.y + o.sy * o.mpl1 + o.ty * o.cma,
    };
    o.bbx1 = Math.min(p1.x, p2.x, o.cpt.x);
    o.bby1 = Math.min(p1.y, p2.y, o.cpt.y);
    o.bbx2 = Math.max(p1.x, p2.x, o.cpt.x);
    o.bby2 = Math.max(p1.y, p2.y, o.cpt.y);
    o.bbwidth = o.bbx2 - o.bbx1;
    o.bbheight = o.bby2 - o.bby1;
    return o;
  }

  function findPointOnCircle(c, r, a) {
    const rad = a * (Math.PI / 180);
    return {
      x: c.x + r * Math.cos(rad),
      y: c.y + r * Math.sin(rad),
    };
  }

  function generateCrackPaths(cx, cy, width, height) {
    const c = { x: cx, y: cy };
    const lines = [];
    const main = [[]];
    let level = 1;
    let r = 10;
    const num = 16;
    let ang = 360 / (num + 1);

    while (main[0].length < num) {
      const num2 = ang * main[0].length + 10;
      const pt2 = findPointOnCircle(c, 4, num2);
      main[0].push({ angle: num2, point: pt2 });
    }

    while (r < Math.max(width, height) * 1.5) {
      main[level] = [];
      for (let g = 0; g < num; g++) {
        const pt1 = main[level - 1][g];
        main[level][g] = null;
        if (pt1) {
          ang = pt1.angle + Math.random() * 10 / num - 10 / 2 / num;
          if (ang > 350) ang = 350;
          const pt2 = findPointOnCircle(
            c,
            r + Math.random() * r / level - r / (level * 2),
            ang
          );
          main[level][g] = { angle: ang, point: pt2 };
        }
      }
      level++;
      r *= Math.random() * 1.5 + 1.2;
    }

    for (let l = 1; l < level; l++) {
      for (let g = 0; g < num; g++) {
        const pt1 = main[l - 1][g];
        const pt2 = main[l][g];
        if (pt1 && pt2) {
          lines.push({
            p1: pt1.point,
            p2: pt2.point,
            desc: describeLinePath(pt1.point, pt2.point, 0.3),
            level: l,
          });
          if (Math.random() < 0.6) {
            const pt3 = main[l][(g + 1) % num];
            if (pt3) {
              lines.push({
                p1: pt2.point,
                p2: pt3.point,
                desc: describeLinePath(pt2.point, pt3.point, 0.3),
                level: l,
              });
            }
          }
          if (l < level - 1 && Math.random() < 0.3) {
            const pt3 = main[l + 1][(g + 1) % num];
            if (pt3) {
              lines.push({
                p1: pt2.point,
                p2: pt3.point,
                desc: describeLinePath(pt2.point, pt3.point, 0.3),
                level: l,
              });
            }
          }
        }
      }
    }
    return lines;
  }

  function renderRefract(cvs, img, p1, p2, line) {
    const ctx = cvs.getContext("2d");
    const { tx, ty, cpt: cp, bbx1: x1, bby1: y1, bbwidth, bbheight } = line;
    const ns = 3, td = 6;
    const w = bbwidth + ns * 2;
    const h = bbheight + ns * 2;
    ctx.globalAlpha = 0.15;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x + ns * tx, p1.y + ns * ty);
    ctx.quadraticCurveTo(cp.x, cp.y, p2.x + ns * tx, p2.y + ns * ty);
    ctx.lineTo(p2.x - ns * tx, p2.y - ns * ty);
    ctx.quadraticCurveTo(cp.x, cp.y, p1.x - ns * tx, p1.y - ns * ty);
    ctx.closePath();
    ctx.clip();
    try {
      ctx.drawImage(img, x1 + td * tx, y1 + td * ty, w, h, x1, y1, w, h);
    } catch (e) {}
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function renderReflect(cvs, p1, p2, line) {
    const ctx = cvs.getContext("2d");
    const { tx, ty, dl } = line;
    const dd = dl / 3;
    ctx.globalAlpha = 0.3;
    let grd;
    try {
      grd = ctx.createLinearGradient(
        p1.x + dd * tx, p1.y + dd * ty,
        p1.x - dd * tx, p1.y - dd * ty
      );
    } catch (e) { return; }
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.5)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(p1.x + dd * tx, p1.y + dd * ty);
    ctx.lineTo(p2.x + dd * tx, p2.y + dd * ty);
    ctx.lineTo(p2.x - dd * tx, p2.y - dd * ty);
    ctx.lineTo(p1.x - dd * tx, p1.y - dd * ty);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function renderFractures(cvs, p1, p2, line) {
    const ctx = cvs.getContext("2d");
    const { tx, ty, sx, sy, dl, mpp, cma, mpl1, mpl2 } = line;
    const sz = 20;
    const mp = dl / 2;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    for (let s = 0; s < dl; s++) {
      let c;
      if (s < mpp * dl)
        c = cma * (1 - Math.pow((mpl1 - s) / mpl1, 2));
      else
        c = cma * (1 - Math.pow((mpl2 - (dl - s)) / mpl2, 2));
      c /= 2;
      const p = Math.pow((s > mp ? dl - s : s) / mp, 2);
      const w = Math.random() * 1 + 1;
      const h1 = sz - Math.random() * p * sz + 1;
      const h2 = sz - Math.random() * p * sz + 1;
      const t = Math.random() * 20 - 10;
      if (Math.random() > p - sz / mp) {
        ctx.fillStyle = `rgba(255,255,255,${Math.round(Math.random() * 8 + 4) / 12})`;
        ctx.beginPath();
        ctx.moveTo(p1.x + s * sx + c * tx, p1.y + s * sy + c * ty);
        ctx.lineTo(p1.x + (t + s + w / 2) * sx + h1 * tx + c * tx, p1.y + (-t + s + w / 2) * sy + h1 * ty + c * ty);
        ctx.lineTo(p1.x + (s + w) * sx + c * tx, p1.y + (s + w) * sy + c * ty);
        ctx.lineTo(p1.x + (-t + s + w / 2) * sx - h2 * tx + c * tx, p1.y + (t + s + w / 2) * sy - h2 * ty + c * ty);
        ctx.closePath();
        ctx.fill();
      }
      s += mp * (p / 2 + 0.5);
    }
    ctx.globalAlpha = 1;
  }

  function renderMainLine(cvs, p1, p2, line) {
    const ctx = cvs.getContext("2d");
    const { tx, ty, cpt: cp } = line;
    let st = 3;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1;
    while (st > 0) {
      const alpha = Math.round(Math.random() * 8 + 4) / 12;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(p1.x + st * tx, p1.y + st * ty);
      ctx.quadraticCurveTo(cp.x, cp.y, p2.x + st * tx, p2.y + st * ty);
      ctx.stroke();
      st--;
    }
    ctx.globalAlpha = 1;
  }

  function renderNoise(cvs, p1, p2, line) {
    const ctx = cvs.getContext("2d");
    const { tx, ty, sx, sy, dl, mpp, cma, mpl1, mpl2 } = line;
    const dd = dl / 3;
    const step = 2;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    for (let s = 0; s < dl; s++) {
      let c;
      if (s < mpp * dl)
        c = cma * (1 - Math.pow((mpl1 - s) / mpl1, 2));
      else
        c = cma * (1 - Math.pow((mpl2 - (dl - s)) / mpl2, 2));
      c /= 2;
      for (let t = -dd; t < dd; t++) {
        if (Math.random() > Math.abs(t) / dd) {
          let cnt = Math.floor(Math.random() * 4 + 0.5);
          const m = Math.random() * 2 - 1;
          while (cnt >= 0) {
            ctx.strokeStyle = `rgba(255,255,255,${Math.round(Math.random() * 10 + 2) / 30})`;
            const pos = Math.floor(Math.random() * 5 + 0.5);
            ctx.beginPath();
            ctx.moveTo(p1.x + (s - pos) * sx + (m + t) * tx + c * tx, p1.y + (s - pos) * sy + (-m + t) * ty + c * ty);
            ctx.lineTo(p1.x + (s + pos) * sx + (-m + t) * tx + c * tx, p1.y + (s + pos) * sy + (m + t) * ty + c * ty);
            ctx.stroke();
            cnt--;
          }
        }
        t += Math.random() * step * 2;
      }
      s += Math.random() * step * 4;
    }
    ctx.globalAlpha = 1;
  }

  function renderAll(canvases, img, crack) {
    const paths = crack.paths;
    canvases.forEach(cvs => {
      const ctx = cvs.getContext("2d");
      ctx.clearRect(0, 0, cvs.width, cvs.height);
    });

    // Center hole
    const ctx = canvases[3].getContext("2d");
    ctx.beginPath();
    ctx.ellipse(crack.cx, crack.cy, 5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fill();

    paths.forEach(line => {
      renderRefract(canvases[0], img, line.p1, line.p2, line.desc);
      renderReflect(canvases[1], line.p1, line.p2, line.desc);
      renderFractures(canvases[2], line.p1, line.p2, line.desc);
      renderMainLine(canvases[3], line.p1, line.p2, line.desc);
      renderNoise(canvases[4], line.p1, line.p2, line.desc);
    });
  }

  function handleToggle(e) {
    if (todo.done) {
      onToggle(index, null);
      return;
    }
    const rect = e.currentTarget.closest("li").getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const crackData = {
      cx, cy,
      paths: generateCrackPaths(cx, cy, width, height),
    };
    onToggle(index, crackData);
  }

  const w = 500;
  const h = 60;

  return (
    <li ref={liRef} className={`todo-item ${todo.warping ? "warping" : ""}`}>
      <span
        className={`todo-text ${todo.done ? "done" : ""}`}
        onClick={handleToggle}
      >
        {todo.text}
      </span>

      {todo.done && todo.crack && (
        <>
          <canvas ref={canvasRefractRef} className="crack-canvas" width={w} height={h} />
          <canvas ref={canvasReflectRef} className="crack-canvas" width={w} height={h} />
          <canvas ref={canvasFracturesRef} className="crack-canvas" width={w} height={h} />
          <canvas ref={canvasMainlineRef} className="crack-canvas" width={w} height={h} />
          <canvas ref={canvasNoiseRef} className="crack-canvas" width={w} height={h} />
        </>
      )}

      <button className="delete-btn" onClick={() => onDelete(index)}>✕</button>
    </li>
  );
}

export default TodoItem;