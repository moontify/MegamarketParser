document.querySelector('.add-link-btn').addEventListener('click', function() {
    const linksSettingsContainer = document.querySelector('.links-settings-container');
    const newLinkContainer = document.createElement('div');
    newLinkContainer.className = 'link-bonus-price-container';
    newLinkContainer.innerHTML = `
        <input type="text" class="input-link" placeholder="Новая ссылка">
        <input type="number" class="input-bonus" placeholder="Бонус (%)">
        <input type="number" class="input-price" placeholder="Мин. цена">
        <input type="number" class="input-price" placeholder="Макс. цена">
        <button class="delete-btn">Удалить</button>
    `;
    linksSettingsContainer.insertBefore(newLinkContainer, this);
});


document.addEventListener('DOMContentLoaded', function () {
            var addToTableCheckbox = document.getElementById('add-to-table');
            var uploadToDriveContainer = document.getElementById('drive-upload-container');

            function toggleUploadToDrive() {
                if (addToTableCheckbox.checked) {
                    uploadToDriveContainer.style.display = 'block';
                } else {
                    uploadToDriveContainer.style.display = 'none';
                }
            }

            addToTableCheckbox.addEventListener('change', toggleUploadToDrive);

            toggleUploadToDrive();
        });

document.querySelector('.links-settings-container').addEventListener('click', function(event) {
    if (event.target.className === 'delete-btn') {
        this.removeChild(event.target.parentNode);
    }
});

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
function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Показываем уведомление
    setTimeout(function() {
        notification.classList.add('active');
    }, 100);

    // Удаляем уведомление после анимации
    setTimeout(function() {
        notification.classList.remove('active');
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}
const bannedWords = ['https://megamarket.ru/catalog/vakuumnye-stimulyatory/', 'https://megamarket.ru/catalog/eroticheskie-stimulyatory/','https://megamarket.ru/catalog/falloimitatory-i-vibratory/','https://megamarket.ru/catalog/masturbatory/','https://megamarket.ru/catalog/seks-kukly/','https://megamarket.ru/catalog/ekstendery/','https://megamarket.ru/catalog/nabory-seks-igrushek/','https://megamarket.ru/catalog/trenazhery-kegelya/','https://megamarket.ru/catalog/vakuumnye-pompy/','https://megamarket.ru/catalog/analnye-igrushki/','https://megamarket.ru/catalog/aksessuary-dlya-seks-igrushek/','https://megamarket.ru/catalog/seks-igrushki/', 'bdsm', 'dildo','penis','vagina','1488','ziga','nazi','gitler','hitler','straponi','vibr',];

function containsBannedWord(link) {
    return bannedWords.some(bannedWord => link.includes(bannedWord));
}
let username
fetch('/get_username')
    .then(response => response.json())
    .then(data => {
        username = data.username
        console.log(data.username)
    })
    .catch(error =>
    console.error('Bla', error));

document.querySelector('.start-parser-btn').addEventListener('click', function() {
    const linkInputs = document.querySelectorAll('.input-link');
    let isBanned = false;

    const videos = ['/static/net.mp4', '/static/social.mp4', '/static/dolbaeb.mp4', '/static/mvd.mp4', '/static/tebe14.mp4'];

    linkInputs.forEach(input => {
        if (containsBannedWord(input.value)) {
            isBanned = true;
        }
    });

    if (isBanned) {
        const selectedVideo = videos[Math.floor(Math.random() * videos.length)];

        const videoElement = document.getElementById('bannedWordVideo');
        videoElement.querySelector('source').setAttribute('src', selectedVideo);
        videoElement.load();

        let repeatCount = 0;
        videoElement.style.display = 'block';

        const playVideoFullscreen = () => {
            if (repeatCount < 1) {
                if (videoElement.requestFullscreen) {
                    videoElement.play().then(() => {
                        repeatCount++;
                        videoElement.requestFullscreen().catch(err => {
                            console.log(err.message);
                        });
                    });
                } else {
                    if (videoElement.webkitRequestFullscreen) videoElement.webkitRequestFullscreen();
                    else if (videoElement.mozRequestFullScreen) videoElement.mozRequestFullScreen();
                    else if (videoElement.msRequestFullscreen) videoElement.msRequestFullscreen();
                    videoElement.play();
                    repeatCount++;
                }
            } else {
                document.location.reload(true);
            }
        };

        videoElement.addEventListener('ended', playVideoFullscreen);
        playVideoFullscreen();
        return;
    }

    const switches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    const work247 = switches[0].checked;
    const addToTable = switches[1].checked;
    const addTogDrive = switches[2].checked;
    const linkContainers = document.querySelectorAll('.link-bonus-price-container');
    const settings = Array.from(linkContainers).map((container, index) => {
        return {
            [`link${index + 1 + username}`]: container.querySelector('.input-link').value,
            [`bonus${index + 1 + username}`]: container.querySelector('.input-bonus').value,
            [`minPrice${index + 1 + username}`]: container.querySelectorAll('.input-price')[0].value,
            [`maxPrice${index + 1 + username}`]: container.querySelectorAll('.input-price')[1].value,
            [`work247${index + 1 + username}`]: work247,
            [`addToTable${index + 1 + username}`]: addToTable,
            [`addTogDrive${index + 1 + username}`]: addTogDrive

        };
    });


    showNotification('Парсер запущен!');

    console.log('Отправляемые настройки:', settings);

    fetch('/save_settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settings })
    })
    .then(response => {
        console.log('Статус ответа:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('Ответ сервера:', data);
    })
    .catch((error) => {
        console.error('Serverebal', error);
    });
});
