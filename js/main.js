// --------------------------------- GLOBAL VARIABLES. -------------------------------- \\
const CANVAS        = document.getElementById('the-canvas');
const CANVAS_HEIGHT = CANVAS.height;
const CANVAS_WIDTH  = CANVAS.width;
const CTX           = CANVAS.getContext('2d');

var paused = false;

// -------------------------- GLOBAL WORLD CONTROL PARAMETERS. ------------------------ \\
var particleWeight = 0.1
var particleMaxVel = 30
var particleSteer  = 10
var nozzleWidth    = 20
var nozzlePosition = 300

// Relocate cube controls.
document.getElementById('relocate-cube').addEventListener('click', event => {
  rect.x = 180;
});

var nozzleRadiusLabel = document.querySelector('label[for=nozzle-radius-slider]')
var nozzleRadiusSlider = document.getElementById('nozzle-radius-slider')
nozzleRadiusLabel.textContent = 'Nozzle Radius: ' + nozzleRadiusSlider.value
nozzleRadiusSlider.addEventListener('input', function() {
  nozzleWidth = parseInt(nozzleRadiusSlider.value, 10)
  nozzleRadiusLabel.textContent = 'Nozzle Radius: ' + nozzleWidth
})

var nozzleYLabel = document.querySelector('label[for=nozzle-position-slider]')
var nozzleYSlider = document.getElementById('nozzle-position-slider')
nozzleYLabel.textContent = 'Nozzle Y: ' + nozzleYSlider.value
nozzleYSlider.addEventListener('input', function() {
  nozzlePosition = parseInt(nozzleYSlider.value, 10)
  nozzleYLabel.textContent = 'Nozzle Y: ' + nozzlePosition
})

var gravityLabel = document.querySelector('label[for=gravity-slider]')
var gravitySlider = document.getElementById('gravity-slider')
gravityLabel.textContent = 'Particle Weight: ' + gravitySlider.value
gravitySlider.addEventListener('input', function() {
  particleWeight = parseInt(gravitySlider.value, 10) / 100
  gravityLabel.textContent = 'Particle Weight: ' + particleWeight
})

var maxVelLabel = document.querySelector('label[for=max-vel-slider]')
var maxVelSlider = document.getElementById('max-vel-slider')
maxVelLabel.textContent = 'Max Velocity: ' + maxVelSlider.value
maxVelSlider.addEventListener('input', function() {
  particleMaxVel = parseInt(maxVelSlider.value, 10)
  maxVelLabel.textContent = 'Max Velocity: ' + particleMaxVel
})

var steerLabel = document.querySelector('label[for=steer-slider]')
var steerSlider = document.getElementById('steer-slider')
steerLabel.textContent = 'Mouse Steer: ' + steerSlider.value
steerSlider.addEventListener('input', function() {
  particleSteer = parseInt(steerSlider.value, 10)
  steerLabel.textContent = 'Mouse Steer: ' + particleSteer
})

// ---------------------------- Fluid particle definition. ---------------------------- \\

function Mouse() {
    this.x = 0;
    this.y = 0;
}

var mouse = new Mouse();

function FluidParticle(options) {
    this.x         = options.x;
    this.y         = options.y;
    this.color     = options.color;
    this.xVel      = options.xVel;
    this.yVel      = options.yVel;
    this.maxVel    = options.maxVel;
    this.steer     = options.steer;
    this.weight    = options.weight;
}


FluidParticle.prototype.render = function() {
    CTX.fillStyle = 'rgba(' + parseInt((this.xVel * Math.abs(this.yVel) * 33), 10) + ', 180, 255, 1)';
    CTX.fillRect(this.x, this.y, 1, 1);
};

