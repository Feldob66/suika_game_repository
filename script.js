const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');

const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');
const balls = [];
const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];
const sizes = [1, 2, 3, 4];
let score = 0; // Initialize the score variable

// Temporary preview ball
let previewBall = null;
const previewY = 536; // Adjust the fixed y-coordinate for the showcase line

// Gravitational acceleration
const gravity = 0.1;
const bounceStrength = 0.7; // Adjust the bounce strength as needed

// Function to update and draw the score
function drawScore() {
    // Set canvas size based on device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas1.width = 150 * dpr;
    canvas1.height = 150 * dpr;

    ctx1.scale(dpr, dpr); // Scale drawing context to match device pixel ratio

    ctx1.font = "20px Arial";
    ctx1.fillStyle = "black";
    ctx1.textAlign = "center";

    // Clear the canvas before drawing the score
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

    ctx1.fillText("Score: " + score, canvas1.width / 2, canvas1.height / 6);
}

// Golyó objektum létrehozása
function Ball(x, y, sizeIndex, dx, dy) {
    this.x = x;
    this.y = y;
    this.sizeIndex = sizeIndex;
    this.radius = sizes[sizeIndex] * 10;
    this.color = colors[sizeIndex];
    this.dx = dx;
    this.dy = dy;

    this.draw = function (context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    };

    this.update = function () {
        this.x += this.dx;
        this.y += this.dy;

        // Ütközés ellenőrzése a bal és jobb oldalakkal
        if (this.x - this.radius < 0 || this.x + this.radius > canvas2.width) {
            this.dx = -this.dx * bounceStrength; // Bounce off the walls with reduced strength
        }

        // Ütközés ellenőrzése a felső és alsó oldalakkal
        if (this.y + this.radius > canvas2.height) {
            this.y = canvas2.height - this.radius; // Snap to the ground
            this.dy = -this.dy * bounceStrength; // Bounce off the ground with reduced strength
        }

        // Gravitációs hatás
        this.dy += gravity;

        this.handleCollisions(); // Kollíziókezelés hozzáadása
        this.draw(ctx2);
    };

    this.handleCollisions = function () {
        // Ütközés kezelése másik golyóval
        for (let i = 0; i < balls.length; i++) {
            const otherBall = balls[i];
            if (otherBall !== this && this.isColliding(otherBall)) {
                this.resolveCollision(otherBall);
            }
        }
    };

    this.isColliding = function (otherBall) {
        const distance = Math.sqrt((this.x - otherBall.x) ** 2 + (this.y - otherBall.y) ** 2);
        return distance < this.radius + otherBall.radius;
    };

    this.resolveCollision = function (otherBall) {
        const tempDx = this.dx;
        const tempDy = this.dy;

        if (this.color !== '#ffff00' && otherBall.color !== '#ffff00') {
            // Merge same-color balls (excluding #ffff00)
            if (this.color === otherBall.color) {
                const totalRadius = this.radius + otherBall.radius;
                const newRadius = Math.sqrt(totalRadius * totalRadius);
                const nextSizeIndex = (this.sizeIndex + 1) % sizes.length;

                if (this.sizeIndex < otherBall.sizeIndex) {
                    this.sizeIndex = nextSizeIndex;
                    this.radius = sizes[nextSizeIndex] * 10;
                    this.color = colors[nextSizeIndex];
                    balls.splice(balls.indexOf(otherBall), 1);
                    score++; // Increment the score when a ball is merged
                } else {
                    otherBall.sizeIndex = nextSizeIndex;
                    otherBall.radius = sizes[nextSizeIndex] * 10;
                    otherBall.color = colors[nextSizeIndex];
                    balls.splice(balls.indexOf(this), 1);
                    score++; // Increment the score when a ball is merged
                }
            } else {
                // Bounce off different-color balls
                this.dx = otherBall.dx;
                this.dy = otherBall.dy;
                otherBall.dx = tempDx;
                otherBall.dy = tempDy;
            }
        } else {
            // Bounce off all other cases (yellow balls colliding with any other ball)
            this.dx = otherBall.dx;
            this.dy = otherBall.dy;
            otherBall.dx = tempDx;
            otherBall.dy = tempDy;
        }
    };
}

// Eseménykezelő a kattintásokhoz
canvas2.addEventListener('click', function (e) {
    if (previewBall) {
        const mouseX = e.clientX - canvas2.getBoundingClientRect().left;

        // A kattintás helyén létrehozzuk a golyót a preview golyó tulajdonságaival
        balls.push(new Ball(mouseX, canvas2.height - previewY, previewBall.sizeIndex, (Math.random() - 0.5) * 4, 0));

        // Töröljük a preview golyót
        previewBall = null;
    }
});

// Eseménykezelő a kurzormozdulatokhoz a preview golyóval
canvas2.addEventListener('mousemove', function (e) {
    const mouseX = e.clientX - canvas2.getBoundingClientRect().left;

    // Megjelenítjük a preview golyót a kurzor helyén, ha még nincs kattintva
    if (!previewBall) {
        const sizeIndex = Math.floor(Math.random() * 2); // Only the first two colors
        previewBall = new Ball(mouseX, canvas2.height - previewY, sizeIndex, 0, 0); // Fixed y-coordinate
    } else {
        // Frissítjük a preview golyó x-koordinátáját a kurzorral
        previewBall.x = mouseX;
    }
});

// Animáció
function animate() {
    requestAnimationFrame(animate);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    // Draw the score in the top third of the canvas1
    drawScore();

    // Kirajzoljuk a preview golyót, ha létezik
    if (previewBall) {
        previewBall.draw(ctx2);
    }

    balls.forEach(ball => {
        ball.update();
    });
}

animate();
