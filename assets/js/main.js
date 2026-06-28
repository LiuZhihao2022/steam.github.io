/* ============================================================
   STEAM project site — interactions
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- KaTeX equations ---------- */
  if (window.katex) {
    $$("[data-tex]").forEach((el) => {
      try { katex.render(el.dataset.tex, el, { throwOnError: false, displayMode: false }); }
      catch (e) { el.textContent = el.dataset.tex; }
    });
  }

  /* ============================================================
     OVERVIEW "at a glance" diagram — mostly visual:
     heterogeneous mixed-quality data → STEAM → frame-level good/bad
     advantage → offline real-robot RL.
     ============================================================ */
  (function () {
    const ov = document.getElementById("ovDiagram");
    if (!ov) return;
    const NS = "http://www.w3.org/2000/svg";
    const add = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; ov.appendChild(e); return e; };
    const GOOD = "#ea580c", BAD = "#dcd2c4", BADBORDER = "#c9bfb1", BADDOT = "#a89e90", INK = "#2a241e", MUT = "#9a9084";
    const mono = "'Space Mono', ui-monospace, monospace", disp = "'Space Grotesk', sans-serif";

    // per-trajectory data: frames, per-frame quality, advantage-curve y (baseline 344)
    const TRAJ = {
      expert: { frames: ["ov1", "ov2", "ov3", "ov4", "ov5", "ov6", "ov7"], good: [1, 1, 1, 0, 1, 1, 1],
        yv: [250, 244, 240, 300, 244, 240, 246], note: "Expert — advantage stays high throughout, with brief dips at retries." },
      rollout: { frames: ["rb1", "rb2", "rb3", "rb4", "rb5", "rb6", "rb7"], good: [1, 1, 1, 0, 0, 0, 0],
        yv: [250, 246, 262, 300, 322, 328, 326], note: "Rollout — advantage drops toward zero once the policy enters a failure." },
      human: { frames: ["hc1", "hc2", "hc3", "hc4", "hc5", "hc6", "hc7"], good: [0, 0, 0, 0, 1, 1, 1],
        yv: [312, 324, 328, 304, 262, 244, 240], note: "Human correction — a failure-like dip, then recovery after the human takes over." },
    };

    const FW = 100, FH = 70, GAP = 8, X0 = 56, FY = 22;
    const cx = (i) => X0 + i * (FW + GAP) + FW / 2;
    const baseY = 344, midX = cx(3);

    function buildOv(key) {
      const T = TRAJ[key];
      ov.innerHTML = "";

      // ---- filmstrip of real frames (one episode), quality-coded ----
      T.frames.forEach((img, i) => {
        const x = X0 + i * (FW + GAP), g = T.good[i];
        const st = "clip-path: inset(0 round 9px);" + (g ? "" : "filter:grayscale(1) opacity(.5);");
        add("image", { href: "assets/img/" + img + ".jpg", x: x, y: FY, width: FW, height: FH, preserveAspectRatio: "xMidYMid slice", style: st });
        add("rect", { x: x, y: FY, width: FW, height: FH, rx: 9, fill: "none", stroke: g ? GOOD : BADBORDER, "stroke-width": g ? 2.2 : 1.4 });
        add("rect", { x: x, y: FY + FH + 5, width: FW, height: 5, rx: 2.5, fill: g ? GOOD : BAD });
        const bx = x + FW - 12, by = FY + 12;
        add("circle", { cx: bx, cy: by, r: 8.5, fill: g ? GOOD : BADDOT });
        if (g) add("path", { d: "M" + (bx - 4) + " " + by + " l3 3 6 -7", fill: "none", stroke: "#fff", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
        else add("path", { d: "M" + (bx - 3.3) + " " + (by - 3.3) + " l6.6 6.6 M" + (bx + 3.3) + " " + (by - 3.3) + " l-6.6 6.6", fill: "none", stroke: "#fff", "stroke-width": 2, "stroke-linecap": "round" });
      });

      // ---- arrow down to STEAM ----
      add("path", { d: "M" + midX + " 100 V114 M" + (midX - 4) + " 109 l4 5 4 -5", fill: "none", stroke: GOOD, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" });

      // ---- STEAM framework box (the whole pipeline in one node) ----
      const BW = 470, BX = midX - BW / 2;
      add("rect", { x: BX, y: 116, width: BW, height: 108, rx: 18, fill: "#fff3ea", stroke: GOOD, "stroke-width": 1.8 });
      add("text", { x: midX, y: 150, "text-anchor": "middle", "font-family": disp, "font-size": 28, "font-weight": 700, fill: "#c2410c", "letter-spacing": "0.04em" }, "STEAM");
      add("text", { x: midX, y: 173, "text-anchor": "middle", "font-family": mono, "font-size": 11, fill: MUT }, "Self-supervised Temporal Ensemble Advantage Modeling");
      const chips = ["1 · temporal offset", "2 · ensemble (min)", "3 · advantage"];
      const cw = 132, cgap = 10, ch = 26, ctot = chips.length * cw + (chips.length - 1) * cgap, cx0 = midX - ctot / 2;
      chips.forEach((c, i) => {
        const x = cx0 + i * (cw + cgap);
        add("rect", { x: x, y: 188, width: cw, height: ch, rx: 13, fill: "#fff", stroke: "#f3c9ac", "stroke-width": 1.2 });
        add("text", { x: x + cw / 2, y: 205, "text-anchor": "middle", "font-family": mono, "font-size": 11, fill: "#c2410c" }, c);
      });

      // ---- arrow down to advantage curve ----
      add("path", { d: "M" + midX + " 224 V238 M" + (midX - 4) + " 233 l4 5 4 -5", fill: "none", stroke: GOOD, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" });

      // ---- advantage curve (per trajectory) with Y axis ----
      add("line", { x1: 46, y1: 234, x2: 46, y2: baseY, stroke: "#cbb9a6", "stroke-width": 1.2 });
      add("path", { d: "M42 240 l4 -6 4 6", fill: "none", stroke: "#cbb9a6", "stroke-width": 1.2, "stroke-linecap": "round", "stroke-linejoin": "round" });
      add("text", { x: 26, y: 289, "text-anchor": "middle", transform: "rotate(-90 26 289)", "font-family": mono, "font-size": 12, "font-weight": 700, fill: MUT }, "Advantage");
      add("line", { x1: 52, y1: baseY, x2: cx(6) + 6, y2: baseY, stroke: "#e2dace", "stroke-width": 1 });
      const pts = T.frames.map((_, i) => [cx(i), T.yv[i]]);
      const line = "M" + pts.map((p) => p[0] + " " + p[1]).join(" L");
      add("path", { d: line + " L" + cx(6) + " " + baseY + " L" + cx(0) + " " + baseY + " Z", fill: GOOD, "fill-opacity": 0.1, stroke: "none" });
      add("path", { d: line, fill: "none", stroke: GOOD, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" });
      T.frames.forEach((_, i) => add("circle", { cx: cx(i), cy: T.yv[i], r: 4.4, fill: T.good[i] ? GOOD : BADDOT }));
      add("text", { x: 56, y: 362, "font-family": mono, "font-size": 12, fill: MUT }, T.note);

      // ---- arrow → offline real-robot RL (nicer robot) ----
      const RX = 905, RY = 270;
      add("path", { d: "M" + (cx(6) + 12) + " " + RY + " H" + (RX - 44) + " M" + (RX - 50) + " " + (RY - 5) + " l6 5 -6 5", fill: "none", stroke: GOOD, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
      add("rect", { x: RX - 30, y: RY - 26, width: 60, height: 52, rx: 16, fill: "#fff", stroke: GOOD, "stroke-width": 2.2 });
      add("rect", { x: RX - 38, y: RY - 8, width: 6, height: 18, rx: 3, fill: "#fff3ea", stroke: GOOD, "stroke-width": 1.6 });
      add("rect", { x: RX + 32, y: RY - 8, width: 6, height: 18, rx: 3, fill: "#fff3ea", stroke: GOOD, "stroke-width": 1.6 });
      add("line", { x1: RX, y1: RY - 26, x2: RX, y2: RY - 36, stroke: GOOD, "stroke-width": 2, "stroke-linecap": "round" });
      add("circle", { cx: RX, cy: RY - 40, r: 4, fill: GOOD });
      add("circle", { cx: RX - 12, cy: RY - 4, r: 5.5, fill: GOOD });
      add("circle", { cx: RX + 12, cy: RY - 4, r: 5.5, fill: GOOD });
      add("circle", { cx: RX - 13.6, cy: RY - 5.6, r: 1.8, fill: "#fff" });
      add("circle", { cx: RX + 10.4, cy: RY - 5.6, r: 1.8, fill: "#fff" });
      add("path", { d: "M" + (RX - 9) + " " + (RY + 11) + " Q" + RX + " " + (RY + 18) + " " + (RX + 9) + " " + (RY + 11), fill: "none", stroke: GOOD, "stroke-width": 2.2, "stroke-linecap": "round" });
      add("text", { x: RX, y: RY + 48, "text-anchor": "middle", "font-family": mono, "font-size": 12, "font-weight": 700, fill: INK }, "offline RL");
      add("text", { x: RX, y: RY + 63, "text-anchor": "middle", "font-family": mono, "font-size": 11, fill: MUT }, "on real robots");
    }

    document.querySelectorAll(".ov-tabs .task-tab").forEach((tab) =>
      tab.addEventListener("click", () => {
        document.querySelectorAll(".ov-tabs .task-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        buildOv(tab.dataset.ovtraj);
      })
    );
    buildOv("expert");
  })();

  /* ---------- nav ---------- */
  const topbar = $("#topbar");
  const toTop = $("#toTop");
  const onScroll = () => {
    topbar.classList.toggle("scrolled", window.scrollY > 40);
    toTop.classList.toggle("show", window.scrollY > 700);
  };
  const navLinks = $("#navLinks");
  const navToggle = $("#navToggle");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ============================================================
     FRAME-PAIR → BIN diagram (Step 02): select → scale → predict.
     Three offsets shown at once. Each is length-scaled (Δ → Δ̃, grows),
     then the predictor maps it to a one-hot training target and a
     discrete inference distribution (both bar histograms). A gentle
     highlight cycles through the three offsets.
     ============================================================ */
  const binfig = $("#binfig");
  const plLanes = $("#plLanes");
  if (binfig && plLanes) {
    const DELTAS = [
      { k: 0, fi: "bin_f0.jpg", fj: "bin_f1.jpg", raw: 2, scaled: 3, color: "#fb923c" },   // forward · small
      { k: 1, fi: "bin_f0.jpg", fj: "bin_f2.jpg", raw: 3, scaled: 5, color: "#ea580c" },   // forward · large
      { k: 2, fi: "bin_f2.jpg", fj: "bin_f0.jpg", raw: -3, scaled: -4, color: "#a8a29e" }, // reversed
    ];
    const sign = (v) => (v > 0 ? "+" : "") + v;

    // ---- lanes: ① select pair  →  ② length-scale (Δ grows to Δ̃) ----
    DELTAS.forEach((d) => {
      const rawW = Math.min(100, (Math.abs(d.raw) / 6) * 100);
      const scW = Math.min(100, (Math.abs(d.scaled) / 6) * 100);
      const lane = document.createElement("div");
      lane.className = "pl-lane k" + d.k;
      lane.dataset.k = d.k;
      lane.style.setProperty("--accent", d.color);
      lane.innerHTML =
        '<div class="pl-sel"><img src="assets/img/' + d.fi + '" alt=""><span class="a">&rarr;</span><img src="assets/img/' + d.fj + '" alt=""></div>' +
        '<div class="pl-raw">Δ = ' + sign(d.raw) + "</div>" +
        '<div class="pl-op">× L<sub>max</sub>/L<sub>τ</sub></div>' +
        '<div class="pl-scaled"><div class="pl-bars">' +
          '<span class="pl-bar raw" style="width:' + rawW + '%"></span>' +
          '<span class="pl-bar sc" style="width:' + scW + '%"></span>' +
        '</div><b>Δ̃ = ' + sign(d.scaled) + "</b></div>";
      plLanes.appendChild(lane);
    });

    // ---- Step 3: ONE discrete-bin histogram (predicted distribution),
    //      with x-ticks per bin and a ▼ marker at the one-hot target bin ----
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, txt) => { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); if (txt != null) e.textContent = txt; return e; };
    const chart = $("#bfChart");
    const N = 13, W = 640, padX = 40, baseY = 150, topY = 30;   // signed bins −6..+6
    const plotW = W - 2 * padX, binW = plotW / N, barW = binW * 0.6;
    const idxOf = (off) => off + 6;
    const cxOf = (i) => padX + binW * i + binW / 2;             // bin center x

    if (chart) {
      // axis baseline
      chart.appendChild(mk("line", { x1: padX - 6, y1: baseY, x2: W - padX + 6, y2: baseY, stroke: "#ddd4c8", "stroke-width": 1.2 }));
      // x-ticks + labels for every bin (offset value)
      for (let i = 0; i < N; i++) {
        const cx = cxOf(i), off = i - 6;
        chart.appendChild(mk("line", { x1: cx, y1: baseY, x2: cx, y2: baseY + 5, stroke: "#c9bfb1", "stroke-width": 1 }));
        chart.appendChild(mk("text", { x: cx, y: baseY + 18, "text-anchor": "middle", "font-family": "'Space Mono', monospace", "font-size": 11, fill: off === 0 ? "#897f73" : "#a89e90" }, (off > 0 ? "+" : "") + off));
      }
      // end captions + x-axis title
      chart.appendChild(mk("text", { x: padX - 6, y: baseY + 34, "text-anchor": "start", "font-family": "'Space Mono', monospace", "font-size": 10.5, fill: "#a89e90" }, "− regression"));
      chart.appendChild(mk("text", { x: W - padX + 6, y: baseY + 34, "text-anchor": "end", "font-family": "'Space Mono', monospace", "font-size": 10.5, fill: "#a89e90" }, "progress +"));
      chart.appendChild(mk("text", { x: W / 2, y: baseY + 50, "text-anchor": "middle", "font-family": "'Space Mono', monospace", "font-size": 11, fill: "#897f73" }, "temporal-offset bins"));

      const amp = baseY - topY, sigma = 1.45;
      DELTAS.forEach((d) => {
        const c = idxOf(d.scaled);
        // predicted distribution: a bar per bin (gaussian over bins)
        for (let i = 0; i < N; i++) {
          const g = Math.exp(-((i - c) ** 2) / (2 * sigma * sigma));
          if (g < 0.04) continue;
          const h = amp * g;
          chart.appendChild(mk("rect", { x: cxOf(i) - barW / 2, y: baseY - h, width: barW, height: h, rx: 2.5, fill: d.color, "fill-opacity": 0.82, class: "k" + d.k }));
        }
        // ▼ one-hot target marker at the scaled bin
        const tx = cxOf(c);
        chart.appendChild(mk("line", { x1: tx, y1: topY - 10, x2: tx, y2: baseY, stroke: d.color, "stroke-width": 1.2, "stroke-dasharray": "3 3", "stroke-opacity": 0.7, class: "k" + d.k }));
        chart.appendChild(mk("path", { d: "M" + (tx - 6) + " " + (topY - 16) + "h12l-6 9z", fill: d.color, class: "k" + d.k }));
      });

      const setHi = (act) => {
        DELTAS.forEach((d) => {
          const on = d.k === act;
          binfig.querySelectorAll(".k" + d.k).forEach((e) => { e.style.opacity = on ? "1" : "0.12"; });
          const lane = plLanes.querySelector('.pl-lane[data-k="' + d.k + '"]');
          if (lane) lane.classList.toggle("is-sel", on);
        });
      };
      // Click a frame-pair row to light up only its Step 1/2/3.
      plLanes.querySelectorAll(".pl-lane").forEach((lane) => {
        lane.setAttribute("role", "button");
        lane.setAttribute("tabindex", "0");
        const sel = () => setHi(+lane.dataset.k);
        lane.addEventListener("click", sel);
        lane.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sel(); } });
      });
      setHi(0); // default: first offset selected
    }
  }

  /* ============================================================
     ADVANTAGE VISUALIZATION — task tabs + 4 videos
     ============================================================ */
  const ADV_EPISODES = [
    { key: "expert", label: "Expert demonstration", cls: "tag-good",
      text: "Stays <strong>high</strong> through most of the episode, with brief dips at retries and corrections." },
    { key: "rollout_succ", label: "Successful rollout", cls: "tag-good",
      text: "Lower and more <strong>fluctuating</strong> — slower, but still effective; the curve stays mostly positive." },
    { key: "rollout_fail", label: "Failed rollout", cls: "tag-bad",
      text: "<strong>Drops to near zero</strong> once the policy gets stuck in a failure state, with no recovery." },
    { key: "human_corr", label: "Human correction", cls: "tag-warn",
      text: "A failure-like dip, then a clear <strong>recovery</strong> once a human takes over." },
  ];
  // Advantage clips per task. Only towel folding has clips today; the
  // other three are placeholders until videos are supplied.
  // pnp & cola have no DAgger, so no human-correction clip (3 episodes each).
  const ADV_VIDEOS = {
    towel: { expert: "adv/expert.mp4", rollout_succ: "adv/rollout_succ.mp4", rollout_fail: "adv/rollout_fail.mp4", human_corr: "adv/human_corr.mp4" },
    chips: { expert: "adv/chips_expert.mp4", rollout_succ: "adv/chips_rollout_succ.mp4", rollout_fail: "adv/chips_rollout_fail.mp4", human_corr: "adv/chips_human_corr.mp4" },
    cola: { expert: "adv/cola_expert.mp4", rollout_succ: "adv/cola_rollout_succ.mp4", rollout_fail: "adv/cola_rollout_fail.mp4" },
    pnp: { expert: "adv/pnp_expert.mp4", rollout_succ: "adv/pnp_rollout_succ.mp4", rollout_fail: "adv/pnp_rollout_fail.mp4" },
  };
  const ADV_TAKEOVER = { towel: 24, chips: 40 };  // sec where the human takes over (per task, when known)
  const advGrid = $("#advGrid");
  function buildAdv(task) {
    const vids = ADV_VIDEOS[task] || {};
    advGrid.innerHTML = "";
    // render only the episode types this task actually has
    const MV = "?v=15"; // bump to force-refresh advantage media when a clip is replaced
    ADV_EPISODES.filter((ep) => vids[ep.key]).forEach((ep) => {
      const vf = vids[ep.key];
      const poster = "assets/poster/adv_" + vf.split("/").pop().replace(".mp4", ".jpg") + MV;
      const cell = document.createElement("div");
      cell.className = "adv-cell";
      cell.innerHTML =
        '<div class="vid-box"><video controls autoplay muted loop playsinline preload="metadata" ' +
        'poster="' + poster + '"><source src="assets/video/' + vf + MV + '" type="video/mp4"></video></div>' +
        '<div class="adv-meta"><span class="tag ' + ep.cls + '">' + ep.label + "</span><p>" + ep.text + "</p></div>";
      const v = cell.querySelector("video");
      // Human-correction: flag the moment the human takes over
      if (ep.key === "human_corr" && ADV_TAKEOVER[task] != null) {
        const T = ADV_TAKEOVER[task];
        const mark = document.createElement("span");
        mark.className = "adv-marker";
        mark.innerHTML = '<span class="dot"></span>Human takes over · 0:' + String(T).padStart(2, "0");
        cell.querySelector(".vid-box").appendChild(mark);
        v.addEventListener("timeupdate", () => mark.classList.toggle("show", v.currentTime >= T));
      }
      v.play().catch(() => {});
      advGrid.appendChild(cell);
    });
  }
  $$(".adv-task-tabs .task-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      $$(".adv-task-tabs .task-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      buildAdv(tab.dataset.advtask);
    })
  );
  if (advGrid) buildAdv("towel");

  /* ============================================================
     DEMOS — per-video controls, speed, expand-to-lightbox
     ============================================================ */
  const DEMOS = {
    towel: {
      blurb: "Bimanual ARX dual-arm · long-horizon, five stages: pick up the towel → flatten → three consecutive folds.",
      clips: [
        { m: "STEAM (Ours)", f: "towel/steam.mp4", ours: true },
        { m: "BC", f: "towel/bc.mp4" },
        { m: "HG-DAgger", f: "towel/dagger.mp4" },
        { m: "RECAP", f: "towel/recap.mp4" },
      ],
    },
    chips: {
      blurb: "Bimanual checkout · pick items and pass them through, one after another.",
      clips: [
        { m: "STEAM (Ours)", f: "chips/steam.mp4", ours: true },
        { m: "BC", f: "chips/bc.mp4" },
        { m: "HG-DAgger", f: "chips/dagger.mp4" },
        { m: "RECAP", f: "chips/recap.mp4" },
      ],
    },
    cola: {
      blurb: "Bimanual restocking · place cola cans onto the shelf without knocking others over.",
      clips: [
        { m: "STEAM (Ours)", f: "cola/steam.mp4", ours: true },
        { m: "BC", f: "cola/bc.mp4" },
        { m: "HG-DAgger", f: "cola/dagger.mp4" },
        { m: "RECAP", f: "cola/recap.mp4" },
      ],
    },
    pnp: {
      blurb: "Single Franka arm · short-horizon, two stages: grasp an object from the left plate → place it on the right plate.",
      clips: [
        { m: "STEAM (Ours)", f: "pnp/steam.mp4", ours: true },
        { m: "BC", f: "pnp/bc.mp4" },
        { m: "RECAP", f: "pnp/recap.mp4" },
      ],
    },
  };
  const SPEEDS = [0.5, 1, 2];
  const grid = $("#demoGrid");
  const blurb = $("#taskBlurb");
  const posterFor = (f) => { const [t, file] = f.split("/"); return "assets/poster/" + t + "_" + file.replace(".mp4", ".jpg"); };

  function buildTask(key) {
    const t = DEMOS[key];
    blurb.textContent = t.blurb;
    grid.className = "demo-grid " + (t.clips.length >= 4 ? "cols-2" : "cols-3");
    grid.innerHTML = "";
    t.clips.forEach((c) => {
      const cell = document.createElement("div");
      cell.className = "demo-cell" + (c.ours ? " ours" : "");
      const speedBtns = SPEEDS.map((s) =>
        '<button data-s="' + s + '"' + (s === 1 ? ' class="is-active"' : "") + ">" + s + "&times;</button>"
      ).join("");
      cell.innerHTML =
        '<div class="vid-box"><video controls autoplay muted loop playsinline preload="metadata" ' +
        'poster="' + posterFor(c.f) + '"><source src="assets/video/' + c.f + '" type="video/mp4"></video></div>' +
        '<div class="cell-bar">' +
          '<span class="cell-label' + (c.ours ? " is-ours" : "") + '">' + c.m + "</span>" +
          '<div class="cell-right">' +
            '<div class="cell-speed">' + speedBtns + "</div>" +
            '<button class="cell-expand" aria-label="Enlarge"><svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg></button>' +
          "</div>" +
        "</div>";
      const v = cell.querySelector("video");
      v.play && v.play().catch(() => {});
      // per-video speed
      cell.querySelectorAll(".cell-speed button").forEach((b) =>
        b.addEventListener("click", () => {
          cell.querySelectorAll(".cell-speed button").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          v.playbackRate = parseFloat(b.dataset.s);
        })
      );
      cell.querySelector(".cell-expand").addEventListener("click", () => openLightbox(c, key, v.playbackRate));
      grid.appendChild(cell);
    });
  }
  $$("#demos .task-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      $$("#demos .task-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      buildTask(tab.dataset.task);
    })
  );
  buildTask("towel");

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"), lbVideo = $("#lbVideo"), lbCap = $("#lbCap");
  const TASKNAME = { towel: "Towel Folding", chips: "Chip Checkout", cola: "Cola Restocking", pnp: "Pick-and-Place" };
  function openLightbox(c, key, rate) {
    lbVideo.src = "assets/video/" + c.f;
    lbVideo.playbackRate = rate || 1;
    lbCap.textContent = c.m + " — " + TASKNAME[key];
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    lbVideo.play().catch(() => {});
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lbVideo.pause(); lbVideo.removeAttribute("src"); lbVideo.load();
    document.body.style.overflow = "";
  }
  $("#lbClose").addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox(); });

  /* ---------- BibTeX copy ---------- */
  const copyBtn = $("#copyBib");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText($("#bibText").textContent).then(
      () => { copyBtn.textContent = "Copied ✓"; copyBtn.classList.add("copied");
        setTimeout(() => { copyBtn.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 1800); },
      () => (copyBtn.textContent = "Press ⌘C")
    );
  });

  /* ============================================================
     RESULTS CHART (custom canvas, gap-filling)
     ============================================================ */
  const TASKS = ["Towel Folding", "Chip Checkout", "Pick-and-Place", "Cola Restocking"];
  const METHOD = {
    order: ["BC", "HG-DAgger", "RECAP", "STEAM"],
    colors: { BC: "#cabfb1", "HG-DAgger": "#a8998a", RECAP: "#6f6459", STEAM: "#ea580c" },
    succ: { BC: [33.3, 39.5, 63.8, 52], "HG-DAgger": [40, 53.3, null, 58.3], RECAP: [55.6, 53.3, 53.8, 52.9], STEAM: [92.3, 93.8, 80, 75] },
    score: { BC: [3.3, 4.6, 1.5, 2.36], "HG-DAgger": [3.7, 6, null, 2.6], RECAP: [2.9, 5.33, 1.5, 2.1], STEAM: [4.9, 7.5, 1.8, 3] },
    thr: { BC: [42, 16, 230, 71], "HG-DAgger": [48, 22, null, 84], RECAP: [39, 24, 161, 46], STEAM: [58, 48, 254, 90] },
  };
  const DATA = {
    order: ["BC", "STEAM (Exp)", "STEAM (Exp+Dagg)", "STEAM (Full)"],
    colors: { BC: "#cabfb1", "STEAM (Exp)": "#fdba74", "STEAM (Exp+Dagg)": "#fb8c3c", "STEAM (Full)": "#ea580c" },
    succ: { BC: [33.3, 39.5, 63.8, 52], "STEAM (Exp)": [69.2, 36.4, 55.0, 61.5], "STEAM (Exp+Dagg)": [81.8, 80.0, null, null], "STEAM (Full)": [92.3, 93.8, 80.0, 75.0] },
  };
  const METRIC_LABEL = { succ: "Success Rate (%)", score: "Score (sub-stages)", thr: "Throughput (ep/hour)" };
  const NOTE = {
    method: "Policy performance across four real-world tasks (Table 1). HG-DAgger is not run on pick-and-place, where BC already does reasonably well.",
    data: "Success rate as training data grows: expert only → + human corrections → + autonomous rollouts (Fig. 6). The DAgger stage applies to towel folding & chip checkout only.",
  };

  const canvas = $("#resultChart"), ctx = canvas.getContext("2d");
  const legendEl = $("#chartLegend"), noteEl = $("#chartNote");
  let view = "method", metric = "succ";
  const fmt = (v) => (v == null ? "" : Number.isInteger(v) ? String(v) : v.toFixed(1));

  function roundRectTop(c, x, y, w, h, r) {
    if (h <= 0) return; r = Math.min(r, h);
    c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y); c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h); c.closePath();
  }

  function draw() {
    const cfg = view === "method" ? METHOD : DATA;
    const m = view === "method" ? metric : "succ";
    const series = cfg[m], order = cfg.order, colors = cfg.colors;

    let maxV = 0;
    order.forEach((k) => series[k].forEach((v) => { if (v != null && v > maxV) maxV = v; }));
    // succ → fixed 0–100%; score → just above max; throughput → round up to next 50 so tall bars (e.g. pnp) fit
    const yMax = m === "succ" ? 100 : m === "score" ? Math.ceil(maxV + 1) : Math.ceil(maxV / 50) * 50;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 1040, H = 440;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.aspectRatio = W + "/" + H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const padL = 58, padR = 16, padT = 26, padB = 56;
    const plotW = W - padL - padR, plotH = H - padT - padB, baseY = padT + plotH;

    ctx.font = "12px 'Space Mono', monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const val = (yMax / steps) * i, y = baseY - (plotH * i) / steps;
      ctx.strokeStyle = i === 0 ? "#ddd4c8" : "#efe9e0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      ctx.fillStyle = "#897f73";
      ctx.fillText(m === "score" ? val.toFixed(1) : Math.round(val), padL - 10, y);
    }
    ctx.save();
    ctx.translate(16, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.fillStyle = "#4a443d"; ctx.font = "600 13px Inter, sans-serif";
    ctx.fillText(METRIC_LABEL[m], 0, 0); ctx.restore();

    const nG = TASKS.length, groupW = plotW / nG, innerPad = groupW * 0.14, usable = groupW - innerPad * 2;

    TASKS.forEach((task, gi) => {
      const present = order.filter((k) => series[k][gi] != null);
      const slot = usable / present.length;
      const bw = Math.min(slot * 0.74, 58);
      const gx = padL + groupW * gi + innerPad;
      present.forEach((k, bi) => {
        const v = series[k][gi];
        const h = (v / yMax) * plotH, y = baseY - h;
        const ox = gx + bi * slot + (slot - bw) / 2;
        ctx.fillStyle = colors[k];
        roundRectTop(ctx, ox, y, bw, h, Math.min(5, bw / 2)); ctx.fill();
        ctx.fillStyle = "#3a342d"; ctx.font = "600 11.5px Inter, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(fmt(v), ox + bw / 2, y - 7);
      });
      ctx.fillStyle = "#4a443d"; ctx.font = "600 13px Inter, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(task, padL + groupW * gi + groupW / 2, baseY + 24);
    });

    legendEl.innerHTML = order.map((k) =>
      '<span class="lg"><span class="sw" style="background:' + colors[k] + '"></span>' + k + "</span>"
    ).join("");
    noteEl.textContent = NOTE[view];
  }

  const metricSeg = $(".seg-metric");
  $$(".seg-btn").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".seg-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      view = b.dataset.view;
      metricSeg.classList.toggle("is-hidden", view === "data");
      draw();
    })
  );
  $$(".metric-btn").forEach((b) =>
    b.addEventListener("click", () => {
      if (view === "data") return;
      $$(".metric-btn").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      metric = b.dataset.metric; draw();
    })
  );
  draw();
  window.addEventListener("resize", () => { clearTimeout(window.__cz); window.__cz = setTimeout(draw, 150); });
})();
