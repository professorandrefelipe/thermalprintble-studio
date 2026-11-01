let blocks = [
  { id: 1, type: 'text', content: 'LABORATÓRIO DE ENSAIOS', align: 'center', scale: 2, bold: true, italic: false, underline: false, fontFamily: 'monospace', hasBorder: false },
  { id: 2, type: 'rectangle', width: 320, height: 30, thickness: 2, align: 'center' },
  { id: 3, type: 'text', content: 'STATUS: OK', align: 'center', scale: 2, bold: true, italic: false, underline: false, fontFamily: 'monospace', hasBorder: true },
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
    block.hasBorder = false;
    block.fontFamily = 'monospace';
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
      let fontFamily = b.fontFamily || 'monospace';
      
      let borderCss = b.hasBorder ? `border: ${b.scale * 2}px solid black; padding: 4px 8px; display: inline-block;` : '';

      div.innerHTML = `
        <div style="text-align: ${b.align};">
          <div style="font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; font-family: ${fontFamily}; word-break: break-word; ${borderCss}">${b.content}</div>
        </div>`;
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
        <label>Família da Fonte</label>
        <select onchange="updateSelectedBlock('fontFamily', this.value)">
          <option value="monospace" ${block.fontFamily === 'monospace' ? 'selected' : ''}>Impressora (Monospaçada)</option>
          <option value="sans-serif" ${block.fontFamily === 'sans-serif' ? 'selected' : ''}>Moderna (Sem Serifa)</option>
          <option value="serif" ${block.fontFamily === 'serif' ? 'selected' : ''}>Clássica (Com Serifa)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tamanho (Scale)</label>
        <select onchange="updateSelectedBlock('scale', parseInt(this.value))">
          <option value="1" ${block.scale === 1 ? 'selected' : ''}>1x (Pequena)</option>
          <option value="2" ${block.scale === 2 ? 'selected' : ''}>2x (Média)</option>
          <option value="3" ${block.scale === 3 ? 'selected' : ''}>3x (Grande)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Estilos e Moldura</label>
        <div class="style-buttons">
          <button class="btn-toggle ${block.bold ? 'active' : ''}" onclick="toggleStyle('bold')">B</button>
          <button class="btn-toggle ${block.italic ? 'active' : ''}" onclick="toggleStyle('italic')">I</button>
          <button class="btn-toggle ${block.underline ? 'active' : ''}" onclick="toggleStyle('underline')">U</button>
          <button class="btn-toggle ${block.hasBorder ? 'active' : ''}" onclick="toggleStyle('hasBorder')">🔲 Moldura</button>
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

// Função auxiliar para converter blocos visuais complexos em matriz de bytes (Rasterização)
async function generateBitmapCode(block, index) {
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '384px';
  tempDiv.style.background = 'white';
  tempDiv.style.color = 'black';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.padding = '8px 0';
  tempDiv.style.boxSizing = 'border-box';

  let contentHtml = '';
  if (block.type === 'text') {
    const fontSize = block.scale * 14;
    let textDecoration = block.underline ? 'underline' : 'none';
    let fontStyle = block.italic ? 'italic' : 'normal';
    let fontWeight = block.bold ? 'bold' : 'normal';
    let fontFamily = block.fontFamily || 'monospace';
    let borderCss = block.hasBorder ? `border: ${block.scale * 2}px solid black; padding: 4px 8px; display: inline-block;` : '';
    contentHtml = `<div style="text-align: ${block.align};"><div style="font-size: ${fontSize}px; font-weight: ${fontWeight}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; font-family: ${fontFamily}; word-break: break-word; ${borderCss}">${block.content}</div></div>`;
  } else if (block.type === 'rectangle') {
    const alignFlex = block.align === 'center' ? 'center' : (block.align === 'right' ? 'flex-end' : 'flex-start');
    contentHtml = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: ${block.width}px; height: ${block.height}px; border: ${block.thickness}px solid black; box-sizing: border-box;"></div></div>`;
  } else if (block.type === 'circle') {
    const alignFlex = block.align === 'center' ? 'center' : (block.align === 'right' ? 'flex-end' : 'flex-start');
    const dim = block.radius * 2;
    contentHtml = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: ${dim}px; height: ${dim}px; border-radius: 50%; border: ${block.thickness}px solid black; box-sizing: border-box;"></div></div>`;
  } else if (block.type === 'triangle') {
    const alignFlex = block.align === 'center' ? 'center' : (block.align === 'right' ? 'flex-end' : 'flex-start');
    contentHtml = `<div style="display: flex; justify-content: ${alignFlex};"><div style="width: 0; height: 0; border-left: ${block.baseWidth/2}px solid transparent; border-right: ${block.baseWidth/2}px solid transparent; border-bottom: ${block.height}px solid black;"></div></div>`;
  }

  tempDiv.innerHTML = contentHtml;
  document.body.appendChild(tempDiv);

  const canvas = await html2canvas(tempDiv, { scale: 1, backgroundColor: '#FFFFFF' });
  document.body.removeChild(tempDiv);

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const bytesPerRow = Math.ceil(width / 8);
  let hexArray = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < bytesPerRow; x++) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        const px = (x * 8) + b;
        if (px < width) {
          const i = (y * width + px) * 4;
          const r = imgData[i], g = imgData[i+1], b_col = imgData[i+2], a = imgData[i+3];
          const brightness = a === 0 ? 255 : (r + g + b_col) / 3;
          if (brightness < 128) byte |= (1 << (7 - b)); 
        }
      }
      hexArray.push('0x' + byte.toString(16).padStart(2, '0').toUpperCase());
    }
  }

  const arrayName = `bmp_block_${index}`;
  const arrayCode = `const uint8_t ${arrayName}[] PROGMEM = {\n  ${hexArray.join(', ')}\n};`;
  const printCode = `  impressora.printBitmap(${width}, ${height}, ${arrayName});`;

  return { arrayCode, printCode };
}

async function exportIno() {
  const btn = document.querySelector('.btn-primary');
  const originalText = btn.innerText;
  btn.innerText = '⏳ Compilando...';
  btn.disabled = true;

  let bitmapsCode = '';
  let loopCode = '';

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    if (b.type === 'text' && !b.hasBorder) {
      loopCode += `  impressora.setFontScale(${b.scale});\n`;
      if (b.align === 'center') loopCode += `  impressora.printCentered("${b.content}");\n`;
      else if (b.align === 'right') loopCode += `  impressora.printRight("${b.content}");\n`;
      else loopCode += `  impressora.printLine("${b.content}");\n`;
    } 
    else if (b.type === 'cut') {
      loopCode += `  impressora.cutPaper(${b.feedLines});\n`;
    } 
    else {
      const bmp = await generateBitmapCode(b, i);
      bitmapsCode += bmp.arrayCode + '\n\n';
      loopCode += bmp.printCode + '\n';
    }
  }

  let ino = `/*\n * Codigo Híbrido gerado via ThermalPrintBLE Studio v2.6.0\n * Autor: Andre Felipe & Gemini\n */\n\n#include <ThermalPrintBLE.h>\n\nThermalPrintBLE impressora;\nconst char* MAC_IMPRESSORA = "25:00:13:00:08:EF";\n\n`;
  ino += bitmapsCode;
  ino += `void setup() {\n  Serial.begin(115200);\n  if (!impressora.beginBLE(MAC_IMPRESSORA)) return;\n\n`;
  ino += loopCode;
  ino += `}\n\nvoid loop() {}\n`;

  const blob = new Blob([ino], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'impressao_thermal_hibrida.ino';
  a.click();

  btn.innerText = originalText;
  btn.disabled = false;
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
                      
