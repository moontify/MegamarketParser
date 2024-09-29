document.addEventListener('DOMContentLoaded', function() {
    // Проверяем роль пользователя
    const userRole = sessionStorage.getItem('role');
    const assignGroupSection = document.querySelector('.assign-group-section');

    if (userRole === 'Разработчик') {
        assignGroupSection.style.display = 'block';
    } else {
        assignGroupSection.style.display = 'none';
    }
     const assignGroupForm = document.querySelector('.assign-group-form');
    if (assignGroupForm) {
        assignGroupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Получение данных из формы
            const userId = document.getElementById('user-id').value;
            const groupName = document.getElementById('group-name').value;

            // Отправка запроса на сервер для назначения группы пользователю
            fetch('/assign-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, group_name: groupName }),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message); // Показываем сообщение от сервера
                // Здесь вы можете добавить дополнительные действия, например, обновление страницы
            })
            .catch(error => console.error('Ошибка:', error));
        });
    }
});


document.getElementById('showUsersList').addEventListener('click', function() {
    fetch('/users-list')
        .then(response => response.json())
        .then(data => {
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = ''; // Очищаем текущий список
            data.forEach(user => {
                const userElement = document.createElement('div');
                userElement.innerHTML = `
                    <p>Имя: ${user.username}, Группа: ${user.group_name}</p>
                    <select onchange="changeUserRole(${user.id}, this.value)">
                        <option value="Разработчик" ${user.group_name === 'Разработчик' ? 'selected' : ''}>Разработчик</option>
                        <option value="Пользователь" ${user.group_name === 'Пользователь' ? 'selected' : ''}>Пользователь</option>
                        <option value="Посетитель" ${user.group_name === 'Посетитель' ? 'selected' : ''}>Посетитель</option>
                    </select>
                `;
                usersList.appendChild(userElement);
            });
            document.getElementById('usersListModal').style.display = 'block'; // Показываем модальное окно
        })
        .catch(error => console.error('Ошибка:', error));
});

// Функция для изменения роли пользователя
function changeUserRole(userId, newRole) {
    fetch('/change-user-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, new_role: newRole }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Ошибка:', error));
}
