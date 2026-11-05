import React, { useState, useEffect } from 'react';
import { communityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import {
  Users,
  MessageSquare,
  Heart,
  PlusCircle,
  Search,
  Pin,
  Send,
  User,
  MapPin,
  CheckCircle2,
  Trash2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'General Farming',
  'Crop',
  'Soil',
  'Pest',
  'Weather',
  'Market'
];

const CommunityPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General Farming');
  const [posting, setPosting] = useState(false);

  // Active Selected Post for Comments thread
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        query: searchQuery.trim() || undefined,
        limit: 30,
      };
      const res = await communityAPI.getPosts(params);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setPosting(true);
    try {
      await communityAPI.createPost({
        title: newTitle,
        content: newContent,
        category: newCategory,
      });
      setIsPostModalOpen(false);
      setNewTitle('');
      setNewContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!isAuthenticated) return;
    try {
      const res = await communityAPI.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, has_liked: res.data.liked, likes_count: res.data.likes_count }
            : p
        )
      );
      if (activePost && activePost.id === postId) {
        setActivePost((prev) => ({
          ...prev,
          has_liked: res.data.liked,
          likes_count: res.data.likes_count,
        }));
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleOpenComments = async (post) => {
    try {
      const res = await communityAPI.getPost(post.id);
      setActivePost(res.data);
    } catch (err) {
      console.error('Failed to fetch post detail:', err);
      setActivePost(post);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activePost) return;

    setCommenting(true);
    try {
      const res = await communityAPI.addComment(activePost.id, { content: commentText });
      setActivePost((prev) => ({
        ...prev,
        comments_count: prev.comments_count + 1,
        comments: [...prev.comments, res.data],
      }));
      setCommentText('');
      // update list
      setPosts((prev) =>
        prev.map((p) => (p.id === activePost.id ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to remove this discussion post?')) return;
    try {
      await communityAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (activePost?.id === postId) setActivePost(null);
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Users size={15} />
            <span>Peer-to-Peer Agronomy Exchange</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Farmer Community Forum
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Ask questions, share field experiences, discuss crop rotations, and exchange pest solutions with other farmers.
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={18} />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontFamily: 'inherit',
                fontSize: '0.84rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '9999px',
                border: selectedCategory === cat ? '1px solid var(--primary-700)' : '1px solid var(--border-light)',
                backgroundColor: selectedCategory === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
      </div>

      {/* Forum Stream */}
      {loading ? (
        <LoadingSpinner message="Loading farmer community discussions..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No Discussions Found"
          description="Be the first farmer to ask a question or share field insights in this category."
          actionLabel="Create First Post"
          onAction={() => setIsPostModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((p) => (
            <div
              key={p.id}
              className="card card-hover"
              style={{
                borderLeft: p.is_pinned ? '4px solid #f59e0b' : '1px solid var(--border-light)',
              }}
            >
              {/* Post Header: Author & Category */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {p.author?.name ? p.author.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {p.author?.name || 'Farmer'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.author?.district ? `${p.author.district}, ${p.author.state}` : 'Kerala'} • {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.is_pinned && (
                    <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Pin size={12} />
                      <span>Pinned</span>
                    </span>
                  )}
                  <span className="badge badge-gray">{p.category}</span>
                  {(user?.id === p.user_id || isAdmin) && (
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Content */}
              <h3
                onClick={() => handleOpenComments(p)}
                style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', cursor: 'pointer' }}
              >
                {p.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {p.content}
              </p>

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => handleToggleLike(p.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: p.has_liked ? '#dc2626' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  <Heart size={18} fill={p.has_liked ? '#dc2626' : 'none'} />
                  <span>{p.likes_count} Likes</span>
                </button>

                <button
                  onClick={() => handleOpenComments(p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{p.comments_count} Comments</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="Create Community Discussion">
        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label className="form-label">Discussion Title / Question</label>
            <input
              type="text"
              required
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Best organic spray for cardamom thrips in Idukki?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Topic Category</label>
            <select
              className="form-select"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option value="General Farming">General Farming</option>
              <option value="Crop">Crop Selection & Rotation</option>
              <option value="Soil">Soil Health & Nutrients</option>
              <option value="Pest">Pests & Diseases</option>
              <option value="Weather">Weather & Monsoon</option>
              <option value="Market">Market & Prices</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Field Notes</label>
            <textarea
              required
              rows={5}
              className="form-textarea"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide background context, soil details, or symptoms..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsPostModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={posting || !newTitle.trim() || !newContent.trim()} className="btn btn-primary">
              <span>{posting ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Comments Thread Modal */}
      <Modal
        isOpen={Boolean(activePost)}
        onClose={() => setActivePost(null)}
        title={activePost ? `Discussion: ${activePost.title}` : 'Comments'}
        maxWidth="700px"
      >
        {activePost && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Post Details */}
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-gray">{activePost.category}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  By {activePost.author?.name || 'Farmer'} ({activePost.author?.district || 'Kerala'})
                </span>
              </div>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {activePost.content}
              </p>
            </div>

            {/* Comments List */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Replies & Advice ({activePost.comments?.length || 0})
              </h4>

              {activePost.comments?.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                  No responses yet. Share your experience below!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activePost.comments?.map((c) => (
                    <div key={c.id} style={{ padding: '12px 14px', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                          {c.author?.name || 'Farmer'} {c.author?.role === 'Agricultural Professional' && '⭐ (Expert)'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your advice or answer..."
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={commenting || !commentText.trim()} className="btn btn-primary">
                <Send size={16} />
                <span>Reply</span>
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommunityPage;
