import { createRoot } from 'react-dom/client';
import App from './app';
import siteData from 'island:site-data';
import { BrowserRouter } from 'react-router-dom';

function renderInBrowser() {
  console.log(siteData);

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('#root element not found');
  }
  createRoot(rootElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

renderInBrowser();
