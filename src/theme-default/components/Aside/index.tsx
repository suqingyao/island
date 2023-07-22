import { useEffect, useRef } from 'react';
import { Header, PropsWithIsland } from 'shared/types';
import { bindingAsideScroll, scrollToTarget } from '../../logic/asideScroll';
import { useHeaders } from '../../logic/useHeaders';

interface AsideProps {
  headers: Header[];
}

export default function Aside(props: AsideProps & PropsWithIsland) {
  const { headers: rawHeaders = [] } = props;
  const headers = useHeaders(rawHeaders);
  const hasOutline = rawHeaders.length > 0;
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unbinding = bindingAsideScroll();
    return () => unbinding();
  }, []);

  const renderHeader = (header: Header) => {
    return (
      <li key={header.id}>
        <a
          href={`#${header.id}`}
          className="block leading-7 text-text-2 hover:text-text-1"
          transition="color duration-300"
          style={{
            paddingLeft: (header.depth - 2) * 12
          }}
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(header.id);
            target && scrollToTarget(target, false);
          }}
        >
          {header.text}
        </a>
      </li>
    );
  };

  return (
    <div
      flex="~ col"
      style={{
        width: 'var(--island-aside-width)'
      }}
    >
      <div>
        {hasOutline && (
          <div
            id="aside-container"
            relative="~"
            divider-left="~"
            pl="4"
            text="13px"
            font="medium"
          >
            <div
              ref={markerRef}
              id="aside-maker"
              className="absolute top-33px op-0 w-1px h-18px bg-brand"
              style={{
                left: '-1px',
                transition:
                  'top 0.25s cubic-bezier(0,1,0.5,1), background-color 0.5s, opacity 0.25s'
              }}
            ></div>
            <div leading-7="~" text="13px" font="semibold">
              ON THIS PAGE
            </div>
            <nav>
              <ul relative="~">{headers.map(renderHeader)}</ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
