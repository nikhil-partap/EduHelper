import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";

import {useAuth} from "../hooks/useAuth";
import {LoadingSpinner, Alert} from "../components/shared";
import {assignmentAPI} from "../services/api";

const AssignmentDetail = () => {
  const {assignmentId} = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const isTeacher = user?.role === "teacher";

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Student submission state
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher grading state
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Assignment not found</p>
      </div>
    );
  }

  const mySubmission = assignment.submissions?.find(
    (s) => s.studentId?._id === user?.id || s.studentId === user?.id
  );
  const isPastDue = new Date() > new Date(assignment.dueDate);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {assignment.title}
          </h1>
          <div className="flex gap-4 text-sm text-gray-400 mb-4">
            <span>📅 Due: {new Date(assignment.dueDate).toLocaleString()}</span>
            <span>📊 Total Marks: {assignment.totalMarks}</span>
            {assignment.allowLateSubmission && (
              <span className="text-yellow-500">
                Late penalty: {assignment.latePenalty}%
              </span>
            )}
          </div>

          {assignment.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Description
              </h3>
              <p className="text-gray-400">{assignment.description}</p>
            </div>
          )}

          {assignment.instructions && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Instructions
              </h3>
              <p className="text-gray-400 whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Student View */}
        {!isTeacher && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">
              Your Submission
            </h2>

            {mySubmission ? (
              <div>
                <div className="bg-gray-700 rounded p-4 mb-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {mySubmission.content}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted:{" "}
                    {new Date(mySubmission.submittedAt).toLocaleString()}
                    {mySubmission.status === "late" && (
                      <span className="text-yellow-500 ml-2">(Late)</span>
                    )}
                  </p>
                </div>

                {mySubmission.status === "graded" && (
                  <div className="bg-green-900/30 border border-green-700 rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 font-medium">Graded</span>
                      <span className="text-2xl font-bold text-white">
                        {mySubmission.grade}/{assignment.totalMarks}
                      </span>
                    </div>
                    {mySubmission.feedback && (
                      <p className="text-gray-300 text-sm">
                        {mySubmission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {isPastDue && !assignment.allowLateSubmission ? (
                  <p className="text-red-400">Submission deadline has passed</p>
                ) : (
                  <>
                    {isPastDue && (
                      <p className="text-yellow-500 text-sm mb-2">
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
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 mb-4"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Assignment"}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}

        {/* Teacher View - Submissions */}
        {isTeacher && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">
              Submissions ({assignment.submissions?.length || 0})
            </h2>

            {assignment.submissions?.length === 0 ? (
              <p className="text-gray-400">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {assignment.submissions?.map((submission) => (
                  <div
                    key={submission.studentId?._id || submission.studentId}
                    className="bg-gray-700 rounded p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          {submission.studentId?.name || "Student"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {submission.studentId?.rollNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.status === "graded" ? (
                          <span className="text-green-400 font-medium">
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
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Grade
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {submission.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleString()}
                      {submission.status === "late" && (
                        <span className="text-yellow-500 ml-2">(Late)</span>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">
                Grade Submission
              </h2>
              <form onSubmit={handleGrade} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGradingStudent(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
