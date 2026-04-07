// --- CONFIGURAÇÕES GERAIS ---
let nomeAluno = "";
let inputNome, btnComecar;
let estado = "INICIO"; 
let faseAtual = 0;
let vidas = 3;

// Variáveis de Tempo, Ranking e Efeitos
let tempoInicio = 0;
let tempoJogo = 0;
let tempoFinalFormatado = "";
let ranking = []; 

let decoracoes = [];
let botoes = []; 
let passo = 0; 
let timerErro = 0;
let fases = []; 
let confetes = []; 

function setup() {
  createCanvas(800, 650);
  textAlign(CENTER, CENTER);
  textFont('Verdana');
  
  carregarRanking(); 

  // Fundo animado temático (ESPAÇO NEON)
  for(let i=0; i<30; i++) {
    decoracoes.push({
      x: random(width), y: random(height),
      velY: random(-0.5, -2.0), velRot: random(-0.05, 0.05), rot: random(TWO_PI),
      simbolo: random(['x²', 'x', '±', '√', '0', '=', '÷', '+']),
      tam: random(20, 50), 
      cor: random(['#00E5FF', '#FF007F', '#B388FF', '#00E676', '#FFEA00']) // Cores Neon
    });
  }
  
  // Estilo do Input (Caixa de Texto Gamer)
  inputNome = createInput("");
  inputNome.position(width / 2 - 140, height / 2 + 20);
  inputNome.size(280, 40);
  inputNome.style('font-family', 'Verdana');
  inputNome.style('font-size', '18px');
  inputNome.style('text-align', 'center');
  inputNome.style('border-radius', '8px');
  inputNome.style('border', '2px solid #00E5FF'); // Borda Ciano
  inputNome.style('background', '#0B0C10'); // Fundo escuro
  inputNome.style('color', '#00E5FF'); // Texto Ciano brilhante
  inputNome.style('outline', 'none');
  inputNome.style('box-shadow', '0 0 10px rgba(0, 229, 255, 0.4)');
  
  // Estilo do Botão Modernizado (Degradê Rosa/Roxo)
  btnComecar = createButton("🚀 COMEÇAR A AVENTURA!");
  btnComecar.position(width / 2 - 140, height / 2 + 80);
  btnComecar.mousePressed(iniciarJogo);
  btnComecar.style('background', 'linear-gradient(90deg, #FF007F 0%, #7000FF 100%)');
  btnComecar.style('color', 'white');
  btnComecar.style('font-family', 'Verdana');
  btnComecar.style('font-weight', '900');
  btnComecar.style('font-size', '15px');
  btnComecar.style('border', '2px solid #FFFFFF');
  btnComecar.style('border-radius', '25px');
  btnComecar.style('padding', '12px 20px');
  btnComecar.style('width', '280px');
  btnComecar.style('cursor', 'pointer');
  btnComecar.style('box-shadow', '0px 0px 15px rgba(255, 0, 127, 0.8)'); // Brilho neon
  btnComecar.style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)');
}

// --- SISTEMA DE RANKING LOCAL ---
function carregarRanking() {
  let salvo = localStorage.getItem('rankingEquacoesIncompletas');
  if (salvo) ranking = JSON.parse(salvo);
}

function salvarRanking(nome, tempoSegundos, tempoStr) {
  ranking.push({ nome: nome, tempo: tempoSegundos, formatado: tempoStr });
  ranking.sort((a, b) => a.tempo - b.tempo); 
  ranking = ranking.slice(0, 5); 
  localStorage.setItem('rankingEquacoesIncompletas', JSON.stringify(ranking));
}

