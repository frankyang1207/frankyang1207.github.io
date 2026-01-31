let canvas = document.getElementById('confetti');

canvas.width = 1280;
canvas.height = 960;

let ctx = canvas.getContext('2d');
let squares = [];
let numberOfSquares = 30;
let lastUpdateTime = Date.now();

function randomColor () {
    let colors = ['#f00', '#0f0', '#00f', '#0ff', '#f0f', '#ff0'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function update () {
    let now = Date.now(),
    dt = now - lastUpdateTime;
    for (let i = squares.length - 1; i >= 0; i--) {
        let p = squares[i];
        if (p.y > canvas.height) {
            squares.splice(i, 1);
            continue;
        }
        p.y += p.gravity * dt;
        p.rotation += p.rotationSpeed * dt;
    }
    while (squares.length < numberOfSquares) {
        squares.push(new Square(Math.random() * canvas.width, -20));
    }
    lastUpdateTime = now;
    setTimeout(update, 1);
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    squares.forEach(function (s) {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.translate(s.x + s.size / 2, s.y + s.size / 2);
        ctx.rotate(s.rotation);
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.restore();
    });
    requestAnimationFrame(draw);
}

function Square (x, y) {
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 0.5 + 0.75) * 15;
    this.gravity = (Math.random() * 0.5 + 0.75) * 0.1;
    this.rotation = (Math.PI * 2) * Math.random();
    this.rotationSpeed = (Math.PI * 2) * (Math.random() - 0.5) * 0.001;
    this.color = randomColor();
}

while (squares.length < numberOfSquares) {
    squares.push(new Square(Math.random() * canvas.width, Math.random() * canvas.height));
}

update();
draw();