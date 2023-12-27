const canvas = document.getElementById('myCanvas');
const ctx=canvas.getContext('2d');
const balls = [];

// Golyó objektum létrehozása
function Ball(x, y, radius, color, dx, dy){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.dx = dx;
    this.dy = dy;

    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    
    this.update = function () {
        this.y += this.dx;
        this.y += this.dy;

        this.draw();

        // Az alsó rész érintésének ellenőrzése
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy = 0; // Ha az alsó részhez ért, a sebességet nullázzuk
        }
    };
}

// Golyók hozzáadása a canvashoz
function createBalls() {
    const colors = ['red', 'blue', 'green', 'yellow']; //Véletlenszerű színek definiálása
    for (let i=0; i < 20; i++) {
        const radius =Math.random() * 20 + 10; // Véletlenszerű méret
        const x =Math.random() * (canvas.width - radius * 2) + radius; // Véletlenszerű kezdőpozíció X tengelyen
        const y = 0; // Kezdőpozíció a canvas tetején
        const color = colors[Math.floor(Math.random() * colors.length)]; // Véletlenszerű szín kiválasztása a tömbből
        const dx = 0; // X tengelyen való sebesség (kezdetben 0, mert fentről indulnak)
        const dy =Math.random() * 2 + 1; // Y tengelyen való kezdeti sebesség

        balls.push(new Ball(x, y, radius, color, dx, dy));
    }
}

// Animáció
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.update();
    });

    canvas.addEventListener('click', function (e) {
        const mousePos = {
            x: e.clientX - canvas.getBoundingClientRect().left,
            y: e.clientY - canvas.getBoundingClientRect().top
        };

        balls.forEach((ball, index) => {
            if (Math.sqrt((mousePos.x - ball.x) ** 2 + (mousePos.y - ball.y) ** 2) < ball.radius) {
                // Kattintásra a golyó leesik (növeljük a sebességet)
                ball.dy = 5;
            }
        });

        // Azonos színű és méretű golyók összeolvasztása
        for (let i=0; i<balls.length; i++) {
            for (let j = i+1; j<balls.length; j++) {
                if (balls[i].color === balls[j].color && balls[i].radius === balls[j].radius) {
                    balls[i].radius += 5; // Méret növelése
                    balls.splice(j, 1); // Az egyesített golyókat töröljük a tömbből
                }
            }
        }
    });
}

createBalls();
animate();