// --- GERADORES DE FASES INCOMPLETAS ---
function criarFaseFatoracao(a, b) {
  let eqStr = (a === 1 ? "x²" : a + "x²") + (b > 0 ? " + " + b + "x" : " - " + abs(b) + "x") + " = 0";
  let axStr = (a === 1 ? "x" : a + "x");
  let signB = b > 0 ? "+" : "-";
  let absB = abs(b);

  let p1_C = `x(${axStr} ${signB} ${absB}) = 0`;
  let p1_E1 = `x(${axStr} ${b > 0 ? "-" : "+"} ${absB}) = 0`; 
  let p1_E2 = `x(${axStr} ${signB} ${absB}x) = 0`; 

  let p2_C = "x' = 0";
  let p2_E1 = `x' = ${absB}`;
  let p2_E2 = `x' = 1`;

  let raiz2 = -b / a;
  let p3_C = `x'' = ${raiz2}`;
  let p3_E1 = `x'' = ${-raiz2}`;
  let p3_E2 = `x'' = ${raiz2 > 0 ? raiz2 + 1 : raiz2 - 1}`;

  return {
    eqTxt: eqStr, cor: "#1565C0",
    passos: [
      { perg: "1. Coloque o 'x' em evidência (fatoração):", c: p1_C, e1: p1_E1, e2: p1_E2, dica: "Um 'x' sai de cada termo. Cuidado com o sinal!" },
      { perg: "2. Para a multiplicação dar ZERO, o 'x' de fora deve ser:", c: p2_C, e1: p2_E1, e2: p2_E2, dica: "Se a conta de vezes dá zero, quem está fora do parênteses vale zero!" },
      { perg: `3. E resolvendo a parte de dentro (${axStr} ${signB} ${absB} = 0):`, c: p3_C, e1: p3_E1, e2: p3_E2, dica: "Passe o número mudando o sinal. Se tiver número junto do x, ele passa dividindo!" }
    ]
  };
}

function criarFaseRaiz(a, k_sq) {
  let c_val = a * k_sq; 
  let eqStr = (a === 1 ? "x²" : a + "x²") + " - " + c_val + " = 0";

  let p1_C = (a === 1) ? `x² = ${c_val}` : `${a}x² = ${c_val}  =>  x² = ${k_sq}`;
  let p1_E1 = (a === 1) ? `x² = -${c_val}` : `${a}x² = -${c_val}  =>  x² = -${k_sq}`;
  let p1_E2 = `x = ${c_val}`;

  let p2_C = `x = ±√${k_sq}`;
  let p2_E1 = `x = √${k_sq}`;
  let p2_E2 = `x = ± ${k_sq}/2`;

  let raiz = sqrt(k_sq);
  let p3_C = `x'= ${raiz},  x''= -${raiz}`;
  let p3_E1 = `x'= ${raiz},  x''= ${raiz}`;
  let p3_E2 = `x'= -${raiz},  x''= -${raiz}`;

  return {
    eqTxt: eqStr, cor: "#E65100",
    passos: [
      { perg: "1. Isole o x² (passe o número para a direita):", c: p1_C, e1: p1_E1, e2: p1_E2, dica: "O número muda de sinal. E se tiver um número com o x², ele passa dividindo!" },
      { perg: "2. Como eliminamos o quadrado (expoente 2) do x?", c: p2_C, e1: p2_E1, e2: p2_E2, dica: "O expoente vira raiz quadrada. Não esqueça do '±' (mais ou menos)!" },
      { perg: "3. Resolvendo a raiz, quais são os dois valores?", c: p3_C, e1: p3_E1, e2: p3_E2, dica: "Uma raiz é positiva (+) e a outra é igualzinha, mas negativa (-)." }
    ]
  };
}

function gerarFasesAleatorias() {
  let novasFases = [];
  let historico = new Set(); 
  
  for (let i = 0; i < 15; i++) {
    let ehFatoracao = (i % 2 === 0);
    let a, b, k_sq;
    let chaveUnica;

    do {
      if (ehFatoracao) { 
        if (i < 5) { a = 1; b = floor(random(-9, 10)); if (b === 0 || b === 1 || b === -1) b = random([2, 3, 4, 5, -2, -3, -4, -5]); } 
        else if (i < 10) { a = 1; b = floor(random(-25, 26)); if (abs(b) < 10) b += 15; } 
        else { a = random([2, 3, 4, 5]); let mult = floor(random(-12, 13)); if (mult === 0 || mult === 1) mult = random([6, 7, -8, -9]); b = a * mult; }
        chaveUnica = `F_${a}_${b}`;
      } else { 
        if (i < 5) { a = 1; k_sq = pow(floor(random(2, 10)), 2); } 
        else if (i < 10) { a = 1; k_sq = pow(floor(random(10, 21)), 2); } 
        else { a = random([2, 3, 4, 5]); k_sq = pow(floor(random(2, 13)), 2); }
        chaveUnica = `R_${a}_${k_sq}`;
      }
    } while (historico.has(chaveUnica)); 
    historico.add(chaveUnica);

    if (ehFatoracao) novasFases.push(criarFaseFatoracao(a, b));
    else novasFases.push(criarFaseRaiz(a, k_sq));
  }
  return novasFases;
}

