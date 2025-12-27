import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {useTheme} from "../hooks/useTheme";
import {LoadingSpinner, Alert} from "../components/shared";
import {assignmentAPI} from "../services/api";

const AssignmentDetail = () => {
  const {assignmentId} = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {theme} = useTheme();
  const isDark = theme === "dark";
  const isTeacher = user?.role === "teacher";

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingStudent, setGradingStudent] = useState(null);
  const [gradeData, setGradeData] = useState({grade: "", feedback: ""});

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentAPI.getAssignment(assignmentId);
      setAssignment(response.data.assignment);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assignment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await assignmentAPI.submitAssignment(assignmentId, {
        content: submissionContent,
      });
      setSuccess("Assignment submitted successfully!");
      fetchAssignment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await assignmentAPI.gradeSubmission(assignmentId, gradingStudent, {
        grade: Number(gradeData.grade),
        feedback: gradeData.feedback,
      });
      setSuccess("Submission graded successfully!");
      setGradingStudent(null);
      setGradeData({grade: "", feedback: ""});
      fetchAssignment();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-background" : "bg-gray-50"
        }`}
      >
        <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
          Assignment not found
        </p>
      </div>
    );
  }

  const mySubmission = assignment.submissions?.find(
    (s) => s.studentId?._id === user?.id || s.studentId === user?.id
  );
  const isPastDue = new Date() > new Date(assignment.dueDate);

  const inputClass = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-input-background border-border text-foreground"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <button
          onClick={() => navigate(-1)}
          className={`mb-4 flex items-center gap-2 text-sm ${
            isDark
              ? "text-muted-foreground hover:text-foreground"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ← Back
        </button>

        {/* Assignment Details */}
        <div
          className={`rounded-xl border p-6 mb-6 ${
            isDark ? "bg-card border-border" : "bg-white border-gray-200"
          }`}
        >
          <h1
            className={`text-2xl font-semibold mb-2 ${
              isDark ? "text-foreground" : "text-gray-900"
            }`}
          >
            {assignment.title}
          </h1>
          <div
            className={`flex flex-wrap gap-4 text-sm mb-4 ${
              isDark ? "text-muted-foreground" : "text-gray-500"
            }`}
          >
            <span>📅 Due: {new Date(assignment.dueDate).toLocaleString()}</span>
            <span>📊 Total Marks: {assignment.totalMarks}</span>
            {assignment.allowLateSubmission && (
              <span className="text-yellow-600">
                Late penalty: {assignment.latePenalty}%
              </span>
            )}
          </div>

          {assignment.description && (
            <div className="mb-4">
              <h3
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-foreground" : "text-gray-700"
                }`}
              >
                Description
              </h3>
              <p className={isDark ? "text-muted-foreground" : "text-gray-600"}>
                {assignment.description}
              </p>
            </div>
          )}

          {assignment.instructions && (
            <div>
              <h3
                className={`text-sm font-medium mb-1 ${
                  isDark ? "text-foreground" : "text-gray-700"
                }`}
              >
                Instructions
              </h3>
              <p
                className={`whitespace-pre-wrap ${
                  isDark ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                {assignment.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Student View */}
        {!isTeacher && (
          <div
            className={`rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Your Submission
            </h2>

            {mySubmission ? (
              <div>
                <div
                  className={`rounded-lg p-4 mb-4 ${
                    isDark ? "bg-secondary" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {mySubmission.content}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? "text-muted-foreground" : "text-gray-500"
                    }`}
                  >
                    Submitted:{" "}
                    {new Date(mySubmission.submittedAt).toLocaleString()}
                    {mySubmission.status === "late" && (
                      <span className="text-yellow-600 ml-2">(Late)</span>
                    )}
                  </p>
                </div>

                {mySubmission.status === "graded" && (
                  <div
                    className={`rounded-lg p-4 ${
                      isDark
                        ? "bg-green-950 border border-green-900"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-600 font-medium">Graded</span>
                      <span
                        className={`text-2xl font-bold ${
                          isDark ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {mySubmission.grade}/{assignment.totalMarks}
                      </span>
                    </div>
                    {mySubmission.feedback && (
                      <p
                        className={
                          isDark ? "text-muted-foreground" : "text-gray-600"
                        }
                      >
                        {mySubmission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {isPastDue && !assignment.allowLateSubmission ? (
                  <p className="text-red-600">Submission deadline has passed</p>
                ) : (
                  <>
                    {isPastDue && (
                      <p className="text-yellow-600 text-sm mb-2">
                        ⚠️ Late submission - {assignment.latePenalty}% penalty
                        will apply
                      </p>
                    )}
                    <textarea
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      placeholder="Enter your submission here..."
                      rows={8}
                      required
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Assignment"}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}

        {/* Teacher View */}
        {isTeacher && (
          <div
            className={`rounded-xl border p-6 ${
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              Submissions ({assignment.submissions?.length || 0})
            </h2>

            {assignment.submissions?.length === 0 ? (
              <p className={isDark ? "text-muted-foreground" : "text-gray-500"}>
                No submissions yet
              </p>
            ) : (
              <div className="space-y-4">
                {assignment.submissions?.map((submission) => (
                  <div
                    key={submission.studentId?._id || submission.studentId}
                    className={`rounded-lg p-4 ${
                      isDark ? "bg-secondary" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? "text-foreground" : "text-gray-900"
                          }`}
                        >
                          {submission.studentId?.name || "Student"}
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-muted-foreground" : "text-gray-500"
                          }`}
                        >
                          {submission.studentId?.rollNumber}
                        </p>
                      </div>
                      <div>
                        {submission.status === "graded" ? (
                          <span className="text-green-600 font-medium">
                            {submission.grade}/{assignment.totalMarks}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setGradingStudent(
                                submission.studentId?._id ||
                                  submission.studentId
                              );
                              setGradeData({grade: "", feedback: ""});
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Grade
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        isDark ? "text-foreground" : "text-gray-700"
                      }`}
                    >
                      {submission.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isDark ? "text-muted-foreground" : "text-gray-500"
                      }`}
                    >
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleString()}
                      {submission.status === "late" && (
                        <span className="text-yellow-600 ml-2">(Late)</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grading Modal */}
        {gradingStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className={`rounded-xl p-6 w-full max-w-md ${
                isDark ? "bg-card border border-border" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                Grade Submission
              </h2>
              <form onSubmit={handleGrade} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    Grade (out of {assignment.totalMarks})
                  </label>
                  <input
                    type="number"
                    value={gradeData.grade}
                    onChange={(e) =>
                      setGradeData((prev) => ({...prev, grade: e.target.value}))
                    }
                    min={0}
                    max={assignment.totalMarks}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      isDark ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    Feedback
                  </label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGradingStudent(null)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDark
                        ? "bg-secondary text-secondary-foreground hover:bg-accent"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Saving..." : "Save Grade"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
