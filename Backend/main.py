from crypt import methods
from enum import unique
import json
#from subprocess import call
import os
from pydoc_data.topics import topics
from flask import Flask, jsonify, request
from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt

from youtubeAPI import call_videos
from redditPull import call_reddit
from googlePull import call_google

## SET ENV VARIABLES ##
#export GOOGLE_API_KEY="AIzaSyBo2Z5qACZXPvOp0guTyZZ5E5cEqBTUzFo"

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db' ## Use Postgres after set up
app.config['SQLALCHEMY_TRACK_NOTIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'secretkey'  # change to strong after working

#Initialization
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# USER MODEL DB
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    topics = db.Column(db.String(50), nullable=False) ## Storing as Json, if null then default to entrepuener

# CREATE DB  
with app.app_context():
    db.create_all()


# USER REGISTRATION
@app.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    topics = data.get('topics', 'entrepreneurship')

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, username=username, password=hashed_password, topics=topics)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User Registered Successfully"}), 201

# USER LOGIN 
@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid Credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({"access token": access_token, "topics": user.topics}), 200 


# Update Topic Endpoint
@app.route("/update_topic", methods=['POST'])
@jwt_required()
def update_topic():
    current_user = get_jwt_identity()
    data = request.get_json()
    new_topic = data.get('topic', 'entrepreneurship')

    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    user.topics = new_topic
    db.session.commit()
    return jsonify({"message": "Topic updated successfully", "topics": new_topic}), 200


# Protected Route: YouTube Feed
@app.route("/api/videos", methods=['GET'])
@jwt_required()
def youtube_feed():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    topics = user.topics if user else 'entrepreneurship'
    key = os.getenv("GOOGLE_API_KEY")
    
    videos = call_videos(topics, 10, key )
    
    return jsonify({'videos': videos})


# Protected Route: Reddit Feed
@app.route("/api/reddit", methods=['GET'])
@jwt_required()
def reddit_feed():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    topics = user.topics if user else 'entrepreneurship'
    
    posts = call_reddit(topics)
    
    return jsonify(posts)


# Protected Route: Google Feed
@app.route("/api/links", methods=['GET'])
@jwt_required()
def google_feed():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    topics = user.topics if user else 'entrepreneurship'
    
    key = os.getenv("GOOGLE_API_KEY")

    links = call_google(topics, key)
    
    return jsonify(links)

if __name__ == '__main__':
    app.run(debug=True)
