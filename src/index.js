import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Grab the div with the ID 'root' from your index.html
const rootElement = document.getElementById('root');

// Create a root.
const root = ReactDOM.createRoot(rootElement);

// Initial render: Render an element to the root.
root.render(<App />);