FluidParticle.prototype.checkBounds = function() {
    if (this.x >= CANVAS_WIDTH) {
        return false;
    } else if (this.x < 0) {
        return false;
    } 
    if (this.y >= CANVAS_HEIGHT) {
        // Bounce off the floor.
        this.y = CANVAS_HEIGHT - 1;
        this.yVel = -this.yVel * (0.3 + (0.2 * Math.random())); // 0.5 is the dampening.

        return false;
    } else if (this.y < -40) {
        return false;
    }
    return true;
};

FluidParticle.prototype.moveTowards = function(x, y) {

    if (this.yVel < this.maxVel) {
        // if (Math.random() > 0.6) {
            
            var dist = Math.abs(this.x - x);

            if (dist < 10) dist = 10;

            if (this.y < y) {
                if (this.x < x)
                    this.yVel += this.steer / dist;
            } else {
                if (this.x < x)
                    this.yVel -= this.steer / dist;
            }
        // }
        
    }

    // if (this.x < this.maxVel) {
        if (this.x < x) {
            // this.x += this.steer;
        } else {
            // this.x -= this.steer;
        }  
    // }
};

var particles = [];

for (var i = 0; i < 3000; i += 1) {

    particles.push(createParticle(Math.random() * CANVAS_WIDTH));
}

function Rectangle(options) {
    this.x = options.x;
    this.y = options.y;
    this.width  = options.width;
    this.height = options.height;
    this.weight = options.weight;
}
Rectangle.prototype.checkCollisionWithParticles = function() {
    particles.forEach(particle => {
        if (particle.x >= this.x && particle.x <= this.x + this.width &&
            particle.y >= this.y && particle.y <= this.y + this.height) {
            this.x += 1 / this.weight;
        }
    });
};

var rect = new Rectangle({
    x: 180,
    y: 420,
    width: 60,
    height: 60,
    weight: 100
});


// ---------------------------------- The game loop. ---------------------------------- \\
requestAnimationFrame(heartbeat);

var counter = 0;
var outOfBounds = 0;

function heartbeat() {
    if (!paused) {
        CTX.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // <--- DISABLE CLEARING TO SEE THE PARTICLES' PATH.

        CTX.fillStyle = 'orange';

        rect.checkCollisionWithParticles();

        CTX.fillRect(rect.x, rect.y, rect.width, rect.height);

        counter++;
        var timeForVelChangeY = (counter % 20) === 0;

        if ((counter % 61) === 0) {
            counter = 0;
        }

        
        if (outOfBounds > 0) {
            for (var i = 0; i < outOfBounds; i++) {
                particles.push(createParticle());
            }   
            outOfBounds = 0; 
        }
        
        particles = particles.filter(particle => {
            // Vary the Y velocity.
            if (timeForVelChangeY) {
                particle.yVel += 2 * (Math.random() - 0.5);
                if (particle.yVel > particle.maxVel) {
                    particle.yVel = particle.maxVel;
                }
            }

            // Gravity:
            particle.yVel += particle.weight;

            particle.x += particle.xVel;
            particle.y += particle.yVel;

            // if (particle.x < mouse.x) {
                particle.moveTowards(mouse.x, mouse.y);
            // }


            // Check if exited screen.
            particle.checkBounds();

            particle.render();
            
            // Check if out of bounds, and create new particles if needed.
            var inBounds = particle.checkBounds();
            if (!inBounds) {
                outOfBounds++;
            }

            return inBounds;
            
        });
    }
    

    requestAnimationFrame(heartbeat);
}


function createParticle(xPos) {
    var xVel = 3, 
        yVel = 0.5;

    return new FluidParticle({
        x: xPos || 0,
        y: nozzlePosition + nozzleWidth * Math.random(),
        xVel: xVel + 3 * Math.random(),
        yVel: yVel * (Math.random() - 0.5),
        color: 'white',
        maxVel: particleMaxVel,
        steer: particleSteer,
        weight: particleWeight
    });
}

document.addEventListener('keypress', event => {
    if (event.keyCode === 112) {
        paused = paused ? false : true;
    }
});

CANVAS.addEventListener('mousemove', event => {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;
});