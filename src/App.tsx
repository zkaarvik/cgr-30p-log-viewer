import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ViewLogPage from "./pages/ViewLogPage";

const App = () => {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true"></span>
          <div>
            <div className="title">CGR-30P Log Viewer</div>
            <div className="subtitle">Aviation performance logs</div>
          </div>
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/viewlog" element={<ViewLogPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
