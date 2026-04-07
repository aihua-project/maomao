import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from '@/pages/MainMenu';
import GameScene from '@/pages/GameScene';
import ResultPage from '@/pages/ResultPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game/:mapId" element={<GameScene />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}
