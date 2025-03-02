// Initialize local storage if it doesn't exist
if (!localStorage.getItem('bmiHistory')) {
    localStorage.setItem('bmiHistory', JSON.stringify([]));
}

// DOM Elements
const bmiForm = document.getElementById('bmi-form');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const bmiResult = document.getElementById('bmi-result');
const bmiNumber = document.getElementById('bmi-number');
const bmiCategory = document.getElementById('bmi-category');
const measurementsList = document.getElementById('measurements-list');
const bmiChart = document.getElementById('bmi-chart').getContext('2d');

// BMI Categories with their ranges and colors
const BMI_CATEGORIES = {
    underweight: { max: 18.5, color: '#3498db' },
    normal: { max: 24.9, color: '#2ecc71' },
    overweight: { max: 29.9, color: '#f1c40f' },
    obese: { max: Infinity, color: '#e74c3c' }
};

// Calculate BMI
function calculateBMI(weight, height) {
    // Convert height to meters
    const heightInMeters = height / 100;
    // Calculate BMI: weight (kg) / height² (m)
    return weight / (heightInMeters * heightInMeters);
}

// Get BMI Category
function getBMICategory(bmi) {
    if (bmi < BMI_CATEGORIES.underweight.max) return { name: 'Underweight', color: BMI_CATEGORIES.underweight.color };
    if (bmi < BMI_CATEGORIES.normal.max) return { name: 'Normal', color: BMI_CATEGORIES.normal.color };
    if (bmi < BMI_CATEGORIES.overweight.max) return { name: 'Overweight', color: BMI_CATEGORIES.overweight.color };
    return { name: 'Obese', color: BMI_CATEGORIES.obese.color };
}

// Update BMI History Chart
function updateBMIChart() {
    const bmiHistory = JSON.parse(localStorage.getItem('bmiHistory'));
    
    if (bmiHistory.length === 0) return;

    // Destroy existing chart if it exists
    if (window.bmiLineChart) {
        window.bmiLineChart.destroy();
    }

    const data = {
        labels: bmiHistory.map(record => new Date(record.date).toLocaleDateString()),
        datasets: [{
            label: 'BMI',
            data: bmiHistory.map(record => record.bmi),
            borderColor: '#3498db',
            tension: 0.4,
            fill: false
        }]
    };

    window.bmiLineChart = new Chart(bmiChart, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const bmi = context.raw;
                            const category = getBMICategory(bmi);
                            return `BMI: ${bmi.toFixed(1)} (${category.name})`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Measurements List
function updateMeasurementsList() {
    const bmiHistory = JSON.parse(localStorage.getItem('bmiHistory'));
    measurementsList.innerHTML = '';

    bmiHistory.slice().reverse().forEach(record => {
        const category = getBMICategory(record.bmi);
        const measurementCard = document.createElement('div');
        measurementCard.className = 'measurement-card';
        measurementCard.innerHTML = `
            <span class="date">${new Date(record.date).toLocaleDateString()}</span>
            <span class="value">Weight: ${record.weight} kg</span>
            <span class="value">Height: ${record.height} cm</span>
            <span class="value" style="color: ${category.color}">
                BMI: ${record.bmi.toFixed(1)}
                <small>(${category.name})</small>
            </span>
        `;
        measurementsList.appendChild(measurementCard);
    });
}

// Highlight active BMI category in scale
function updateBMIScale(bmi) {
    const scaleItems = document.querySelectorAll('.scale-item');
    scaleItems.forEach(item => {
        const range = item.dataset.range;
        const category = getBMICategory(bmi);
        if (range === category.name) {
            item.style.backgroundColor = category.color + '20'; // Add transparency
            item.style.borderColor = category.color;
        } else {
            item.style.backgroundColor = '#fff';
            item.style.borderColor = '#ddd';
        }
    });
}

// Handle Form Submission
bmiForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    
    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        alert('Please enter valid weight and height values');
        return;
    }

    const bmi = calculateBMI(weight, height);
    const category = getBMICategory(bmi);

    // Update result display
    bmiResult.classList.remove('hidden');
    bmiNumber.textContent = bmi.toFixed(1);
    bmiNumber.style.color = category.color;
    bmiCategory.textContent = category.name;
    bmiCategory.style.color = category.color;

    // Save to history
    const bmiHistory = JSON.parse(localStorage.getItem('bmiHistory'));
    bmiHistory.push({
        date: new Date().toISOString(),
        weight,
        height,
        bmi
    });
    localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));

    // Update chart and list
    updateBMIChart();
    updateMeasurementsList();
    updateBMIScale(bmi);
});

// Initialize the display
updateBMIChart();
updateMeasurementsList();