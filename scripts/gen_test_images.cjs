const fs = require('fs');

function createSvg(w, h, label, bg, border) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${bg}" stroke="${border}" stroke-width="16"/>
    <text x="${w / 2}" y="${h / 2}" font-family="sans-serif" font-size="24" font-weight="bold" fill="${border}" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
}

fs.mkdirSync('./public/test-images', { recursive: true });
fs.writeFileSync('./public/test-images/landscape.svg', createSvg(600, 300, 'LANDSCAPE (2:1)', '#fef08a', '#ca8a04'));
fs.writeFileSync('./public/test-images/portrait.svg', createSvg(300, 600, 'PORTRAIT (1:2)', '#bae6fd', '#0284c7'));
fs.writeFileSync('./public/test-images/square.svg', createSvg(400, 400, 'SQUARE (1:1)', '#fbcfe8', '#db2777'));
fs.writeFileSync('./public/test-images/exact.svg', createSvg(384, 528, 'PANEL RATIO (4:5.5)', '#bbf7d0', '#16a34a'));
console.log('Test images generated successfully');
