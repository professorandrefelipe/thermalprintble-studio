document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = function(event) {
        img.onload = function() {
            processImage(img);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
});

let generatedCode = "";

function processImage(img) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    // As mini impressoras térmicas usam exatamente 384 pixels de largura
    const targetWidth = 384;
    const scale = targetWidth / img.width;
    const targetHeight = Math.floor(img.height * scale);
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Fundo branco e desenha a imagem original redimensionada
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    
    // Dithering (Floyd-Steinberg) para converter a imagem em uma matriz de pontos 1-bit perfeita
    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const oldPixel = (data[idx] + data[idx+1] + data[idx+2]) / 3;
            const newPixel = oldPixel < 128 ? 0 : 255;
            const quantError = oldPixel - newPixel;
            
            data[idx] = data[idx+1] = data[idx+2] = newPixel;
            
            if (x + 1 < targetWidth) {
                const i = idx + 4;
                data[i] = data[i+1] = data[i+2] = Math.min(255, Math.max(0, data[i] + quantError * 7 / 16));
            }
            if (x - 1 >= 0 && y + 1 < targetHeight) {
                const i = idx - 4 + targetWidth * 4;
                data[i] = data[i+1] = data[i+2] = Math.min(255, Math.max(0, data[i] + quantError * 3 / 16));
            }
            if (y + 1 < targetHeight) {
                const i = idx + targetWidth * 4;
                data[i] = data[i+1] = data[i+2] = Math.min(255, Math.max(0, data[i] + quantError * 5 / 16));
            }
            if (x + 1 < targetWidth && y + 1 < targetHeight) {
                const i = idx + 4 + targetWidth * 4;
                data[i] = data[i+1] = data[i+2] = Math.min(255, Math.max(0, data[i] + quantError * 1 / 16));
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Transforma a imagem convertida num array C++ (48 bytes por linha)
    let hexArray = "";
    for (let y = 0; y < targetHeight; y++) {
        hexArray += "  {";
        for (let x = 0; x < targetWidth; x += 8) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
                const idx = ((y * targetWidth) + (x + b)) * 4;
                // O pixel preto (0 na cor) liga o ponto térmico (bit 1)
                if (data[idx] === 0) {
                    byte |= (1 << (7 - b));
                }
            }
            hexArray += "0x" + byte.toString(16).padStart(2, '0').toUpperCase();
            if (x + 8 < targetWidth) hexArray += ", ";
        }
        hexArray += "}";
        if (y < targetHeight - 1) hexArray += ",\n";
    }
    
    const mac = document.getElementById('macInput').value || "25:00:13:00:08:ef";
    
    // Geração do Template Ino - Sem utilizar printBitmap!
    generatedCode = `/*
 * Código gerado pelo ThermalPrintBLE Studio
 * Motor V3: Suporte nativo a imagens via printRawLine384
 * Compatível nativamente com a biblioteca V2.6.3+ (Sem depender da falha do printBitmap)
 */

#include <Arduino.h>
#include <ThermalPrintBLE.h>

const char* MAC_IMPRESSORA = "${mac}";

ThermalPrintBLE impressora;
bool impresso = false;

const int IMG_HEIGHT = ${targetHeight};

// Matriz da imagem formatada perfeitamente para a biblioteca (48 bytes = 384 pixels por linha)
const uint8_t IMG_DATA[][48] PROGMEM = {
${hexArray}
};

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("\\n=== ThermalPrintBLE Studio ===");
  Serial.println("A ligar a impressora...");
  
  if (impressora.beginBLE(MAC_IMPRESSORA)) {
    Serial.println("Ligado! Pressione 'I' no Monitor Serial para imprimir a imagem.");
  } else {
    Serial.println("Falha ao ligar. Verifique o endereco MAC.");
  }
}

void loop() {
  if (impressora.isConnected()) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == 'i' || c == 'I') {
        impresso = false; 
      }
    }

    if (!impresso) {
      Serial.println("A imprimir imagem gerada pelo Studio...");
      impressora.reset();
      
      // A grande sacada: em vez de usar o 'printBitmap' que bloqueava,
      // enviamos a imagem cortada nas mesmas linhas de 384px que o Globo 3D usa!
      for (int y = 0; y < IMG_HEIGHT; y++) {
        uint8_t linha[48];
        memcpy_P(linha, IMG_DATA[y], 48);
        impressora.printRawLine384(linha);
      }
      
      impressora.feedLines(4);
      Serial.println("Impressao concluida!");
      impresso = true;
    }
  } else {
    Serial.println("Aguardando ligacao...");
    delay(5000);
  }
  delay(100);
}
`;
    
    document.getElementById('btnDownload').disabled = false;
}

function downloadIno() {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "impressao_studio.ino";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
