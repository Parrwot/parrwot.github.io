class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    scale(s) {
        return new Vector(this.x * s, this.y * s);
    }

    size() {
        return Math.hypot(this.x, this.y);
    }
}

class Object {
    constructor(
        screen,
        bounciness,
        position = new Vector(0, 0),
        velocity = new Vector(0, 0),
        acceleration = new Vector(0, 0),
        radius = 10,
        color = "red"
    ) {
        this.screen = screen;
        this.ctx = screen.getContext("2d");
        this.bounciness = bounciness;

        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.radius = radius;
        this.color = color;
        this.mass = Math.PI * this.radius * this.radius;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            2 * Math.PI
        );
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
    }

    updatePos() {
        const floor = this.screen.height - this.radius;
        const rightWall = this.screen.width - this.radius;

        // apply velocity
        this.position = this.position.add(this.velocity);

        // collision with floor
        if (this.position.y > floor) {
            this.position = new Vector(this.position.x, floor);
            this.velocity = new Vector(
                this.velocity.x,
                -this.velocity.y * this.bounciness
            );
        }
            
        // collision with ceiling
        if (this.position.y < this.radius) {
            this.position = new Vector(this.position.x, this.radius);
            this.velocity = new Vector(
                this.velocity.x,
                -this.velocity.y * this.bounciness
            );
        }

        // collision with right wall
        if (this.position.x > rightWall) {
            this.position = new Vector(rightWall, this.position.y);
            this.velocity = new Vector(
                -this.velocity.x * this.bounciness,
                this.velocity.y
            );
        }

        // collision with left wall
        if (this.position.x < this.radius) {
            this.position = new Vector(this.radius, this.position.y);
            this.velocity = new Vector(
                -this.velocity.x * this.bounciness,
                this.velocity.y
            );
        }

        // apply acceleration
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.scale(0.99);
    }
}

const objects = [];

function mainLoop() {
    const screen = document.getElementById("screen");
    
    function drawScene() {
            const ctx = screen.getContext("2d");
            ctx.clearRect(0, 0, screen.width, screen.height);
            objects.forEach((element) => element.draw());
    }
    
    function resizeCanvas() {
            screen.width = window.innerWidth;
            screen.height = window.innerHeight;
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    function step() {
            objects.forEach((element) => element.updatePos());

            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    resolveElasticCollision(objects[i], objects[j]);
                }
            }
            drawScene();
            requestAnimationFrame(step);
    }
    
    step();
}

const colors = ["red", "orange", "yellow", "green", "blue", "teal", "violet"];

function resolveElasticCollision(a, b) {
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;
    const elasticity = Math.min(a.bounciness, b.bounciness);
    if (dist === 0 || dist >= minDist) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const rvx = b.velocity.x - a.velocity.x;
    const rvy = b.velocity.y - a.velocity.y;

    const velAlongNormal = rvx * nx + rvy * ny;
    if (velAlongNormal > 0) return;

    const impulse = ( - ( 1 + elasticity ) * velAlongNormal) / ( 1 / a.mass + 1 / b.mass);

    
    a.velocity = new Vector(
        a.velocity.x - (impulse / a.mass) * nx,
        a.velocity.y - (impulse / a.mass) * ny
    );
    
    b.velocity = new Vector(
        b.velocity.x + (impulse / b.mass) * nx,
        b.velocity.y + (impulse / b.mass) * ny
    );

    const overlap = minDist - dist;
    const correction = overlap / (a.mass + b.mass);

    a.position = new Vector(
        a.position.x - correction * b.mass * nx,
        a.position.y - correction * b.mass * ny
    );

    b.position = new Vector(
        b.position.x + correction * a.mass * nx,
        b.position.y + correction * a.mass * ny
    );
}

function deleteClicked(event) {
    const screen = document.getElementById("screen");
    const rect = screen.getBoundingClientRect();
    const clickPosition = new Vector(
        event.clientX - rect.left,
        event.clientY - rect.top
    );

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const dx = obj.position.x - clickPosition.x;
        const dy = obj.position.y - clickPosition.y;

        if (Math.hypot(dx, dy) <= obj.radius) {
            objects.splice(i, 1);
        }
    }
}

function dropObject() {
    const screen = document.getElementById("screen");
    let bounciness;

    if (document.getElementById("bouncinessRandom").checked) {
        bounciness = Math.floor( Math.random() * 10 ) / 10;
    } else {
        bounciness = parseFloat( document.getElementById("bouncinessInput").value );
    }

    let radius;

    if (document.getElementById("radiusRandom").checked) {
        radius = Math.floor( Math.random() * 300 );
    } else {
        radius = parseInt( document.getElementById("radiusInput").value );
    }

    const g = 9.8 * 0.06;

    let color = colors[ Math.floor( Math.random() * 7 ) ];
    let velocity = new Vector( Math.floor( Math.random() * 200 - 100 ), Math.floor( Math.random() * 200 - 100) );

    const obj = new Object(
        screen,
        bounciness,
        new Vector(screen.width / 2, screen.height / 2),
        velocity,
        new Vector(0, g),
        radius,
        color
    );
    objects.push(obj);
}
document.addEventListener("click", deleteClicked);

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("dropButton")
        .addEventListener("click", dropObject);
    mainLoop();
});