function gerarConfetes() {
  confetes = [];
  for(let i=0; i<150; i++) {
    confetes.push({
      x: random(width), y: random(-height, 0),
      vx: random(-2, 2), vy: random(2, 6),
      tam: random(6, 14),
      cor: color(random(100, 255), random(100, 255), random(100, 255)),
      rot: random(TWO_PI), velRot: random(-0.2, 0.2)
    });
  }
}

// --- CICLO DO JOGO ---
function draw() {
  if (estado === "INICIO") telaInicial();
  else if (estado === "JOGANDO") {
    desenharFundoAnimado();
    botoes = []; 
    tempoJogo = floor((millis() - tempoInicio) / 1000);
    desenharHUD();
    desenharFolhaCaderno(); 
    desenharEquacoes();
    desenharPainelAcao();
  } 
  else if (estado === "GAME_OVER") telaGameOver();
  else if (estado === "VITORIA") telaVitoria();
}

function desenharFundoAnimado() {
  background("#0A0A1A"); // Azul marinho quase preto (Espaço Noturno)
  for(let d of decoracoes) {
    push(); translate(d.x, d.y); rotate(d.rot);
    let c = color(d.cor);
    c.setAlpha(150); // Deixa os símbolos levemente translúcidos
    fill(c); noStroke(); textSize(d.tam); textStyle(BOLD); text(d.simbolo, 0, 0); pop();
    d.y += d.velY; d.rot += d.velRot;
    if(d.y < -50) d.y = height + 50; 
  }
}

function desenharFolhaCaderno() {
  // Mesmo no fundo escuro, a folha de caderno brilha para não atrapalhar a leitura
  rectMode(CENTER); fill(255, 255, 255, 245); stroke("#00E5FF"); strokeWeight(4);
  rect(width/2, 230, 680, 320, 20); 
  stroke(200, 220, 255, 150); strokeWeight(2);
  for(let y = 135; y < 380; y += 40) line(width/2 - 320, y, width/2 + 320, y);
}

function telaInicial() {
  desenharFundoAnimado();
  
  // Caixa Central Dark Glassmorphism
  fill(15, 15, 35, 220); // Fundo escuro azulado translúcido
  stroke("#FF007F"); // Borda Rosa Neon
  strokeWeight(3);
  rectMode(CENTER);
  rect(width/2, height/2 - 30, 660, 260, 25);
  noStroke();

  // Título com efeito 3D / Brilho
  fill("#FF007F"); // Rosa Escuro/Brilho na base
  textSize(34); textStyle(BOLD); 
  text("MESTRE DAS EQUAÇÕES REDUZIDAS", width / 2 + 3, height / 2 - 100 + 3);
  
  fill("#FFFFFF"); // Texto Branco principal
  text("MESTRE DAS EQUAÇÕES REDUZIDAS", width / 2, height / 2 - 100);
  
  // Subtítulo Impactante (Amarelo Neon)
  fill("#FFEA00"); textSize(22);
  text("O TREINAMENTO FINAL!", width / 2, height / 2 - 50);

  // Instrução
  fill(220); textSize(16); textStyle(NORMAL);
  text("DIGITE SEU NOME PARA RESOLVER 15 DESAFIOS:", width / 2, height / 2 - 10);
}

function iniciarJogo() {
  if (inputNome.value() !== "") {
    nomeAluno = inputNome.value();
    inputNome.hide(); btnComecar.hide();
    vidas = 3; faseAtual = 0; passo = 0; fases = gerarFasesAleatorias(); 
    tempoInicio = millis(); tempoJogo = 0; estado = "JOGANDO";
  }
}

