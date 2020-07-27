import React, { useCallback, useState } from 'react';
import { useMetrics } from 'capture-metrics';

const globalVotes = {
  upvotes: {},
  downvotes: {},
}

const Vote: React.FC<{ topic: string }> = (props) => {

  const {
    topic,
  } = props;

  const { analytics } = useMetrics();

  const [votes, setVotes] = useState(globalVotes);

  const upvote = () => {
    globalVotes.upvotes[topic] = globalVotes.upvotes[topic] + 1 || 1;
    analytics.track('Upvote', {
      vote: {
        upvotes: votes.upvotes[topic] || 0,
        downvotes: votes.downvotes[topic] || 0,
        src: 'components/vote.tsx'
      }
    })
    setVotes({
      ...globalVotes
    })
  }
  const downvote = () => {
    globalVotes.downvotes[topic] = globalVotes.downvotes[topic] + 1 || 1
    analytics.track('Downvote', {
      vote: {
        upvotes: votes.upvotes[topic] || 0,
        downvotes: votes.downvotes[topic] || 0,
        src: 'components/vote.tsx'
      }
    })
    setVotes({
      ...globalVotes
    })
  }

  return (
    <>
      <span>
        {votes.upvotes[topic] || 0}
        <button onClick={upvote}>
          👍
        </button>
      </span>

      <span style={{ marginLeft: 8 }}>
        {votes.downvotes[topic] || 0}
        <button onClick={downvote}>
          👎
        </button>
      </span>

      <style jsx>
        {`

        button {
          margin-left: 8px;
          cursor: pointer;
        }

      `}</style>
    </>
  );
}

export default Vote
