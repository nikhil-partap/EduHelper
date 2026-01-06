import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {classAPI, announcementAPI} from "../services/api";
import {LoadingSpinner, Alert} from "../components/shared";

const Announcements = () => {
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Post form state
  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchAnnouncements();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = isTeacher
        ? await classAPI.getTeacherClasses()
        : await classAPI.getStudentClasses();

      // Handle different response formats
      const classesData = response.data.data || response.data.classes || [];
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0]._id);
      }
    } catch (err) {
      setError("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await announcementAPI.getClassStream(selectedClassId);
      setAnnouncements(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !selectedClassId) return;

    setIsPosting(true);
    try {
      await announcementAPI.postAnnouncement({
        classId: selectedClassId,
        title: postTitle.trim() || undefined,
        content: postContent.trim(),
        type: "announcement",
      });
      setPostContent("");
      setPostTitle("");
      setShowPostForm(false);
      setSuccess("Announcement posted!");
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post announcement");
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
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDelete = async (announcementId) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await announcementAPI.deleteAnnouncement(announcementId);
      setSuccess("Announcement deleted");
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      await announcementAPI.togglePin(announcementId);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle pin");
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

  const selectedClass = classes.find((c) => c._id === selectedClassId);

  if (isLoading && classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            📢 Announcements
          </h1>
          <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
            {isTeacher
              ? "Post and manage class announcements"
              : "View announcements from your classes"}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Class Selector */}
        {classes.length > 0 ? (
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-foreground" : "text-gray-700"
              }`}
            >
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className={`w-full md:w-64 px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-card border-border text-foreground"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.subject}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-lg border ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <p className="text-4xl mb-4">📚</p>
            <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
              {isTeacher
                ? "Create a class first to post announcements"
                : "Join a class to see announcements"}
            </p>
          </div>
        )}

        {/* Post Form (Teachers Only) */}
        {isTeacher && selectedClassId && (
          <div className="mb-6">
            {!showPostForm ? (
              <button
                onClick={() => setShowPostForm(true)}
                className={`w-full p-4 rounded-lg border-2 border-dashed text-left transition-colors ${
                  isDark
                    ? "border-border hover:border-blue-500 hover:bg-accent"
                    : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || "T"}
                    </span>
                  </div>
                  <span
                    className={
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }
                  >
                    Announce something to {selectedClass?.className}...
                  </span>
                </div>
              </button>
            ) : (
              <form
                onSubmit={handlePost}
                className={`p-4 rounded-lg border ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || "T"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm ${
                        isDark
                          ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                      }`}
                    />
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share an announcement with your class..."
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border resize-none text-sm ${
                        isDark
                          ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                      }`}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostForm(false);
                      setPostContent("");
                      setPostTitle("");
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? "text-muted-foreground hover:bg-accent"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!postContent.trim() || isPosting}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Announcements List */}
        {selectedClassId && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className={`p-4 rounded-lg border ${
                    isDark
                      ? "bg-card border-border"
                      : "bg-white border-gray-200"
                  } ${announcement.isPinned ? "ring-2 ring-yellow-500" : ""}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
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
                        <p
                          className={`text-xs ${
                            isDark ? "text-muted-foreground" : "text-gray-500"
                          }`}
                        >
                          {formatDate(announcement.createdAt)}
                          {announcement.isPinned && " • 📌 Pinned"}
                        </p>
                      </div>
                    </div>
                    {isTeacher && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleTogglePin(announcement._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? "hover:bg-accent" : "hover:bg-gray-100"
                          }`}
                          title={announcement.isPinned ? "Unpin" : "Pin"}
                        >
                          {announcement.isPinned ? "📌" : "📍"}
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className={`p-2 rounded-lg transition-colors text-red-500 ${
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
                      isDark ? "text-muted-foreground" : "text-gray-600"
                    }`}
                  >
                    {announcement.content}
                  </p>

                  {/* Comments */}
                  {announcement.comments?.length > 0 && (
                    <div
                      className={`mt-4 pt-4 border-t ${
                        isDark ? "border-border" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium mb-2 ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        Comments ({announcement.comments.length})
                      </p>
                      <div className="space-y-2">
                        {announcement.comments.map((comment, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs">
                                {comment.authorId?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div
                              className={`flex-1 p-2 rounded-lg ${
                                isDark ? "bg-secondary" : "bg-gray-100"
                              }`}
                            >
                              <p
                                className={`text-xs font-medium ${
                                  isDark ? "text-foreground" : "text-gray-900"
                                }`}
                              >
                                {comment.authorId?.name || "User"}
                              </p>
                              <p
                                className={`text-sm ${
                                  isDark
                                    ? "text-muted-foreground"
                                    : "text-gray-600"
                                }`}
                              >
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div
                    className={`mt-4 pt-4 border-t ${
                      isDark ? "border-border" : "border-gray-200"
                    }`}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText[announcement._id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [announcement._id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          isDark
                            ? "bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleComment(announcement._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleComment(announcement._id)}
                        disabled={!commentText[announcement._id]?.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-12 rounded-lg border ${
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                }`}
              >
                <p className="text-4xl mb-4">📢</p>
                <p
                  className={isDark ? "text-muted-foreground" : "text-gray-500"}
                >
                  No announcements yet
                </p>
                {isTeacher && (
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? "text-muted-foreground" : "text-gray-400"
                    }`}
                  >
                    Click above to post your first announcement
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
