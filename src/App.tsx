import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Timer } from "./pages/Timer";
import { Tasks } from "./pages/Tasks";
import { Music } from "./pages/Music";
import { Settings } from "./pages/Settings";
import { NotificationProvider } from "./contexts/NotificationContext";
import { MusicProvider } from "./contexts/MusicContext";

function App() {
  return (
    <NotificationProvider>
      <MusicProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Timer />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/music" element={<Music />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </MusicProvider>
    </NotificationProvider>
  );
}

export default App;
