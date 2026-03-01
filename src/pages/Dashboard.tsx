import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalQuestions: number;
  completedTests: number;
  averageScore: number;
  recentActivity: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    completedTests: 0,
    averageScore: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, progressRes] = await Promise.all([
          fetch("/api/questions"),
          fetch("/api/progress")
        ]);
        
        const questions = await questionsRes.json();
        const progress = await progressRes.json();

        const completedTests = progress.length;
        const totalScore = progress.reduce((acc: number, curr: any) => acc + curr.score, 0);
        const averageScore = completedTests > 0 ? Math.round(totalScore / completedTests) : 0;

        setStats({
          totalQuestions: questions.length,
          completedTests,
          averageScore,
          recentActivity: progress.slice(-5).reverse()
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Welcome back, Student</h2>
        <p className="text-neutral-500 mt-2">Here's an overview of your interview preparation progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Questions Available</p>
              <h3 className="text-2xl font-bold text-neutral-900">{stats.totalQuestions}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Tests Completed</p>
              <h3 className="text-2xl font-bold text-neutral-900">{stats.completedTests}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Average Score</p>
              <h3 className="text-2xl font-bold text-neutral-900">{stats.averageScore}%</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-medium text-neutral-900">{activity.topic || "Mock Test"}</p>
                    <p className="text-xs text-neutral-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      activity.score >= 80 ? 'bg-green-100 text-green-700' : 
                      activity.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.score}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No recent activity found. Start a test!</p>
          )}
        </div>

        <div className="bg-indigo-900 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Ready to practice?</h3>
            <p className="text-indigo-200 mb-6">Take a timed mock test to simulate real interview conditions.</p>
            <Link 
              to="/mock-test" 
              className="inline-flex items-center gap-2 bg-white text-indigo-900 px-5 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Mock Test
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-600 rounded-full opacity-50 blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}

function BarChart2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}
