//script.js

document.getElementById('solveButton').addEventListener('click', function() {
    var equation = document.getElementById('equationInput').value;
    var matchesToRemove = document.getElementById('matchesToRemove').value; // Зчитування вибраної кількості сірників
    fetch('http://localhost:3000/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equation: equation,
            matchesToRemove: matchesToRemove // Додавання кількості сірників до тіла запиту
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.solution) {
                document.getElementById('solution').textContent = 'Рішення: ' + data.solution;
            } else {
                document.getElementById('solution').textContent = 'Рішення не знайдено.';
            }
            if (data && data.additionalSolution) {
                document.getElementById('additionalSolution').textContent = 'Генератор додаткових умов: ' + data.additionalSolution;
            } else {
                document.getElementById('additionalSolution').textContent = 'Додаткових умов немає.';
            }
        })
        .catch((error) => {
            console.error('Помилка:', error);
            document.getElementById('solution').textContent = 'Сталася помилка при отриманні рішення.';
            document.getElementById('additionalSolution').textContent = ''; // Очищаємо додаткові рішення у разі помилки
        });
});







