import {useState, useEffect} from "react";
import {useTheme} from "../hooks/useTheme";
import {useAuth} from "../hooks/useAuth";
import {announcementAPI} from "../services/api";
import {LoadingSpinner, Alert} from "../components/shared";

const AnnouncementStream = ({classId, isTeacher}) => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const isDark = theme === "dark";

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "announcement",
  });
  const [isPosting, setIsPosting] = useState(false);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchStream();
  }, [classId]);

  const fetchStream = async () => {
    try {
      setIsLoading(true);
      const response = await announcementAPI.getClassStream(classId);
      setAnnouncements(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load stream");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      setIsPosting(true);
      await announcementAPI.postAnnouncement({
        classId,
        ...newPost,
      });
      setNewPost({title: "", content: "", type: "announcement"});
      setShowPostForm(false);
      fetchStream();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleComment = async (announcementId) => {
    const content = commentText[announcementId];
    if (!content?.trim()) return;

    try {
      await announcementAPI.addComment(announcementId, content);
      setCommentText((prev) => ({...prev, [announcementId]: ""}));
      fetchStream();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add comment");
    }
  };

  const handleDelete = async (announcementId) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await announcementAPI.deleteAnnouncement(announcementId);
      fetchStream();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      await announcementAPI.togglePin(announcementId);
      fetchStream();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to toggle pin");
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    const icons = {
      announcement: "📢",
      assignment: "📋",
      quiz: "📝",
      meeting: "📹",
      material: "📁",
    };
    return icons[type] || "📢";
  };

  const getTypeColor = (type) => {
    const colors = {
      announcement: "blue",
      assignment: "purple",
      quiz: "green",
      meeting: "orange",
      material: "gray",
    };
    return colors[type] || "blue";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Post Form for Teachers */}
      {isTeacher && (
        <div
          className={`rounded-xl border mb-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          {!showPostForm ? (
            <button
              onClick={() => setShowPostForm(true)}
              className={`w-full p-4 text-left flex items-center gap-3 ${
                isDark
                  ? "text-muted-foreground hover:bg-accent"
                  : "text-gray-500 hover:bg-gray-50"
              } rounded-xl transition-colors`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">
                  {user?.name?.charAt(0) || "T"}
                </span>
              </div>
              <span>Announce something to your class...</span>
            </button>
          ) : (
            <form onSubmit={handlePost} className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm">
                    {user?.name?.charAt(0) || "T"}
                  </span>
                </div>
                <select
                  value={newPost.type}
                  onChange={(e) =>
                    setNewPost((prev) => ({...prev, type: e.target.value}))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    isDark
                      ? "bg-secondary border-border text-foreground"
                      : "bg-gray-100 border-gray-200 text-gray-900"
                  } border`}
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="material">📁 Material</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Title (optional)"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((prev) => ({...prev, title: e.target.value}))
                }
                className={`w-full px-4 py-2 rounded-lg mb-3 ${
                  isDark
                    ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <textarea
                placeholder="Share with your class..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost((prev) => ({...prev, content: e.target.value}))
                }
                rows={3}
                className={`w-full px-4 py-2 rounded-lg resize-none ${
                  isDark
                    ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false);
                    setNewPost({title: "", content: "", type: "announcement"});
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isDark
                      ? "text-muted-foreground hover:bg-accent"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPost.content.trim() || isPosting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div
            className={`text-center py-12 rounded-xl border ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <span className="text-4xl mb-4 block">📢</span>
            <p
              className={`${
                isDark ? "text-muted-foreground" : "text-gray-500"
              }`}
            >
              No announcements yet
            </p>
            {isTeacher && (
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-muted-foreground" : "text-gray-400"
                }`}
              >
                Post something to get started!
              </p>
            )}
          </div>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement._id}
              announcement={announcement}
              isDark={isDark}
              isTeacher={isTeacher}
              currentUserId={user?.id}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onComment={handleComment}
              commentText={commentText[announcement._id] || ""}
              setCommentText={(text) =>
                setCommentText((prev) => ({
                  ...prev,
                  [announcement._id]: text,
                }))
              }
              formatDate={formatDate}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

const AnnouncementCard = ({
  announcement,
  isDark,
  isTeacher,
  onDelete,
  onTogglePin,
  onComment,
  commentText,
  setCommentText,
  formatDate,
  getTypeIcon,
  getTypeColor,
}) => {
  const [showComments, setShowComments] = useState(false);
  const color = getTypeColor(announcement.type);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDark ? "bg-card border-border" : "bg-white border-gray-200"
      } ${announcement.isPinned ? "ring-2 ring-yellow-500" : ""}`}
    >
      {/* Type indicator bar */}
      <div
        className={`h-1 bg-${color}-500`}
        style={{
          backgroundColor:
            color === "blue"
              ? "#3b82f6"
              : color === "purple"
              ? "#a855f7"
              : color === "green"
              ? "#22c55e"
              : color === "orange"
              ? "#f97316"
              : "#6b7280",
        }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm">
                {announcement.teacherId?.name?.charAt(0) || "T"}
              </span>
            </div>
            <div>
              <p
                className={`font-medium ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                {announcement.teacherId?.name || "Teacher"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getTypeIcon(announcement.type)}
                </span>
                <span
                  className={`text-sm ${
                    isDark ? "text-muted-foreground" : "text-gray-500"
                  }`}
                >
                  {formatDate(announcement.createdAt)}
                </span>
                {announcement.isPinned && (
                  <span className="text-yellow-500 text-sm">📌 Pinned</span>
                )}
              </div>
            </div>
          </div>

          {isTeacher && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTogglePin(announcement._id)}
                className={`p-2 rounded-lg ${
                  isDark ? "hover:bg-accent" : "hover:bg-gray-100"
                }`}
                title={announcement.isPinned ? "Unpin" : "Pin"}
              >
                📌
              </button>
              <button
                onClick={() => onDelete(announcement._id)}
                className={`p-2 rounded-lg text-red-500 ${
                  isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                }`}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {announcement.title && (
          <h3
            className={`font-semibold mb-2 ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {announcement.title}
          </h3>
        )}
        <p
          className={`whitespace-pre-wrap ${
            isDark ? "text-foreground" : "text-gray-700"
          }`}
        >
          {announcement.content}
        </p>

        {/* Comments Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`text-sm ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            } hover:underline`}
          >
            {announcement.comments?.length || 0} comments
          </button>

          {showComments && (
            <div className="mt-3 space-y-3">
              {announcement.comments?.map((comment, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {comment.userId?.name?.charAt(0) || "U"}
                  </div>
                  <div
                    className={`flex-1 p-2 rounded-lg ${
                      isDark ? "bg-secondary" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-foreground" : "text-gray-900"
                      }`}
                    >
                      {comment.userId?.name || "User"}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-muted-foreground" : "text-gray-600"
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim()) {
                      onComment(announcement._id);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    isDark
                      ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      : "bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={() => onComment(announcement._id)}
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementStream;
