document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight;

    let selectedBuilding = null;

    const gameState = {
        resources: {
            money: 1000,
            electricity: 100,
            water: 100,
            waste: 0,
        },
        buildings: [],
        citizens: 100,
        happiness: 75,
    };

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gridSize = 50;
        ctx.strokeStyle = '#ddd';
        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.strokeRect(x, y, gridSize, gridSize);
            }
        }
    }

    function drawBuildings() {
        gameState.buildings.forEach(building => {
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, 50, 50);
        });
    }

    function updateGame() {
        // Update resources, consumption, production, and happiness
        drawGrid();
        drawBuildings();
    }

    canvas.addEventListener('click', function(event) {
        if (!selectedBuilding) return;

        const gridX = Math.floor(event.offsetX / 50) * 50;
        const gridY = Math.floor(event.offsetY / 50) * 50;

        if (gameState.resources.money >= 100) {
            gameState.buildings.push({
                type: selectedBuilding,
                x: gridX,
                y: gridY,
                color: selectedBuilding === 'park' ? 'green' : 'gray'
            });
            gameState.resources.money -= 100;
            updateResourcesUI();
        }
    });

    document.querySelectorAll('#building-options button').forEach(button => {
        button.addEventListener('click', function() {
            selectedBuilding = this.getAttribute('data-type');
        });
    });

    function updateResourcesUI() {
        document.getElementById('money').textContent = gameState.resources.money;
        document.getElementById('electricity').textContent = gameState.resources.electricity;
        document.getElementById('water').textContent = gameState.resources.water;
        document.getElementById('waste').textContent = gameState.resources.waste;
        document.getElementById('citizens').textContent = gameState.citizens;
        document.getElementById('happiness').textContent = gameState.happiness;
    }

    // Start game loop
    setInterval(updateGame, 1000 / 30); // 30 FPS
});
