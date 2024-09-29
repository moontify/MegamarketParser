document.querySelector('.add-link-btn').addEventListener('click', function() {
    const linksContainer = document.querySelector('.links-container');
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('placeholder', 'Новая ссылка');
    newInput.className = 'input-link';
    linksContainer.insertBefore(newInput, this);
    console.log('Добавлена новая ссылка'); // Логирование
});

document.querySelector('.delete-btn').addEventListener('click', function() {
    const linksContainer = document.querySelector('.links-container');
    if(linksContainer.children.length > 3) { // 2 inputs + 2 buttons
        linksContainer.removeChild(linksContainer.children[linksContainer.children.length - 3]);
        console.log('Удалена ссылка'); // Логирование
    }
});

document.querySelector('.start-parser-btn').addEventListener('click', function() {
    const settings = {
        links: document.querySelectorAll('.input-link')[1].value,
        work247: document.querySelectorAll('.toggle-switch input')[0].checked,
        addToTable: document.querySelectorAll('.toggle-switch input')[1].checked,
        bonus: document.querySelector('.input-bonus').value,
        minPrice: document.querySelectorAll('.input-price')[0].value,
        maxPrice: document.querySelectorAll('.input-price')[1].value,
    };
    console.log('Отправляемые настройки:', settings); // Логирование отправляемых данных

    fetch('/save_settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
    })
    .then(response => {
        console.log('Статус ответа:', response.status); // Логирование статуса ответа
        return response.text();
    })
    .then(data => {
        console.log('Ответ сервера:', data); // Логирование ответа сервера
        alert(data); // Простое уведомление о результате
    })
    .catch((error) => {
        console.error('Ошибка при отправке данных:', error); // Логирование ошибки
    });
});
