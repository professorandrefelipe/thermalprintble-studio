let blocks = [
  { id: 1, type: 'text', content: 'LABORATÓRIO DE ENSAIOS', align: 'center', scale: 2, bold: true, italic: false, underline: false },
  { id: 2, type: 'rectangle', width: 320, height: 30, thickness: 2, align: 'center' },
  { id: 3, type: 'text', content: 'STATUS: OK', align: 'center', scale: 2, bold: true, italic: false, underline: false },
  { id: 4, type: 'cut', feedLines: 100 }
];

let selectedBlockId = 1;

function addBlock(type) {
  const id = Date.now();
  let block = { id, type };

  if (type === 'text') {
    block.content = 'NOVO TEXTO';
    block.align = 'center';
    block.scale = 1;
    block.bold = false;
    block.italic = false;
    block.underline = false;
  } else if (type === 'rectangle') {
    block.width = 300; block.height = 40; block.thickness = 2; block.align = 'center';
  } else if (type === 'circle') {
    block.radius = 30; block.thickness = 2; block.align = 'center';
  } else if (type === 'triangle') {
    block.baseWidth = 80; block.height = 50; block.align = 'center';
  } else if (type === 'cut') {
    block.feedLines = 100;
  }

  blocks.push(block);
  selectBlock(id);
}

function selectBlock(id) {
  selectedBlockId = id;
  renderPaper();
  renderInspector();
}

function removeBlock(id) {
  blocks = blocks.filter(b => b.id !== id);
  if (selectedBlockId === id) selectedBlockId = null;
  renderPaper();
  renderInspector();
}

function updateSelectedBlock(key, value) {
  const block = blocks.find(b => b.id === selectedBlockId);
  if (block) {
    block[key] = value;
    renderPaper();
  }
}

function toggleStyle(key) {
  const block = blocks.find(b => b.id === selectedBlockId);
  if (block && block.type === 'text') {
    block[key] = !block[key];
    renderPaper();
    renderInspector();
  }
}

function renderPaper() {
  const paper = document.getElementById('paper');
  paper.innerHTML = '';

  blocks.forEach((b) => {
    const div = document.createElement('div');
    div.className = `block-item ${b.id === selectedBlockId ? 'selected' : ''}`;
    div.onclick = () => selectBlock(b.id);

    if (b.type === 'text') {
      const fontSize = b.scale * 14;
      let textDecoration = b.underline ? 'underline' : 'none';
      let fontStyle = b.italic ? 'italic' : 'normal';
      let fontWeight = b.bold ? 'bold' : 'normal';

      div.innerHTML = `<div style="text-align: ${b.align}; font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; word-break: break-word;">${b.content}</div>`;
    } 
    else if (b.type === 'rectangle') {
      const alignFlex = b.align === 'center' ? 'center' : (b.align === 'right' ? 'flex-end' : 'flex-start');
      div.innerHTML = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: ${b.width}px; height: ${b.height}px; border: ${b.thickness}px solid black;"></div></div>`;
    } 
    else if (b.type === 'circle') {
      const alignFlex = b.align === 'center' ? 'center' : (b.align === 'right' ? 'flex-end' : 'flex-start');
      const dim = b.radius * 2;
      div.innerHTML = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: ${dim}px; height: ${dim}px; border-radius: 50%; border: ${b.thickness}px solid black;"></div></div>`;
    } 
    else if (b.type === 'triangle') {
      const alignFlex = b.align === 'center' ? 'center' : (b.align === 'right' ? 'flex-end' : 'flex-start');
      div.innerHTML = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: 0; height: 0; border-left: ${b.baseWidth/2}px solid transparent; border-right: ${b.baseWidth/2}px solid transparent; border-bottom: ${b.height}px solid black;"></div></div>`;
    } 
    else if (b.type === 'cut') {
      div.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 0.75rem; border-top: 1px dashed #64748b; padding-top: 4px;">✂️ --- CORTE DE PAPEL (${b.feedLines} LINHAS) ---</div>`;
    }

    paper.appendChild(div);
  });
}

