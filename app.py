from flask import Flask, render_template, request, jsonify, session, url_for, redirect
import subprocess
from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.secret_key = '396fa9df0fe7a0a2f65a5d8e7e9a53d0'
db = SQLAlchemy(app)


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=True)
    group = db.relationship('Group', backref=db.backref('users', lazy=True))


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'message': 'Missing data'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    user_group = Group.query.filter_by(name='Пользователь').first()
    if not user_group:
        user_group = Group(name='Пользователь')
        db.session.add(user_group)
        db.session.commit()

    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    user.group_id = user_group.id
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    session['username'] = user.username
    session['group_id'] = user.group_id

    return jsonify({
        'message': 'Registration successful',
        'username': user.username,
        'email': user.email,
        'group_id': user.group_id
    }), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        session['username'] = user.username
        session['group_id'] = user.group_id
        return jsonify({
            'message': 'Login successful',
            'username': user.username,
            'email': user.email
        }), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401


@app.route('/')
def home():
    return render_template('regpage.html')

@app.route('/user-info')
def user_info():
    user_id = session.get('user_id')
    print(session['username'])
    if user_id:
        user = User.query.get(user_id)
        if user:
            return render_template('user-info.html', username=user.username, email=user.email, group_name=user.group.name if user.group else 'Нет группы')
    return "Пользователь не аутентифицирован", 401

@app.route('/get_username')
def get_username():
    username = session['username']
    return jsonify(username=username)
@app.route('/settings')
def settings():
    show_settings_button = False

    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user and (user.group.name == 'Разработчик' or user.group.name == 'Пользователь'):
            show_settings_button = True
            return render_template('index.html', show_settings_button=show_settings_button, username=user.username)
    return "Пользователь не аутентифицирован", 401

@app.route('/users-list', methods=['GET'])
def users_list():
    if 'user_id' not in session:
        return jsonify({'message': 'Необходима аутентификация'}), 401
    current_user = User.query.get(session['user_id'])
    if not current_user or current_user.group.name != 'Разработчик':
        return jsonify({'message': 'Нет, ну русским языком написано ТЕБЕ СЮДА НЕЛЬЗЯ'}), 403
    users = User.query.all()
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'group_name': user.group.name if user.group else 'Без группы'
        })
    return jsonify(users_data), 200



@app.route('/change-user-role', methods=['POST'])
def change_user_role():
    if 'user_id' not in session:
        return jsonify({'message': 'Необходима аутентификация'}), 401
    current_user = User.query.get(session['user_id'])
    if not current_user or current_user.group.name != 'Разработчик':
        return jsonify({'message': 'Доступно только для разработчиков'}), 403
    data = request.get_json()
    user_id = data.get('user_id')
    new_role = data.get('new_role')
    user_to_change = User.query.get(user_id)
    if not user_to_change:
        return jsonify({'message': 'Пользователь не найден'}), 404
    new_group = Group.query.filter_by(name=new_role).first()
    if not new_group:
        return jsonify({'message': 'Группа не найдена'}), 404
    user_to_change.group_id = new_group.id
    db.session.commit()
    return jsonify({'message': f'Роль пользователя {user_to_change.username} успешно изменена на {new_role}'}), 200


@app.route('/save_settings', methods=['POST'])
def save_settings():
    data = request.json
    username = session.get('username', 'default_user')
    config_path = 'settings.cfg'

    try:
        with open(config_path, 'a') as config_file:
            config_file.write(f"[Settings_{username}]\n")
            for key, value in data.items():
                safe_value = str(value).replace('%', '%%').replace('[', '').replace(']', '')
                safe_value = safe_value.strip("'")
                config_file.write(f'{key}={safe_value}\n')

        process = subprocess.Popen(['python', 'main.py'], stdin=subprocess.PIPE)
        process.communicate(input=username.encode())

        if process.returncode == 1:
            remove_user_settings(username, config_path)
            print("Данные", {username}, 'удалены')

        return jsonify({'message': 'Настройки сохранены и парсер запущен'})
    except Exception as e:
        print(f"Ошибка при сохранении файла или запуске парсера: {e}")
        return jsonify({'error': 'nu pizdec'}), 500


def remove_user_settings(username, config_path):
    """ Удаление настроек пользователя из файла конфигурации """
    new_lines = []
    with open(config_path, 'r') as file:
        lines = file.readlines()
        in_section = False
        for line in lines:
            if line.startswith(f"[Settings_{username}]"):
                in_section = True
                continue
            if in_section and line.startswith('[') and line.endswith(']\n'):
                in_section = False
            if not in_section:
                new_lines.append(line)

    with open(config_path, 'w') as file:
        file.writelines(new_lines)


@app.route('/assign-group', methods=['POST'])
def assign_group():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Требуется аутентификация'}), 401

    current_user = User.query.get(user_id)
    if not current_user or current_user.group.name != 'Разработчик':
        return jsonify({'message': 'Доступ разрешен только для разработчиков'}), 403


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('group_id', None)
    return jsonify({'message': 'Вы успешно вышли'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Group.query.count() == 0:
            db.session.add_all([
                Group(name='Разработчик'),
                Group(name='Пользователь'),
                Group(name='Посетитель')
            ])
            db.session.commit()
    app.run(debug=True)
