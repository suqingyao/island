import { createRoot } from 'react-dom/client';
import App, { initPageData } from './app';
import siteData from 'island:site-data';
import { BrowserRouter } from 'react-router-dom';
import { DataContext } from './hooks';

async function renderInBrowser() {
  console.log(siteData);

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('#root element not found');
  }
  const pageData = await initPageData(location.pathname);

  createRoot(rootElement).render(
    <DataContext.Provider value={pageData}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataContext.Provider>
  );
}

renderInBrowser();