function renderInspector() {
  const container = document.getElementById('inspector-content');
  const block = blocks.find(b => b.id === selectedBlockId);

  if (!block) {
    container.innerHTML = `<p class="placeholder-text">Selecione um bloco na bobina para editar suas propriedades.</p>`;
    return;
  }

  let html = `<h4>EDITAR ${block.type.toUpperCase()}</h4><br>`;

  if (block.type === 'text') {
    html += `
      <div class="form-group">
        <label>Conteúdo do Texto</label>
        <textarea oninput="updateSelectedBlock('content', this.value)">${block.content}</textarea>
      </div>
      <div class="form-group">
        <label>Tamanho da Fonte (Scale)</label>
        <select onchange="updateSelectedBlock('scale', parseInt(this.value))">
          <option value="1" ${block.scale === 1 ? 'selected' : ''}>1x (Pequena)</option>
          <option value="2" ${block.scale === 2 ? 'selected' : ''}>2x (Média)</option>
          <option value="3" ${block.scale === 3 ? 'selected' : ''}>3x (Grande)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Estilos</label>
        <div class="style-buttons">
          <button class="btn-toggle ${block.bold ? 'active' : ''}" onclick="toggleStyle('bold')">B</button>
          <button class="btn-toggle ${block.italic ? 'active' : ''}" onclick="toggleStyle('italic')">I</button>
          <button class="btn-toggle ${block.underline ? 'active' : ''}" onclick="toggleStyle('underline')">U</button>
        </div>
      </div>
      <div class="form-group">
        <label>Alinhamento</label>
        <select onchange="updateSelectedBlock('align', this.value)">
          <option value="left" ${block.align === 'left' ? 'selected' : ''}>Esquerda</option>
          <option value="center" ${block.align === 'center' ? 'selected' : ''}>Centralizado</option>
          <option value="right" ${block.align === 'right' ? 'selected' : ''}>Direita</option>
        </select>
      </div>
    `;
  } else if (block.type === 'rectangle') {
    html += `
      <div class="form-group">
        <label>Largura (px)</label>
        <input type="number" value="${block.width}" onchange="updateSelectedBlock('width', parseInt(this.value))">
      </div>
      <div class="form-group">
        <label>Altura (px)</label>
        <input type="number" value="${block.height}" onchange="updateSelectedBlock('height', parseInt(this.value))">
      </div>
      <div class="form-group">
        <label>Espessura (px)</label>
        <input type="number" value="${block.thickness}" onchange="updateSelectedBlock('thickness', parseInt(this.value))">
      </div>
      <div class="form-group">
        <label>Alinhamento</label>
        <select onchange="updateSelectedBlock('align', this.value)">
          <option value="left" ${block.align === 'left' ? 'selected' : ''}>Esquerda</option>
          <option value="center" ${block.align === 'center' ? 'selected' : ''}>Centralizado</option>
          <option value="right" ${block.align === 'right' ? 'selected' : ''}>Direita</option>
        </select>
      </div>
    `;
  } else if (block.type === 'circle') {
    html += `
      <div class="form-group">
        <label>Raio (px)</label>
        <input type="number" value="${block.radius}" onchange="updateSelectedBlock('radius', parseInt(this.value))">
      </div>
      <div class="form-group">
        <label>Espessura (px)</label>
        <input type="number" value="${block.thickness}" onchange="updateSelectedBlock('thickness', parseInt(this.value))">
      </div>
      <div class="form-group">
        <label>Alinhamento</label>
        <select onchange="updateSelectedBlock('align', this.value)">
          <option value="left" ${block.align === 'left' ? 'selected' : ''}>Esquerda</option>
          <option value="center" ${block.align === 'center' ? 'selected' : ''}>Centralizado</option>
          <option value="right" ${block.align === 'right' ? 'selected' : ''}>Direita</option>
        </select>
      </div>
    `;
  } else if (block.type === 'cut') {
    html += `
      <div class="form-group">
        <label>Linhas de Avanço</label>
        <input type="number" value="${block.feedLines}" onchange="updateSelectedBlock('feedLines', parseInt(this.value))">
      </div>
    `;
  }

  html += `<button class="btn-danger" onclick="removeBlock(${block.id})">🗑️ Excluir Bloco</button>`;
  container.innerHTML = html;
}

function exportIno() {
  let ino = `/*\n * Codigo gerado via ThermalPrintBLE Studio v2.5.0\n * Autor: Andre Felipe & Gemini\n */\n\n#include <ThermalPrintBLE.h>\n\nThermalPrintBLE impressora;\nconst char* MAC_IMPRESSORA = "25:00:13:00:08:EF";\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!impressora.beginBLE(MAC_IMPRESSORA)) return;\n\n`;

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

function exportImage() {
  const paper = document.getElementById('paper');
  html2canvas(paper, { scale: 2 }).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'comprovante_preview.png';
    a.click();
  });
}

renderPaper();
renderInspector();
