import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Button, ButtonGroup } from '@chakra-ui/react'
import Homepage from './pages/Homepage';
import Chatpage from './pages/Chatpage';
import NoPage from './pages/NoPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/">
          <Route index element={<Homepage />} />
          <Route path="chat" element={<Chatpage />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
