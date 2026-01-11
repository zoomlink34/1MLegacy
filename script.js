const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    projectId: "m-legacy-5cf2b",
    storageBucket: "m-legacy-5cf2b.firebasestorage.app",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/",
    messagingSenderId: "644979590232",
    appId: "1:644979590232:web:2e9ef5678087499223b62d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const canvas = document.getElementById('billboardCanvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth, height = window.innerHeight;
canvas.width = width; canvas.height = height;

const blockSize = 50;
let zoom = 0.15, cameraX = 25000, cameraY = 25000;
let approvedPixels = {};

db.ref('pixels').on('value', (snapshot) => {
    approvedPixels = snapshot.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(approvedPixels).length;
});

function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cameraX, -cameraY);
    ctx.strokeStyle = "#111";

    const startCol = Math.max(0, Math.floor((cameraX - (width/2)/zoom) / blockSize));
    const endCol = Math.min(1000, Math.ceil((cameraX + (width/2)/zoom) / blockSize));
    const startRow = Math.max(0, Math.floor((cameraY - (height/2)/zoom) / blockSize));
    const endRow = Math.min(1000, Math.ceil((cameraY + (height/2)/zoom) / blockSize));

    for (let i = startCol; i < endCol; i++) {
        for (let j = startRow; j < endRow; j++) {
            const x = i * blockSize, y = j * blockSize;
            ctx.strokeRect(x, y, blockSize, blockSize);
            const key = `${i}_${j}`;
            if (approvedPixels[key]) {
                const img = new Image();
                img.src = approvedPixels[key].imageUrl;
                ctx.drawImage(img, x, y, blockSize, blockSize);
            }
        }
    }
    ctx.restore();
    requestAnimationFrame(draw);
}

// ড্র্যাগ এবং পেমেন্ট লজিক
function copyText(t){ navigator.clipboard.writeText(t); alert("Copied!"); }
function openPayment(){ document.getElementById('payment-modal').style.display='block'; document.getElementById('overlay').style.display='block'; }
function closePayment(){ document.getElementById('payment-modal').style.display='none'; document.getElementById('overlay').style.display='none'; }

let isDragging = false, lastX, lastY;
canvas.onmousedown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
window.onmouseup = () => isDragging = false;
window.onmousemove = (e) => {
    if (!isDragging) return;
    cameraX -= (e.clientX - lastX) / zoom;
    cameraY -= (e.clientY - lastY) / zoom;
    lastX = e.clientX; lastY = e.clientY;
};
canvas.onwheel = (e) => { zoom = Math.min(Math.max(0.01, zoom * (e.deltaY < 0 ? 1.1 : 0.9)), 5); };
draw();
