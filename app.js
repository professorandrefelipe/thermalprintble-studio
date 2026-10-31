let blocks = [
  { id: 1, type: 'text', content: 'ESTABELECIMENTO DEMO', align: 'center', scale: 2 },
  { id: 2, type: 'rectangle', width: 320, height: 30, thickness: 2, align: 'center' },
  { id: 3, type: 'text', content: 'Obrigado pela preferencia!', align: 'center', scale: 1 },
  { id: 4, type: 'cut', feedLines: 100 }
];

function addBlock(type) {
  const id = Date.now();
  let block = { id, type };

  if (type === 'text') {
    block.content = 'NOVO TEXTO';
    block.align = 'center';
    block.scale = 2;
  } else if (type === 'rectangle') {
    block.width = 300;
    block.height = 40;
    block.thickness = 2;
    block.align = 'center';
  } else if (type === 'circle') {
    block.radius = 30;
    block.thickness = 2;
    block.align = 'center';
  } else if (type === 'triangle') {
    block.baseWidth = 80;
    block.height = 50;
    block.align = 'center';
  } else if (type === 'cut') {
    block.feedLines = 100;
  }

  blocks.push(block);
  renderPaper();
}

function removeBlock(id) {
  blocks = blocks.filter(b => b.id !== id);
  renderPaper();
}

function renderPaper() {
  const paper = document.getElementById('paper');
  paper.innerHTML = '';

  blocks.forEach((b) => {
    const div = document.createElement('div');
    div.className = 'block-item';

    let contentHtml = '';
    if (b.type === 'text') {
      const fontSize = b.scale * 12;
      contentHtml = `<div style="text-align: ${b.align}; font-size: ${fontSize}px; font-weight: bold;">${b.content}</div>`;
    } else if (b.type === 'rectangle') {
      contentHtml = `<div style="text-align: ${b.align};">[ 🔲 Retângulo ${b.width}x${b.height}px ]</div>`;
    } else if (b.type === 'circle') {
      contentHtml = `<div style="text-align: ${b.align};">[ ⚪ Círculo Raio ${b.radius}px ]</div>`;
    } else if (b.type === 'triangle') {
      contentHtml = `<div style="text-align: ${b.align};">[ 🔺 Triângulo Base ${b.baseWidth}px ]</div>`;
    } else if (b.type === 'cut') {
      contentHtml = `<div style="text-align: center; color: #64748b; font-size: 0.8rem;">✂️ --- CORTE DE PAPEL (${b.feedLines} LINHAS) ---</div>`;
    }

    contentHtml += `<div class="block-controls"><button onclick="removeBlock(${b.id})">Remover</button></div>`;
    div.innerHTML = contentHtml;
    paper.appendChild(div);
  });
}

// Exporta o sketch compilável .INO
function exportIno() {
  let ino = `/*\n * Codigo gerado via ThermalPrintBLE Studio v2.5.0\n * Autor: Andre Felipe & Gemini\n */\n\n`;
  ino += `#include <ThermalPrintBLE.h>\n\n`;
  ino += `ThermalPrintBLE impressora;\n`;
  ino += `const char* MAC_IMPRESSORA = "25:00:13:00:08:EF";\n\n`;
  ino += `void setup() {\n`;
  ino += `  Serial.begin(115200);\n`;
  ino += `  if (!impressora.beginBLE(MAC_IMPRESSORA)) return;\n\n`;

  blocks.forEach((b) => {
    if (b.type === 'text') {
      ino += `  impressora.setFontScale(${b.scale});\n`;
      if (b.align === 'center') ino += `  impressora.printCentered("${b.content}");\n`;
      else if (b.align === 'right') ino += `  impressora.printRight("${b.content}");\n`;
      else ino += `  impressora.printLine("${b.content}");\n`;
    } else if (b.type === 'rectangle') {
      const alignNum = b.align === 'center' ? 1 : (b.align === 'right' ? 2 : 0);
      ino += `  impressora.printRectangle(${b.width}, ${b.height}, ${b.thickness}, ${alignNum});\n`;
    } else if (b.type === 'circle') {
      const alignNum = b.align === 'center' ? 1 : (b.align === 'right' ? 2 : 0);
      ino += `  impressora.printCircle(${b.radius}, ${b.thickness}, ${alignNum});\n`;
    } else if (b.type === 'triangle') {
      const alignNum = b.align === 'center' ? 1 : (b.align === 'right' ? 2 : 0);
      ino += `  impressora.printTriangle(${b.baseWidth}, ${b.height}, ${alignNum});\n`;
    } else if (b.type === 'cut') {
      ino += `  impressora.cutPaper(${b.feedLines});\n`;
    }
  });

  ino += `}\n\nvoid loop() {}\n`;

  const blob = new Blob([ino], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'impressao_thermal.ino';
  a.click();
}

// Renderiza e baixa a imagem PNG da bobina
function exportImage() {
  const paper = document.getElementById('paper');
  html2canvas(paper, { scale: 2 }).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'comprovante_preview.png';
    a.click();
  });
}

// Inicializa a bobina na tela
renderPaper();
