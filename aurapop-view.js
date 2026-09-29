(() => {
  const shell = document.getElementById("shell");
  const card = document.getElementById("popCard");
  const loading = document.getElementById("loadingState");
  const links = document.getElementById("links");
  const avatar = document.getElementById("avatar");
  const gameLayer = document.getElementById("gameLayer");
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("gameScore");
  const controls = document.getElementById("gameControls");
  const closeGame = document.getElementById("closeGame");
  const restartGame = document.getElementById("restartGame");

  const icons = {
    website:"↗",menu:"☰",instagram:"IG",facebook:"f",tiktok:"♪",whatsapp:"WA",maps:"⌖",custom:"↗",snake:"S",tetris:"T"
  };

  let currentGame = "";
  let gameStop = null;

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }

  function initials(value) {
    return String(value || "AuraPop").split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0]).join("").toUpperCase();
  }

  function inactive(message = "This AuraPop is not active yet.") {
    card.hidden = true;
    loading.hidden = false;
    loading.innerHTML = `<h1>AuraPop is waiting for activation.</h1><p>${esc(message)}<br />If this is your AuraPop, complete payment and approval in AuraPops Studio.</p><a href="/aurapops">Open AuraPops Studio →</a>`;
  }

  async function load() {
    const match = location.pathname.match(/^\/pops\/([a-z0-9-]+)$/i);
    if (!match) return inactive("The AuraPop address is invalid.");
    try {
      const response = await fetch("/api/aurapops/public/" + encodeURIComponent(match[1]), {headers:{"Accept":"application/json"}});
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.pop) return inactive(data.error);
      render(data.pop);
    } catch {
      inactive("The AuraPop could not be loaded right now.");
    }
  }

  function render(pop) {
    document.title = pop.title + " — AuraPop";
    shell.style.setProperty("--bg",pop.backgroundColor || "#0b1610");
    shell.style.setProperty("--card",pop.cardColor || "#111a16");
    shell.style.setProperty("--text",pop.textColor || "#ffffff");
    shell.style.setProperty("--accent",pop.accentColor || "#e1e100");
    shell.style.backgroundColor = pop.backgroundColor || "#0b1610";
    shell.style.backgroundImage = pop.backgroundMode === "image" && pop.backgroundImageUrl
      ? `linear-gradient(rgba(2,7,4,.12),rgba(2,7,4,.48)),url("${pop.backgroundImageUrl}")`
      : "none";

    avatar.innerHTML = pop.avatarUrl
      ? `<img src="${esc(pop.avatarUrl)}" alt="${esc(pop.title)}" />`
      : `<span>${esc(initials(pop.title))}</span>`;
    document.getElementById("title").textContent = pop.title || "AuraPop";
    document.getElementById("subtitle").textContent = pop.subtitle || "";

    links.innerHTML = (pop.links || []).map(item => {
      const type = item.type || "custom";
      const game = type === "snake" || type === "tetris";
      if (game) {
        return `<button class="ap-link" type="button" data-game="${esc(type)}"><span class="ap-icon">${esc(icons[type] || "G")}</span><span>${esc(item.label || (type === "snake" ? "Play Snake" : "Play Tetris"))}</span><small>Play here</small></button>`;
      }
      return `<a class="ap-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span class="ap-icon">${esc(icons[type] || "↗")}</span><span>${esc(item.label || "Open link")}</span><small>Open ↗</small></a>`;
    }).join("") || '<div class="ap-link"><span class="ap-icon">AP</span><span>No links added yet</span></div>';

    links.querySelectorAll("[data-game]").forEach(button => button.addEventListener("click", () => openGame(button.dataset.game)));
    loading.hidden = true;
    card.hidden = false;
  }

  function stopGame() {
    if (typeof gameStop === "function") gameStop();
    gameStop = null;
  }

  function openGame(type) {
    stopGame();
    currentGame = type;
    gameLayer.classList.add("open");
    gameLayer.setAttribute("aria-hidden","false");
    document.getElementById("gameTitle").textContent = type === "snake" ? "Snake" : "Tetris";
    controls.className = "ap-controls" + (type === "tetris" ? " tetris" : "");
    controls.innerHTML = type === "snake"
      ? '<button data-action="up" aria-label="Up">↑</button><button data-action="left" aria-label="Left">←</button><button data-action="down" aria-label="Down">↓</button><button data-action="right" aria-label="Right">→</button>'
      : '<button data-action="rotate" aria-label="Rotate">↻</button><button data-action="left" aria-label="Left">←</button><button data-action="right" aria-label="Right">→</button><button data-action="down" aria-label="Down">↓</button>';
    if (type === "snake") startSnake();
    else startTetris();
  }

  function closeGameLayer() {
    stopGame();
    gameLayer.classList.remove("open");
    gameLayer.setAttribute("aria-hidden","true");
  }

  closeGame.addEventListener("click",closeGameLayer);
  gameLayer.addEventListener("click",event => { if (event.target === gameLayer) closeGameLayer(); });
  restartGame.addEventListener("click",() => currentGame === "snake" ? startSnake() : startTetris());

  function bindControls(handler) {
    controls.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("pointerdown",event => {
        event.preventDefault();
        handler(button.dataset.action);
      });
    });
  }

  function startSnake() {
    stopGame();
    canvas.width = 300; canvas.height = 300;
    const grid = 15, cell = canvas.width / grid;
    let snake = [{x:7,y:7},{x:6,y:7},{x:5,y:7}];
    let dir = {x:1,y:0};
    let next = {...dir};
    let score = 0;
    let food = placeFood();
    let ended = false;

    function placeFood() {
      let point;
      do { point = {x:Math.floor(Math.random()*grid),y:Math.floor(Math.random()*grid)}; }
      while (snake.some(part => part.x === point.x && part.y === point.y));
      return point;
    }

    function action(name) {
      const map = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
      const wanted = map[name];
      if (!wanted) return;
      if (wanted.x === -dir.x && wanted.y === -dir.y) return;
      next = wanted;
    }

    function key(event) {
      const map = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
      if (map[event.key]) { event.preventDefault(); action(map[event.key]); }
    }
    document.addEventListener("keydown",key);
    bindControls(action);

    function draw() {
      ctx.fillStyle = "#050a07"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#e1e100";
      ctx.fillRect(food.x*cell+2,food.y*cell+2,cell-4,cell-4);
      snake.forEach((part,index) => {
        ctx.fillStyle = index === 0 ? "#ffffff" : "#8fbf8f";
        ctx.fillRect(part.x*cell+1,part.y*cell+1,cell-2,cell-2);
      });
      if (ended) {
        ctx.fillStyle = "rgba(0,0,0,.68)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#fff"; ctx.font = "700 24px system-ui"; ctx.textAlign = "center"; ctx.fillText("Game over",150,140);
        ctx.font = "14px system-ui"; ctx.fillText("Press Restart",150,168);
      }
    }

    function step() {
      if (ended) return;
      dir = next;
      const head = {x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      if (head.x<0 || head.x>=grid || head.y<0 || head.y>=grid || snake.some(part => part.x===head.x && part.y===head.y)) {
        ended = true; draw(); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10; scoreEl.textContent = "Score: " + score; food = placeFood();
      } else snake.pop();
      draw();
    }

    scoreEl.textContent = "Score: 0";
    draw();
    const timer = setInterval(step,125);
    gameStop = () => { clearInterval(timer); document.removeEventListener("keydown",key); };
  }

  const TETRIS_SHAPES = [
    [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]
  ];

  function startTetris() {
    stopGame();
    const cols=10, rows=20, cell=20;
    canvas.width=cols*cell; canvas.height=rows*cell;
    let board=Array.from({length:rows},()=>Array(cols).fill(0));
    let score=0, ended=false, last=0, raf=0, dropEvery=520;
    let piece=spawn();

    function spawn() {
      const matrix=TETRIS_SHAPES[Math.floor(Math.random()*TETRIS_SHAPES.length)].map(row=>row.slice());
      return {matrix,x:Math.floor((cols-matrix[0].length)/2),y:0};
    }

    function rotate(matrix) {
      return matrix[0].map((_,i)=>matrix.map(row=>row[i]).reverse());
    }

    function collision(test=piece) {
      for(let y=0;y<test.matrix.length;y++) for(let x=0;x<test.matrix[y].length;x++) {
        if(!test.matrix[y][x]) continue;
        const bx=test.x+x, by=test.y+y;
        if(bx<0||bx>=cols||by>=rows||(by>=0&&board[by][bx])) return true;
      }
      return false;
    }

    function merge() {
      piece.matrix.forEach((row,y)=>row.forEach((value,x)=>{if(value && piece.y+y>=0) board[piece.y+y][piece.x+x]=1;}));
      let cleared=0;
      board=board.filter(row=>{if(row.every(Boolean)){cleared++;return false;}return true;});
      while(board.length<rows) board.unshift(Array(cols).fill(0));
      if(cleared){score += [0,100,300,500,800][cleared] || cleared*200;scoreEl.textContent="Score: "+score;dropEvery=Math.max(180,520-Math.floor(score/500)*35);}
      piece=spawn();
      if(collision(piece)) ended=true;
    }

    function drop() {
      if(ended) return;
      const test={...piece,y:piece.y+1};
      if(collision(test)) merge(); else piece=test;
    }

    function action(name) {
      if(ended) return;
      if(name==="left"||name==="right"){
        const test={...piece,x:piece.x+(name==="left"?-1:1)};
        if(!collision(test)) piece=test;
      } else if(name==="down") drop();
      else if(name==="rotate"){
        const matrix=rotate(piece.matrix);
        const test={...piece,matrix};
        if(!collision(test)) piece=test;
      }
      draw();
    }

    function key(event) {
      const map={ArrowLeft:"left",ArrowRight:"right",ArrowDown:"down",ArrowUp:"rotate"," ":"rotate"};
      if(map[event.key]){event.preventDefault();action(map[event.key]);}
    }
    document.addEventListener("keydown",key);
    bindControls(action);

    function drawBlock(x,y,fill) {
      ctx.fillStyle=fill;ctx.fillRect(x*cell+1,y*cell+1,cell-2,cell-2);
    }

    function draw() {
      ctx.fillStyle="#050a07";ctx.fillRect(0,0,canvas.width,canvas.height);
      board.forEach((row,y)=>row.forEach((value,x)=>{if(value) drawBlock(x,y,"#718d73");}));
      piece.matrix.forEach((row,y)=>row.forEach((value,x)=>{if(value) drawBlock(piece.x+x,piece.y+y,"#e1e100");}));
      if(ended){
        ctx.fillStyle="rgba(0,0,0,.72)";ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#fff";ctx.font="700 20px system-ui";ctx.textAlign="center";ctx.fillText("Game over",canvas.width/2,canvas.height/2-6);
        ctx.font="12px system-ui";ctx.fillText("Press Restart",canvas.width/2,canvas.height/2+20);
      }
    }

    function loop(time) {
      if(time-last>dropEvery){drop();last=time;}
      draw();
      if(!ended) raf=requestAnimationFrame(loop);
    }

    scoreEl.textContent="Score: 0";
    draw();
    raf=requestAnimationFrame(loop);
    gameStop=()=>{cancelAnimationFrame(raf);document.removeEventListener("keydown",key);};
  }

  load();
})();