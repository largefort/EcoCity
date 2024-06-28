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
            money: 1000,
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
        const gridSize = 50;
        const backgroundColor = '#f0f0f0';
        const lineColor = '#ddd';
        const highlightColor = '#c0c0c0';

        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;

        for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.rect(x, y, gridSize, gridSize);
                ctx.stroke();
            }
        }

        // Highlight hovered cell
        canvas.addEventListener('mousemove', function(event) {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;
            const gridX = Math.floor(mouseX / gridSize) * gridSize;
            const gridY = Math.floor(mouseY / gridSize) * gridSize;

            // Redraw the grid to clear previous highlights
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;

            for (let x = 0; x < canvas.width; x += gridSize) {
                for (let y = 0; y < canvas.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.rect(x, y, gridSize, gridSize);
                    ctx.stroke();
                }
            }

            // Draw highlight
            ctx.fillStyle = highlightColor;
            ctx.fillRect(gridX, gridY, gridSize, gridSize);

            // Redraw buildings
            drawBuildings();
        });
    }

    function drawBuildings() {
        gameState.buildings.forEach(building => {
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, 50, 50);
        });
    }

    function showPopup(text, x, y) {
        const popup = document.createElement('div');
        popup.textContent = text;
        popup.style.position = 'absolute';
        popup.style.left = `${x + canvas.offsetLeft}px`;
        popup.style.top = `${y + canvas.offsetTop}px`;
        popup.style.background = 'rgba(255, 255, 255, 0.8)';
        popup.style.padding = '5px';
        popup.style.border = '1px solid #ddd';
        popup.style.borderRadius = '3px';
        popup.style.pointerEvents = 'none';
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.transition = 'opacity 1s';
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 1000);
        }, 500);
    }

    function updateResources() {
        let totalElectricity = 0;
        let totalWater = 0;
        let totalWaste = 0;
        let totalMoney = 0;
        let totalCitizens = 0;
        let totalHappiness = 0;

        gameState.buildings.forEach(building => {
            const buildingData = buildingsData.find(b => b.type === building.type);
            totalElectricity += buildingData.electricity;
            totalWater += buildingData.water;
            totalWaste += buildingData.waste;
            totalHappiness += buildingData.happiness;

            if (building.type === 'commercial') {
                totalMoney += 10; // Passive income from commercial buildings
                showPopup(`+$10`, building.x, building.y);
            } else if (building.type === 'industrial') {
                totalElectricity += 10; // Passive energy production from industrial buildings
                showPopup(`+10 Energy`, building.x, building.y);
            } else if (building.type === 'waterFactory') {
                totalWater += 50; // Passive water production from water factory
                showPopup(`+50 Water`, building.x, building.y);
            } else if (building.type === 'ecoCleaningService') {
                totalWaste -= 20; // Passive waste reduction from eco cleaning service
                showPopup(`-20 Waste`, building.x, building.y);
            } else if (building.type === 'residential') {
                totalCitizens += 5; // Citizens production from residential buildings
                gameState.happiness -= 0.1; // Decrease happiness slightly
                showPopup(`+5 Citizens`, building.x, building.y);
            } else if (building.type === 'park') {
                totalHappiness += 5; // Happiness production from parks
                if (gameState.happiness < 100) {
                    gameState.happiness += 0.5; // Increase happiness to a max of 100
                    showPopup(`+0.5 Happiness`, building.x, building.y);
                }
            } else if (building.type === 'solarPlant') {
                totalElectricity += 50; // Passive energy production from solar plants
                showPopup(`+50 Energy`, building.x, building.y);
            }
        });

        gameState.resources.money += totalMoney;
        gameState.resources.electricity += totalElectricity;
        gameState.resources.water += totalWater;
        gameState.resources.waste += totalWaste;
        gameState.citizens += totalCitizens;

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
