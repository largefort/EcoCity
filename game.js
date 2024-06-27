document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight;

    let selectedBuilding = null;
    let buildingsData = [];
    let eventsData = [];

    const gameState = {
        resources: {
            money: 1000000,
            electricity: 100,
            water: 100,
            waste: 0,
        },
        buildings: [],
        citizens: 100,
        happiness: 75,
    };

    function loadGameState() {
        const savedState = localStorage.getItem('ecoCityGameState');
        if (savedState) {
            Object.assign(gameState, JSON.parse(savedState));
        }
    }

    function saveGameState() {
        localStorage.setItem('ecoCityGameState', JSON.stringify(gameState));
    }

    fetch('data/buildings.json')
        .then(response => response.json())
        .then(data => buildingsData = data);

    fetch('data/events.json')
        .then(response => response.json())
        .then(data => eventsData = data);

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

    function updateResources() {
        let totalElectricity = 0;
        let totalWater = 0;
        let totalWaste = 0;
        let totalMoney = 0;

        gameState.buildings.forEach(building => {
            const buildingData = buildingsData.find(b => b.type === building.type);
            totalElectricity += buildingData.electricity;
            totalWater += buildingData.water;
            totalWaste += buildingData.waste;

            if (building.type === 'commercial') {
                totalMoney += 10; // Passive income from commercial buildings
            } else if (building.type === 'industrial') {
                totalElectricity += 10; // Passive energy production from industrial buildings
            } else if (building.type === 'waterFactory') {
                totalWater += 50; // Passive water production from water factory
            } else if (building.type === 'ecoCleaningService') {
                totalWaste -= 20; // Passive waste reduction from eco cleaning service
            }
        });

        gameState.resources.money += totalMoney;
        gameState.resources.electricity += totalElectricity;
        gameState.resources.water += totalWater;
        gameState.resources.waste += totalWaste;

        updateResourcesUI();
    }

    function updateGame() {
        updateResources();
        drawGrid();
        drawBuildings();
        saveGameState(); // Save the game state after each update
    }

    canvas.addEventListener('click', function(event) {
        if (!selectedBuilding) return;

        const gridX = Math.floor(event.offsetX / 50) * 50;
        const gridY = Math.floor(event.offsetY / 50) * 50;

        const buildingData = buildingsData.find(b => b.type === selectedBuilding);
        if (gameState.resources.money >= buildingData.cost) {
            gameState.buildings.push({
                type: selectedBuilding,
                x: gridX,
                y: gridY,
                color: buildingData.color
            });
            gameState.resources.money -= buildingData.cost;
            updateResourcesUI();
            saveGameState(); // Save the game state after placing a building
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

    // Load the game state from local storage when the page loads
    loadGameState();

    // Update the resources UI with the loaded game state
    updateResourcesUI();

    // Start game loop
    setInterval(updateGame, 1000); // Update game every second for passive income and energy production
});
