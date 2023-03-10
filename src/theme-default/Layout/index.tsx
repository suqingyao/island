import { usePageData } from '@runtime';
import 'uno.css';
export function Layout() {
  const pageData = usePageData();
  const { pageType } = pageData;

  const getContext = () => {
    if (pageType === 'home') {
      return <div></div>;
    } else if (pageType === 'doc') {
      return <div>正文内容</div>;
    } else {
      return <div>404</div>;
    }
  };

  return (
    <div>
      <div>Nav</div>
      {getContext()}
    </div>
  );
}
