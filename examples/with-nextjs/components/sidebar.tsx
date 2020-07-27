import React, { useEffect, useRef, useState } from 'react';

const config = { tension: 125, friction: 20, precision: 0.1 }
const timeout = 3000

export interface Item {
  type: 'page' | 'track';
  name: string;
  properties: object;
  category?: string;
}

interface Props {
  items: Item[]
}

const Sidebar: React.FC<Props> = (props) => {

  const {
    items,
  } = props;

  const endRef = useRef<HTMLDivElement>()
  const [isOpen, setOpen] = useState(true)

  useEffect(() => {
    if (endRef) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [items])

  return (
    <div className="sidebar" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(235px)'}}>
      <div className="header">
        <button onClick={() => setOpen(!isOpen)}>
          {isOpen ? <>&rarr;</> : <>&larr;</>}
        </button>
      </div>

      {items.map((item, i) => {
        const {
          type,
          name,
          properties
        } = item;

        return (
          <div className="item" key={i}>
            <div className="item-header">
              {type} event - {name}
            </div>
            <pre>
              <code>
              {JSON.stringify(properties, null, 1)}
              </code>
            </pre>
          </div>
        )
      })}

      <div
        style={{ float: 'left', clear: 'both' }}
        ref={endRef}
      >
      </div>

      <style jsx>{`
        .sidebar {
          overflow: auto;
          overflow-x: hidden;
          transition: transform .4s ease;
          position: fixed;
          right: 0;
          top: 0;
          width: 300px;
          height: 100vh;
          background: white;
          border-left: 1px solid #aaa;
        }
        
        .item-header {
          font-family: monospace;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .header {
          padding: 1rem;
        }

        .item {
          opacity: 0;
          animation: fadeInFromRight .5s ease forwards;
          animation-delay: .15s;

          border-radius: 4px;
          border: 1px solid #282c34;
          margin: 1rem;
          padding: 1rem;
          background: #eee;
        }

        @keyframes fadeInFromRight {
          0% {
            opacity: 0;
            transform: translateX(25%);
          }
          100% {
            opacity: 1;
            transform: translateX(0%);
          }
        }


      `}</style>
    </div>

  );
}

export default Sidebar;
