import React, { useCallback, useState } from 'react';
import { useMetrics } from 'react-capture-metrics';
import Vote from '../components/vote';

interface Props {
  title: string;
  description: string;
}

const Card: React.FC<Props> = (props) => {

  const {
    title,
    description
  } = props

  const { Capture } = useMetrics({
    card: {
      title,
      src: 'components/card.tsx'
    }
  })

  return (
    <Capture>
      <div className="card">
        <h3>{title}</h3>
        <p>{description}</p>

        <div style={{ marginTop: 8 }}>
          <Vote topic={title} />
        </div>

        <style jsx>{`

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }
      
      `}</style>
      </div>
    </Capture>
  );
};

export default Card;
