import logo from './logo.svg';
import './App.css';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import EditPage from './components/EditPage';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
function App() {
  return (
    <>
    
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/edit/:id" element={<EditPage />} />
      </Routes>
    </>
  );
}

export default App;
