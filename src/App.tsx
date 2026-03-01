import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import MockTest from "./pages/MockTest";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/questions" element={<QuestionBank />} />
          <Route path="/mock-test" element={<MockTest />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
