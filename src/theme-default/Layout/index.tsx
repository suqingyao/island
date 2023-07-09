import { usePageData } from '@runtime';
import Nav from 'theme-default/components/Nav';
import '../styles/base.css';
import '../styles/vars.css';
import '../styles/doc.css';
import 'uno.css';
import HomeLayout from './HomeLayout';
import DocLayout from './DocLayout';
export function Layout() {
  const pageData = usePageData();
  const { pageType } = pageData;

  const getContext = () => {
    if (pageType === 'home') {
      return <HomeLayout />;
    } else if (pageType === 'doc') {
      return <DocLayout />;
    } else {
      return <div>404</div>;
    }
  };

  return (
    <div>
      <Nav />
      <section
        style={{
          paddingTop: 'var(--island-nav-height)'
        }}
      >
        {getContext()}
      </section>
    </div>
  );
}