function desenharHUD() {
  fill(15, 15, 35, 230); stroke("#00E5FF"); strokeWeight(2);
  rectMode(CORNER); rect(-5, -5, width+10, 60); rectMode(CENTER); noStroke();
  
  fill("#FFFFFF"); textSize(20); textStyle(BOLD); textAlign(LEFT); text("🧑‍🚀 " + nomeAluno, 20, 28);
  textAlign(CENTER);
  if (faseAtual >= 10) fill("#FFEA00"); else fill("#00E5FF");
  text("NÍVEL: " + (faseAtual + 1) + " / 15", width / 2 - 40, 28);
  
  fill("#00E676"); let m = floor(tempoJogo / 60); let s = tempoJogo % 60;
  text("⏳ " + nf(m, 2) + ":" + nf(s, 2), width / 2 + 100, 28);
  
  textAlign(RIGHT); fill("#FF007F"); text("Vidas: " + "❤️".repeat(vidas), width - 20, 28);
  textAlign(CENTER); textStyle(NORMAL);
}

function desenharEquacoes() {
  let f = fases[faseAtual];
  
  fill(20); noStroke(); textSize(42); textStyle(BOLD);
  text(f.eqTxt, width/2, 110);

  if (passo >= 1) { fill(f.cor); textSize(32); textStyle(BOLD); text(f.passos[0].c, width/2, 190); }
  if (passo >= 2) { fill(f.cor); textSize(32); textStyle(BOLD); text(f.passos[1].c, width/2, 260); }
  if (passo >= 3) { fill("#2E7D32"); textSize(34); textStyle(BOLD); text("Solução: " + f.passos[2].c, width/2, 340); }
  textStyle(NORMAL);
}

function desenharPainelAcao() {
  fill(15, 15, 35, 240); stroke("#00E5FF"); strokeWeight(4); rectMode(CORNER);
  rect(-10, 400, width + 20, 260, 30); rectMode(CENTER); 
  
  let f = fases[faseAtual]; fill(255); noStroke(); textSize(22);
  
  if (timerErro > 0) {
    fill("#FF007F"); textStyle(BOLD); 
    text("❌ Ops! " + f.passos[passo].dica, width/2, 430);
    textStyle(NORMAL); timerErro--;
  }
  
  if (passo < 3) {
    let pAtual = f.passos[passo];
    if (timerErro === 0) text(pAtual.perg, width/2, 450);
    
    let ordem = (faseAtual + passo) % 3;
    let corBtn = f.cor;
    
    if (ordem === 0) { 
      criarBotao(pAtual.c, width/2 - 255, 540, true, corBtn, 240); 
      criarBotao(pAtual.e1, width/2, 540, false, corBtn, 240); 
      criarBotao(pAtual.e2, width/2 + 255, 540, false, corBtn, 240); 
    } else if (ordem === 1) { 
      criarBotao(pAtual.e2, width/2 - 255, 540, false, corBtn, 240); 
      criarBotao(pAtual.c, width/2, 540, true, corBtn, 240); 
      criarBotao(pAtual.e1, width/2 + 255, 540, false, corBtn, 240); 
    } else { 
      criarBotao(pAtual.e1, width/2 - 255, 540, false, corBtn, 240); 
      criarBotao(pAtual.e2, width/2, 540, false, corBtn, 240); 
      criarBotao(pAtual.c, width/2 + 255, 540, true, corBtn, 240); 
    }
  } 
  else if (passo === 3) {
    fill("#00E676"); textStyle(BOLD); text("🎉 PERFEITO! Raízes encontradas.", width/2, 450); textStyle(NORMAL);
    criarBotao("AVANÇAR DE NÍVEL ➡️", width/2, 540, "proxima", "#00C853", 350);
  }
}

