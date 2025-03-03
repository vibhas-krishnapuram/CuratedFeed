from crypt import methods
import json
from flask import Flask, jsonify, session, request, redirect, url_for, render_template, send_from_directory
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
app.config['SECRET_KEY'] = "12345"
app.config["JWT_SECRET_KEY"] = '67890'
app.config["JWT_TOKEN_LOCATION"] = ['headers']


#Initializations of db and jwt token
db = SQLAlchemy(app)

jwt = JWTManager(app)

bcrypt = Bcrypt(app)

# USER MODEL FOR DB
class User(db.Model):

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean(), default=True)
    #cart = db.Column(JSON, nullable=True, default=list)  

    def __repr__(self) -> str:
        return f'<User {self.username}>'


@app.route('/home')
def serve_login_page():
    return render_template('index.html')

@app.route('/jwt')
def serve_jwt_page():
    return render_template('jwt.html')

##LOGIN Page
@app.route('/login-page')
def login_page():
    return render_template('login.html')  # Serves the HTML page

#ACTUAL register page
@app.route('/register-page')
def register_page():
    return render_template('register.html')

## REGISTERING user function
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'Username already taken'}), 400
    

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": 'User added successfully'}), 201

#LOGIN user function
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print("Recieved Data", username, password)

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({'message': 'Login Success', 'access_token': access_token})
    else:
        return jsonify({"message": 'Error to Login'}), 401




@app.route('/jwt', methods=['GET'])
@jwt_required() # specifies jwt needed for this page
def get_name():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if user: # checks if it is there
        return jsonify({'message':'User found', 'name': user.username})
    else:
        return jsonify({'message': 'User not found'}), 404 


if __name__ == '__main__':
    app.run(debug=True)