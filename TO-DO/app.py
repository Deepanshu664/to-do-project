from flask import Flask, render_template, redirect, request, url_for
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import os
from flask import jsonify
app = Flask(__name__)
app.secret_key = 'secret-key'

# MongoDB setup
client = MongoClient("mongodb+srv://deepanshuprajapati664:Deepanshu_DB143@cluster1.1dukilk.mongodb.net/")
mongo_db = client['todo_db']
users_collection = mongo_db['users']
todos_collection = mongo_db['todos']

# Login manager setup
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# Custom User class
class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.email = user_data['email']
        self.username = user_data.get('username', '')  # ✅


@login_manager.user_loader
def load_user(user_id):
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(user_data)
    return None


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        # Check if email already exists
        if users_collection.find_one({'email': email}):
            return 'Email already registered!'

        # You can also optionally check if the username already exists
        if users_collection.find_one({'username': username}):
            return 'Username already taken!'

        hashed_pw = generate_password_hash(password)
        users_collection.insert_one({
            'username': username,
            'email': email,
            'password': hashed_pw
        })

        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user_data = users_collection.find_one({'email': email})
        if user_data and check_password_hash(user_data['password'], password):
            user = User(user_data)
            login_user(user)
            return redirect(url_for('todo'))

        return 'Invalid credentials'

    return render_template('login.html')

@app.route('/todo', methods=['GET', 'POST'])
@login_required
def todo():
    if request.method == 'POST':
        content = request.form['content']
        todos_collection.insert_one({
            'user_id': current_user.id,
            'content': content,
            'completed': False
        })

    todos = list(todos_collection.find({'user_id': current_user.id}))
    return render_template('todo.html', todos=todos)

from bson.objectid import ObjectId

#complete task route
@app.route('/toggle-complete/<task_id>', methods=['POST'])
@login_required
def toggle_complete(task_id):
    task = todos_collection.find_one({'_id': ObjectId(task_id), 'user_id': current_user.id})
    if task:
        todos_collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'completed': not task.get('completed', False)}}
        )
    return jsonify({'status': 'success'})

#Add task route
@app.route('/add-task', methods=['POST'])
@login_required
def add_task():
    data = request.get_json()
    content = data.get('content')
    if content:
        result = todos_collection.insert_one({
            'user_id': current_user.id,
            'content': content,
            'completed': False
        })
        return jsonify({
            'status': 'success',
            'id': str(result.inserted_id),
            'content': content
        })
    return jsonify({'status': 'error'}), 400


#Edit task route
@app.route('/edit-task/<task_id>', methods=['POST'])
@login_required
def edit_task(task_id):
    data = request.get_json()
    new_content = data.get('content')
    if new_content:
        todos_collection.update_one(
            {'_id': ObjectId(task_id), 'user_id': current_user.id},
            {'$set': {'content': new_content}}
        )
    return jsonify({'status': 'success'})

#Delete task route 
@app.route('/delete/<task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    todos_collection.delete_one({
        '_id': ObjectId(task_id),
        'user_id': current_user.id
    })
    return jsonify({'status': 'deleted'})  # ✅ return JSON instead of redirect
 # or wherever your task list is

#Clear all task route
@app.route('/clear-all', methods=['POST'])
@login_required
def clear_all():
    todos_collection.delete_many({'user_id': current_user.id})
    return jsonify({'status': 'cleared'})


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))



@app.route('/get-tasks')
@login_required
def get_tasks():
    tasks = todos_collection.find({'user_id': current_user.id})
    return jsonify([
        {
            'id': str(task['_id']),
            'content': task['content'],
            'completed': task.get('completed', False)
        }
        for task in tasks
    ])



if __name__ == '__main__':
    app.run(debug=True)
