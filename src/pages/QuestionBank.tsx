import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, ChevronRight, Clock, Tag } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    topic: "All",
    difficulty: "All",
    search: ""
  });

  const topics = ["All", "Arrays", "Strings", "Linked Lists", "Trees", "Dynamic Programming", "Stacks", "Graphs", "Design"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    fetch("/api/questions")
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setFilteredQuestions(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let result = questions;

    if (filters.topic !== "All") {
      result = result.filter(q => q.topic === filters.topic);
    }

    if (filters.difficulty !== "All") {
      result = result.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(q => 
        q.title.toLowerCase().includes(searchLower) || 
        q.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredQuestions(result);
  }, [filters, questions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Question Bank</h2>
        <p className="text-neutral-500 mt-2">Browse and practice coding interview questions.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative">
            <select 
              className="appearance-none bg-neutral-50 border border-neutral-200 text-neutral-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.topic}
              onChange={(e) => setFilters({...filters, topic: e.target.value})}
            >
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              className="appearance-none bg-neutral-50 border border-neutral-200 text-neutral-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      {q.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-sm line-clamp-2">{q.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {q.topic}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {q.timeLimit} mins
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-neutral-500">
            No questions found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
