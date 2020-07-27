import Link from 'next/link';
import { AnalyticsType, MetricsProvider } from 'react-capture-metrics';
import { useEffect, useState } from 'react';
import Sidebar, { Item } from '../components/sidebar';

export default function MyApp({ Component, pageProps }) {

  const [sessionId, setUserId] = useState<string>()
  useEffect(() => {
    const sessionId = new Date().getTime().toString().slice(-2);
    setUserId(sessionId)
  }, [])

  const [items, setItems] = useState<Item[]>([])

  const analytics: AnalyticsType = {
    track: (name, properties) => {
      const item: Item = {
        type: 'track',
        name,
        properties,
      }
      setItems((items) => [...items, item])
    },
    page: (name, properties, category) => {
      const item: Item = {
        type: 'page',
        name,
        properties,
        category,
      }
      setItems((items) => [...items, item])
    }
  }

  return (
    <>
      <nav className="container">
        <div>
          <Link href="/">
            <a>
              Home
            </a>
          </Link>
          <Link href="/learn-more">
            <a style={{ margin: '0 1rem' }}>
              Learn more
            </a>
          </Link>
          {sessionId && (
            <>
              Session id: {sessionId}
            </>
          )}
        </div>
      </nav>
      <MetricsProvider
        analytics={analytics}
        ready={Boolean(sessionId)}
        properties={{
          app: {
            sessionId: sessionId,
            src: '_app.tsx'
          }
        }}
      >
        <Component {...pageProps} />
      </MetricsProvider>
      <Sidebar items={items} />
      <style jsx>{`
        .container {
          padding: 1rem;
          text-align: center;
          border-bottom: 1px solid #eee;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
       `}</style>
    </>
  );
}
