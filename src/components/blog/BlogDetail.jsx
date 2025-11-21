import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './BlogDetail.css';

const BlogDetail = () => {
    const [searchParams] = useSearchParams();
    const [article, setArticle] = useState(null);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const WORDPRESS_API_URL = "https://public-api.wordpress.com/rest/v1.1/sites/kahunalabs.blog/posts";

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);

                const idParam = searchParams.get("id");

                if (!idParam) {
                    setError("Missing article identifier.");
                    return;
                }

                // Fetch specific post by ID from WordPress REST API
                const postResponse = await fetch(`${WORDPRESS_API_URL}/${idParam}`);
                const postData = await postResponse.json();

                if (!postData || !postData.ID) {
                    throw new Error("Article not found");
                }

                // Map WordPress API response to our article format
                const mappedArticle = {
                    ID: postData.ID,
                    title: postData.title,
                    content: postData.content,
                    description: postData.excerpt,
                    date: postData.date,
                    pubDate: postData.date,
                    featured_image: postData.featured_image,
                    link: postData.URL,
                    author: postData.author?.name || "Team",
                    authorName: postData.author?.name || "Team",
                    categories: postData.categories || {}
                };

                // Fetch all posts for related posts section
                const allPostsResponse = await fetch(WORDPRESS_API_URL);
                const allPostsData = await allPostsResponse.json();

                if (allPostsData && Array.isArray(allPostsData.posts)) {
                    const mappedPosts = allPostsData.posts.map(post => ({
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

                    setAllPosts(mappedPosts);
                }

                setArticle(mappedArticle);
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Sorry, this article could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const readingTime = Math.ceil(wordCount / 200);
        return readingTime || 1;
    };

    const sanitizeBasic = (html) => {
        return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    };

    // Get related posts (exclude current article, get first 3)
    const getRelatedPosts = () => {
        if (!article || !allPosts.length) return [];
        const currentId = article.ID;
        return allPosts
            .filter(post => post.ID !== currentId)
            .slice(0, 3);
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="blog-detail-container">
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
                <div className="blog-detail-container">
                    <div className="error-message">
                        <h2>Article Not Found</h2>
                        <p>{error}</p>
                        <Link to="/blog" className="back-link">
                            ← Back to Blogs
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!article) {
        return (
            <>
                <Header />
                <div className="blog-detail-container">
                    <div className="error-message">
                        <h2>Article Not Found</h2>
                        <p>The requested article could not be found.</p>
                        <Link to="/blog" className="back-link">
                            ← Back to Blogs
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Use content from WordPress API (already HTML)
    const contentHtml = sanitizeBasic(article.content || "");
    const category = getCategory(article);
    const readingTime = calculateReadingTime(article.content || article.description);
    const description = stripHtml(article.description || article.content).split(/\s+/).slice(0, 30).join(" ") + "...";
    const relatedPosts = getRelatedPosts();

    return (
        <>
            <Header />
            <div className="blog-detail-container">
                {/* Background Gradient Divs */}
                {/* <div className="gradient-bg-top"></div> */}
                <div className="gradient-bg-bottom"></div>
                
                <div className="article-wrap">
                    {/* Back Link */}
                    <Link to="/blog" className="blog-back-link">
                        <img src="/arrow left icon.png" alt="Back" className="back-arrow-icon" width="16" height="16" />
                        <span>Back</span>
                    </Link>

                    {/* Category Tag */}
                    {/* <span className="post-category-tag">{category}</span> */}

                    {/* Title */}
                    {/* <h1 className="post-title">{article.title}</h1> */}
                    <h1 className="post-title">{decodeHtmlEntities(article.title)}</h1>

                    {/* Description */}
                    {/* <p className="post-description">{description}</p> */}
                    {/* <p className="post-description">{decodeHtmlEntities(description)}</p> */}

                    {/* Meta Information */}
                    <div className="post-meta">
                        <div className="meta-item">
                            <img src="/icon.svg" alt="Calendar" className="meta-icon" width="16" height="16" />
                            <span>{formatDate(article.date || article.pubDate)}</span>
                        </div>
                        {/* <span className="meta-separator">•</span>
                        <div className="meta-item">
                            <img src="/clock icon.svg" alt="Clock" className="meta-icon" width="16" height="16" />
                            <span>{readingTime} min read</span>
                        </div>
                        <span className="meta-separator">•</span>
                        <div className="meta-item">
                            <img src="/icon (1).svg" alt="Profile" className="meta-icon" width="16" height="16" />
                            <span>{article.author || article.authorName || "Team"}</span>
                        </div> */}
                    </div>

                    {article.featured_image && (
                        <img 
                           id="post-image" 
                           src={article.featured_image} 
                           // alt={article.title}
                           alt={decodeHtmlEntities(article.title)}
                           className="post-thumbnail"
                        />
                    )}

                    {/* Article Content */}
                    <div
                        className="post-content"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                </div>

                {/* Related Blogs Section */}
                {relatedPosts.length > 0 && (
                    <section className="related-blogs-section">
                        <h2 className="related-blogs-title">Related Blogs</h2>
                        <div className="related-blogs-carousel">
                            {relatedPosts.map((relatedPost, index) => {
                                const excerpt = stripHtml(relatedPost.description || relatedPost.content)
                                    .split(/\s+/)
                                    .slice(0, 25)
                                    .join(" ") + "...";
                                const img = getThumbnail(relatedPost);
                                const postId = relatedPost.ID;
                                const readingTime = calculateReadingTime(relatedPost.content || relatedPost.description);
                                const category = getCategory(relatedPost);

                                return (
                                    <Link
                                        key={index}
                                        className="related-blog-card"
                                        to={`/blog-detail?id=${postId}`}
                                    >
                                        <div className="related-blog-image-wrapper">
                                            <img
                                                src={img || "/blog-thumbnail.png"}
                                                alt={relatedPost.title}
                                                className="related-blog-image"
                                                onError={(e) => {
                                                    e.target.src = "/blog-thumbnail.png";
                                                }}
                                            />
                                            {/* <span className="related-blog-category">{category}</span> */}
                                        </div>
                                        <div className="related-blog-content">
                                            {/* <h3 className="related-blog-title">{relatedPost.title}</h3> */}
                                            <h3 className="related-blog-title">{decodeHtmlEntities(relatedPost.title)}</h3>
                                            {/* <p className="related-blog-excerpt">{excerpt}</p> */}
                                            <p className="related-blog-excerpt">{decodeHtmlEntities(excerpt)}</p>
                                            <div className="related-blog-meta">
                                                <div className="related-meta-item">
                                                    <img src="/icon.svg" alt="Calendar" className="related-meta-icon" width="16" height="16" />
                                                    <span>{formatDate(relatedPost.date || relatedPost.pubDate)}</span>
                                                </div>
                                                {/* <span className="related-meta-separator">•</span>
                                                <div className="related-meta-item">
                                                    <img src="/clock icon.svg" alt="Clock" className="related-meta-icon" width="16" height="16" />
                                                    <span>{readingTime} min read</span>
                                                </div>
                                                <span className="related-meta-separator">•</span>
                                                <div className="related-meta-item">
                                                    <img src="/icon (1).svg" alt="Profile" className="related-meta-icon" width="16" height="16" />
                                                    <span>{relatedPost.author || relatedPost.authorName || "Team"}</span>
                                                </div> */}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </>
    );
};

export default BlogDetail;
