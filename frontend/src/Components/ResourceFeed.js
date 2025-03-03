import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGoogleLinks, fetchRedditPosts, fetchYoutubeVideos, updateTopic } from "./api";
import "./CSS/ResourceFeed.css"; 

const ResourceFeed = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topic, setTopic] = useState(localStorage.getItem('topics') || 'entrepreneurship');
    const [isChangingTopic, setIsChangingTopic] = useState(false);
    const navigate = useNavigate();
    
    // Available topics for selection
    const topicOptions = [
        'entrepreneurship',
        'startups',
        'business',
        'technology',
        'marketing',
        'finance',
        'design',
        'development'
    ];

    const truncateTitle = (title, wordLimit = 8) => {
        const words = title.split(" ");
        return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : title;
    };

    const fetchResources = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            // Fetch from all three sources
            const [videoData, redditData, linkData] = await Promise.all([
                fetchYoutubeVideos(),
                fetchRedditPosts(),
                fetchGoogleLinks()
            ]);
        
            const formattedVideos = videoData.map((video) => ({
                ...video,
                type: "video",
                size: Math.random() > 0.5 ? "large" : "medium"
            }));

            const formattedReddit = redditData.map((post) => ({
                ...post,
                type: "reddit",
                size: Math.random() > 0.7 ? "large" : "small"
            }));

            const formattedLinks = linkData.map((link) => ({
                ...link,
                type: "google",
                size: Math.random() > 0.8 ? "medium" : "small"
            }));

            // Combine and randomize all resources
            let allResources = [...formattedVideos, ...formattedReddit, ...formattedLinks];
            allResources = allResources.sort(() => Math.random() - 0.5);

            setResources(allResources);
        } catch (error) {
            console.error("Error fetching resources:", error);
            setError("Failed to load resources. Please try again later.");
            
            // If unauthorized, redirect to login
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTopicChange = async (e) => {
        const newTopic = e.target.value;
        setTopic(newTopic);
        setIsChangingTopic(true);
        
        try {
            await updateTopic(newTopic);
            // Refetch resources with new topic
            fetchResources();
        } catch (error) {
            console.error("Error updating topic:", error);
            setError("Failed to update topic. Please try again.");
        } finally {
            setIsChangingTopic(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('topics');
        navigate('/login');
    };

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <div className="resource-container">
            <div className="feed-header">
                <h1 className="feed-title">Your Feed</h1>
                <div className="feed-controls">
                    <div className="topic-selector">
                        <label htmlFor="topic-select">Topic:</label>
                        <select
                            id="topic-select"
                            value={topic}
                            onChange={handleTopicChange}
                            disabled={isChangingTopic}
                        >
                            {topicOptions.map(option => (
                                <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </select>
                        {isChangingTopic && <span className="updating-indicator">Updating...</span>}
                    </div>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading-container">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="resource-grid">
                    {resources.length === 0 ? (
                        <div className="no-resources">
                            <p>No resources found for this topic. Try selecting a different topic.</p>
                        </div>
                    ) : (
                        resources.map((resource, index) => (
                            <a
                                href={resource.url}
                                key={`${resource.type}-${index}`}
                                className={`resource-card ${resource.type}-card ${resource.size}-card`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {resource.type === "video" && (
                                    <div className="video-content">
                                        <div className="thumbnail-container">
                                            <img
                                                src={resource.thumbnail}
                                                alt={resource.title}
                                                className="video-thumbnail"
                                            />
                                            <div className="video-badge">YouTube</div>
                                        </div>
                                        <div className="resource-content">
                                            <h3 className="resource-title">
                                                {truncateTitle(resource.title, 10)}
                                            </h3>
                                        </div>
                                    </div>
                                )}

                                {resource.type === "reddit" && (
                                    <div className="reddit-content">
                                        <div className="source-badge">
                                            <span className="reddit-icon">Reddit</span>
                                        </div>
                                        <h3 className="resource-title">
                                            {truncateTitle(resource.title, resource.size === "small" ? 8 : 12)}
                                        </h3>
                                        <div className="reddit-meta">
                                            <span className="subreddit">
                                                r/{resource.subreddit || "subreddit"}
                                            </span>
                                            <span className="upvotes">
                                                {resource.upvotes || "---"} upvotes
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {resource.type === "google" && (
                                    <div className="google-content">
                                        <div className="source-badge">
                                            <span className="google-icon">Google</span>
                                        </div>
                                        <h3 className="resource-title">
                                            {truncateTitle(resource.title, resource.size === "small" ? 8 : 12)}
                                        </h3>
                                        <div className="url-preview">
                                            {resource.url?.replace(/^https?:\/\//, "").split("/")[0]}
                                        </div>
                                    </div>
                                )}
                            </a>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ResourceFeed;