import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './Header';
import Footer from './Footer';
import './BlogListing.css';

const BlogListing = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [navigating, setNavigating] = useState(false);

    const WORDPRESS_API_URL = "https://public-api.wordpress.com/rest/v1.1/sites/kahunalabs.blog/posts";

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);

                // Fetch posts from WordPress REST API
                const response = await fetch(WORDPRESS_API_URL);
                const data = await response.json();

                if (!data || !Array.isArray(data.posts)) {
                    console.warn("Invalid API response or no posts array");
                    setError("Sorry, articles could not be loaded right now.");
                    return;
                }

                // Map WordPress API response to our post format
                const mappedPosts = data.posts.map(post => ({
                    ID: post.ID,
                    title: post.title,
                    content: post.content,
                    description: post.excerpt,
                    date: post.date,
                    pubDate: post.date,
                    featured_image: post.featured_image,
                    link: post.URL,
                    author: post.author?.name || "Team",
                    authorName: post.author?.name || "Team",
                    categories: post.categories || {}
                }));

                // Sort by date (newest first)
                mappedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

                setPosts(mappedPosts);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Sorry, articles could not be loaded right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return (div.textContent || div.innerText || "").trim();
    };

    const decodeHtmlEntities = (text) => {
        if (!text) return '';
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
    };


    const getThumbnail = (post) => {
        // Use featured_image from WordPress API if available
        if (post.featured_image) {
            return post.featured_image;
        }
        // Fallback to default image
        return null;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const calculateReadingTime = (content) => {
        const text = stripHtml(content || '');
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
        return readingTime || 1;
    };

    const getCategory = (post) => {
        let category = "Agentic AI";
        if (post.categories) {
            // WordPress REST API returns categories as an object where values are category objects
            // Each category object has properties: {ID, name, slug, description, post_count, parent, meta}
            if (Array.isArray(post.categories) && post.categories.length > 0) {
                // If it's an array, check if items are objects or strings
                const firstCategory = post.categories[0];
                category = typeof firstCategory === 'string' ? firstCategory : (firstCategory?.name || "Agentic AI");
            } else if (typeof post.categories === 'object' && post.categories !== null) {
                // If it's an object, get the first category object and extract its name
                const categoryObjects = Object.values(post.categories);
                if (categoryObjects.length > 0) {
                    const firstCategoryObj = categoryObjects[0];
                    category = firstCategoryObj?.name || "Agentic AI";
                }
            }
            // Replace "Uncategorized" (case-insensitive) with "Agentic AI"
            if (typeof category === 'string' && category.toLowerCase() === "uncategorized") {
                category = "Agentic AI";
            }
        }
        return category;
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="blog-listing-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
                {/* <Footer /> */}
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="blog-listing-container">
                    <div className="blog-header">
                        <h1>Blogs</h1>
                        <p>Latest insights and articles from our team</p>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Get featured post (first post only)
    const featuredPost = posts.length > 0 ? posts[0] : null;
    // Get all posts (including the featured post)
    const allPosts = [...posts];

    return (
        <>
            <Header />
            <div className="blog-listing-container">
                {/* Background Gradient Divs */}
                {/* <div className="gradient-bg-top"></div> */}
                <div className="gradient-bg-bottom"></div>
                
                {/* Header Section */}
                {/* <div className="insights-header">
                    <h1 className="insights-title">Insights and Updates</h1>
                    <p className="insights-description">
                        Welcome to the official blog of Kahuna Labs. Here, we share our technical deep dives, architectural insights, and the engineering principles that power our Troubleshooting Map.
                    </p>
                </div> */}

                {/* Featured Post Section */}
                {featuredPost && (
                    <section className="featured-posts-section">
                        <h2 className="featured-posts-title">Featured Post</h2>
                        <div className="featured-posts-grid">
                            {(() => {
                                const excerpt = stripHtml(featuredPost.description || featuredPost.content)
                                    .split(/\s+/)
                                    .slice(0, 20)
                                    .join(" ") + "...";
                                const img = getThumbnail(featuredPost);
                                const postId = featuredPost.ID;
                                const readingTime = calculateReadingTime(featuredPost.content || featuredPost.description);
                                const category = getCategory(featuredPost);

                                return (
                                    <Link
                                        className="featured-post-card"
                                        to={`/blog-detail?id=${postId}`}
                                    >
                                        <div className="featured-post-image-wrapper">
                                            <img
                                                src={img || "/blog-thumbnail.png"}
                                                // alt={featuredPost.title}
                                                alt={decodeHtmlEntities(featuredPost.title)}
                                                className="featured-post-image"
                                                onError={(e) => {
                                                    e.target.src = "/blog-thumbnail.png";
                                                }}
                                                onLoad={(e) => {
                                                    // Check if image is too small (likely a placeholder)
                                                    // or if it's a known placeholder pattern
                                                    const imgElement = e.target;
                                                    if (imgElement.naturalWidth < 100 || imgElement.naturalHeight < 100) {
                                                        imgElement.src = "/blog-thumbnail.png";
                                                    }
                                                }}
                                            />
                                            {/* <span className="featured-post-category">{category}</span> */}
                                        </div>
                                        <div className="featured-post-content-wrapper">
                                            {/* <h3 className="featured-post-card-title">{featuredPost.title}</h3> */}
                                            {/* <p className="featured-post-card-description">{excerpt}</p> */}
                                            <h3 className="featured-post-card-title">{decodeHtmlEntities(featuredPost.title)}</h3>
                                            <p className="featured-post-card-description">{decodeHtmlEntities(excerpt)}</p>
                                            <div className="featured-post-card-meta">
                                                <div className="meta-row">
                                                    <div className="meta-item">
                                                        <img src="/icon.svg" alt="Calendar" className="meta-icon" width="16" height="16" />
                                                        <span>{formatDate(featuredPost.date || featuredPost.pubDate)}</span>
                                                    </div>
                                                    {/* <span className="meta-separator">•</span>
                                                    <div className="meta-item">
                                                        <img src="/clock icon.svg" alt="Clock" className="meta-icon" width="16" height="16" />
                                                        <span>{readingTime} min read</span>
                                                    </div>
                                                    <span className="meta-separator">•</span>
                                                    <div className="meta-item">
                                                        <img src="/icon (1).svg" alt="Profile" className="meta-icon" width="16" height="16" />
                                                        <span>{featuredPost.author || featuredPost.authorName || "Team"}</span>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })()}
                        </div>
                    </section>
                )}

                {/* Separator Line */}
                <div className="blog-section-separator blog-section-separator--compact"></div>

                {allPosts.length > 0 && (
                    <>
                        {/* Blog Posts Section */}
                        <section className="blog-library-section">
                            <h2 className="all-posts-title">All Posts</h2>

                            <div className="all-posts-grid">
                                {allPosts.map((article, index) => {
                                        const excerpt = stripHtml(article.description || article.content)
                                            .split(/\s+/)
                                            .slice(0, 25)
                                            .join(" ") + "...";

                                        const img = getThumbnail(article);
                                        const postId = article.ID;
                                        const readingTime = calculateReadingTime(article.content || article.description);
                                        const category = getCategory(article);

                                        return (
                                            <Link
                                                key={index}
                                                className="all-posts-card"
                                                to={`/blog-detail?id=${postId}`}
                                            >
                                                <div className="all-posts-card-image-wrapper">
                                                    <img
                                                        src={img || "/blog-thumbnail.png"}
                                                        // alt={article.title}
                                                        alt={decodeHtmlEntities(article.title)}
                                                        className="all-posts-card-image"
                                                        onError={(e) => {
                                                            e.target.src = "/blog-thumbnail.png";
                                                        }}
                                                        onLoad={(e) => {
                                                            // Check if image is too small (likely a placeholder)
                                                            const imgElement = e.target;
                                                            if (imgElement.naturalWidth < 100 || imgElement.naturalHeight < 100) {
                                                                imgElement.src = "/blog-thumbnail.png";
                                                            }
                                                        }}
                                                    />
                                                    {/* <span className="all-posts-card-category">{category}</span> */}
                                                </div>
                                                <div className="all-posts-card-content">
                                                <h3 className="all-posts-card-title">{decodeHtmlEntities(article.title)}</h3>
                                                <p className="all-posts-card-excerpt">{decodeHtmlEntities(excerpt)}</p>
                                                    {/* <h3 className="all-posts-card-title">{article.title}</h3> */}
                                                    {/* <p className="all-posts-card-excerpt">{excerpt}</p> */}
                                                    <div className="all-posts-card-meta">
                                                        <div className="all-posts-meta-item">
                                                            <img src="/icon.svg" alt="Calendar" className="all-posts-meta-icon" width="16" height="16" />
                                                            <span>{formatDate(article.date || article.pubDate)}</span>
                                                        </div>
                                                        {/* <span className="all-posts-meta-separator">•</span>
                                                        <div className="all-posts-meta-item">
                                                            <img src="/clock icon.svg" alt="Clock" className="all-posts-meta-icon" width="16" height="16" />
                                                            <span>{readingTime} min read</span>
                                                        </div>
                                                        <span className="all-posts-meta-separator">•</span>
                                                        <div className="all-posts-meta-item">
                                                            <img src="/icon (1).svg" alt="Profile" className="all-posts-meta-icon" width="16" height="16" />
                                                            <span>{article.author || article.authorName || "Team"}</span>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                        </section>
                    </>
                )}

                {/* Separator Line */}
                <div className="blog-section-separator"></div>

                {/* Promotional Section */}
                <section className="blog-promotional-section">
                    <div className="promotional-background">
                        <img src="/image2.png" alt="Background" className="promotional-bg-image" />
                        <div className="promotional-overlay"></div>
                    </div>
                    <div className="promotional-content">
                        <div className="promotional-text-container">
                            <p className="promotional-subtitle">Evaluate Our Core Offering</p>
                            <h2 className="promotional-title">
                                <span className="promotional-title-line1">Explore Kahuna AI</span>
                                {/* <span className="promotional-title-line2">AI Troubleshooting Map</span> */}
                            </h2>
                            <button 
                            className="promotional-cta-button"
                            onClick={() => {
                                // Store navigation intent in sessionStorage
                                // The loader will be shown in FrameSequence component
                                sessionStorage.setItem('navigatingToFrame71', 'true');
                                sessionStorage.setItem('targetFrame', '71');
                                
                                // Navigate to home page
                                navigate('/');
                            }}
                            >
                               Take me there <img src="/arrow right icon.svg" alt="Arrow" style={{ width: '14px', height: '14px', marginLeft: '4px' }} />
                            </button>
                        </div>
                        
                        {/* Navigation Loader Overlay */}
                        {navigating && (
                            <div 
                                className="navigation-loader-overlay"
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    backgroundColor: 'rgba(0, 0, 0, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 999,
                                    transition: 'opacity 0.3s ease'
                                }}
                            >
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default BlogListing;
