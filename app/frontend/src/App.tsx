import './index.css';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from './context/ThemeContext';

const App = () => (
  <ThemeProvider>
    <ChatPage />
  </ThemeProvider>
);

export default App;
