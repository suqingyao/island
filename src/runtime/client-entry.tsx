import { createRoot } from 'react-dom/client';
import App from './app';
import siteData from 'island:site-data';

function renderInBrowser() {
  console.log(siteData);

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('#root element not found');
  }
  createRoot(rootElement).render(<App />);
}

renderInBrowser();
