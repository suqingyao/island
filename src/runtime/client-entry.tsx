import { createRoot, hydrateRoot } from 'react-dom/client';
import App, { initPageData } from './app';
import siteData from 'island:site-data';
import { BrowserRouter } from 'react-router-dom';
import { DataContext } from './hooks';
import { ComponentType } from 'react';

declare global {
  interface Window {
    ISLANDS: Record<string, ComponentType<unknown>>;
    ISLAND_PROPS: unknown[];
  }
}

async function renderInBrowser() {
  console.log(siteData);

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('#root element not found');
  }

  if (import.meta.env.DEV) {
    const pageData = await initPageData(location.pathname);

    createRoot(rootElement).render(
      <DataContext.Provider value={pageData}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataContext.Provider>
    );
  } else {
    const islands = document.querySelectorAll('[__island]');
    if (islands.length === 0) {
      return;
    }
    for (const island of islands) {
      const [id, index] = island.getAttribute('__island').split(':');
      const Element = window.ISLANDS[id] as ComponentType<unknown>;
      hydrateRoot(island, <Element {...window.ISLAND_PROPS[index]} />);
    }
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