function criarBotao(txt, x, y, corretoOuAcao, corFundo, w) {
  botoes.push({ x: x, y: y, w: w, h: 70, acao: corretoOuAcao });
  
  fill(corFundo); noStroke(); rectMode(CENTER); rect(x, y + 5, w, 70, 15); 
  fill(color(red(color(corFundo))+20, green(color(corFundo))+20, blue(color(corFundo))+20)); rect(x, y, w, 70, 15);
  
  fill(255); textStyle(BOLD);
  let len = String(txt).length;
  if (len > 25) textSize(13);
  else if (len > 18) textSize(15);
  else textSize(18);
  
  text(txt, x, y); textStyle(NORMAL);
}

// --- CLIQUES ---
function mousePressed() {
  if (estado === "JOGANDO") {
    for (let b of botoes) {
      if (mouseX > b.x - b.w/2 && mouseX < b.x + b.w/2 && mouseY > b.y - b.h/2 && mouseY < b.y + b.h/2) {
          if (b.acao === "proxima") {
             faseAtual++; passo = 0;
             if (faseAtual >= fases.length) {
                let m = floor(tempoJogo / 60); let s = tempoJogo % 60;
                tempoFinalFormatado = nf(m, 2) + ":" + nf(s, 2);
                salvarRanking(nomeAluno, tempoJogo, tempoFinalFormatado); 
                gerarConfetes(); 
                estado = "VITORIA";
             }
          } 
          else if (b.acao === true) { passo++; timerErro = 0; } 
          else if (b.acao === false) { vidas--; timerErro = 210; if (vidas <= 0) estado = "GAME_OVER"; } 
          break; 
      }
    }
  } 
  else if (estado === "GAME_OVER" || estado === "VITORIA") location.reload(); 
}

function telaGameOver() {
  background("#0A0A1A");
  fill("#FF007F"); textSize(60); textStyle(BOLD); text("GAME OVER", width/2, height/2 - 60);
  fill(255); textSize(22); textStyle(NORMAL);
  text("Suas vidas acabaram.\nLembre-se: \n• Fatoração: Coloque o 'x' em evidência.\n• Raízes: Isole o x² e não esqueça do ±.\n\nToque na tela para recomeçar.", width/2, height/2 + 50);
}

function telaVitoria() {
  background("#0A0A1A"); // Mantém o tema espaço na vitória
  
  for(let p of confetes) {
    push(); translate(p.x, p.y); rotate(p.rot);
    fill(p.cor); noStroke(); rectMode(CENTER); rect(0, 0, p.tam, p.tam);
    pop();
    p.x += p.vx; p.y += p.vy; p.rot += p.velRot;
    if(p.y > height + 20) { p.y = random(-50, -10); p.x = random(width); }
  }
  
  fill("#FF007F"); textSize(36); textStyle(BOLD); text("🏆 MESTRE DA EQUAÇÃO REDUZIDA! 🏆", width/2 + 3, 73);
  fill("#FFEA00"); text("🏆 MESTRE DA EQUAÇÃO REDUZIDA! 🏆", width/2, 70);
  
  fill(255); textSize(20); textStyle(NORMAL);
  text("Missão Cumprida, " + nomeAluno + "! Seu tempo foi: ⏳ " + tempoFinalFormatado, width/2, 130);
  
  fill(15, 15, 35, 230); stroke("#00E5FF"); strokeWeight(3); rectMode(CENTER);
  rect(width/2, 330, 450, 280, 20);
  
  noStroke(); fill("#00E5FF"); textSize(28); textStyle(BOLD);
  text("🏅 QUADRO DE MEDALHAS 🏅", width/2, 220);
  
  textStyle(NORMAL); textSize(22);
  for (let i = 0; i < ranking.length; i++) {
    let r = ranking[i];
    let yPos = 270 + (i * 40);
    
    if (r.nome === nomeAluno && r.tempo === tempoJogo) { 
      fill("#00E676"); textStyle(BOLD); // Verde Neon para o recorde atual
    } else { 
      fill(255); textStyle(NORMAL); 
    }
    
    textAlign(LEFT); text((i + 1) + "º " + r.nome, width/2 - 160, yPos);
    textAlign(RIGHT); text("⏳ " + r.formatado, width/2 + 160, yPos);
  }
  
  textAlign(CENTER); fill(200); textSize(18); textStyle(NORMAL);
  text("Toque na tela para jogar novamente.", width/2, height - 40);
}
