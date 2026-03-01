import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  timeLimit: number;
}

export default function MockTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Mock code execution state
  const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n  \n}");

  useEffect(() => {
    fetch("/api/questions")
      .then(res => res.json())
      .then(data => {
        // Randomly select 5 questions for the mock test
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setQuestions(selected);
        // Calculate total time (sum of time limits)
        const totalTime = selected.reduce((acc: number, q: Question) => acc + q.timeLimit, 0) * 60;
        setTimeLeft(totalTime);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestActive && timeLeft > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive && !isSubmitted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft, isSubmitted]);

  const startTest = () => {
    setIsTestActive(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCode(answers[questions[currentQuestionIndex + 1]?.id] || "// Write your solution here...\n\nfunction solution() {\n  \n}");
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCode(answers[questions[currentQuestionIndex - 1]?.id] || "");
    }
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: val
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setIsTestActive(false);
    
    // Mock scoring logic: Calculate score based on characters written (just for demo)
    // In a real app, this would send code to a backend for execution against test cases
    let calculatedScore = 0;
    Object.values(answers).forEach((ans: string) => {
      if (ans.length > 50) calculatedScore += 20; // 20 points per "valid" answer
    });
    
    setScore(calculatedScore);

    // Save progress
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Mock Test Mixed",
        score: calculatedScore,
        totalQuestions: questions.length,
        answers: Object.keys(answers).length
      })
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTestActive && !isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Timer className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-neutral-900">Ready for your Mock Test?</h2>
        <p className="text-lg text-neutral-600">
          You will have {Math.floor(timeLeft / 60)} minutes to solve {questions.length} questions.
          The questions are selected randomly from various topics to simulate a real interview.
        </p>
        
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm text-left space-y-4">
          <h3 className="font-semibold text-neutral-900">Test Rules:</h3>
          <ul className="space-y-2 text-neutral-600">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> No external help allowed</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Timer will start immediately</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Auto-submission when time runs out</li>
          </ul>
        </div>

        <button 
          onClick={startTest}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
        >
          Start Test Now
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-4xl font-bold text-neutral-900">Test Submitted!</h2>
        <div className="text-6xl font-black text-indigo-600 my-8">
          {score}%
        </div>
        <p className="text-lg text-neutral-600">
          You answered {Object.keys(answers).length} out of {questions.length} questions.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white border border-neutral-200 text-neutral-900 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-50"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div>
          <h2 className="font-bold text-neutral-900">Question {currentQuestionIndex + 1} of {questions.length}</h2>
          <p className="text-xs text-neutral-500">{currentQ?.topic} • {currentQ?.difficulty}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-700'}`}>
          <Timer className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Question Panel */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm overflow-y-auto">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">{currentQ?.title}</h3>
          <p className="text-neutral-600 leading-relaxed mb-6">{currentQ?.description}</p>
          
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-4">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Constraints:</h4>
            <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
              <li>Time Limit: {currentQ?.timeLimit} mins</li>
              <li>Memory Limit: 256 MB</li>
            </ul>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex flex-col bg-neutral-900 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-neutral-800 px-4 py-2 flex items-center justify-between border-b border-neutral-700">
            <span className="text-xs text-neutral-400 font-mono">solution.js</span>
            <span className="text-xs text-neutral-500">JavaScript</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 bg-neutral-900 text-neutral-200 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 rounded-xl font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            Submit Test
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
