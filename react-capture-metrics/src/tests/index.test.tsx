import React, { useRef, useState } from 'react'
import * as rtl from '@testing-library/react';
import { MetricsProvider, useMetrics } from '../index';

const analytics = {
  page: jest.fn(),
  track: jest.fn(),
}

const CallTrackOnUpdate: React.FC = () => {
  const { analytics } = useMetrics()
  const ref = useRef(0);

  return (
    <button
      onClick={() => {
        ref.current += 1;
        analytics.track('updated', { count: ref.current })
      }}
    >
      Child
    </button>
  );
}

const Test: React.FC = ({ children }) => {

  const [parentCount, setParentCount] = useState(0);

  return (
    <MetricsProvider analytics={analytics} properties={{ parentCount }}>
      <button onClick={() => setParentCount(parentCount + 1)}>
        Provider
      </button>
      <div data-testid="parentCount">
        {parentCount}
      </div>

      {children}
    </MetricsProvider>
  )
}

describe('props updated when changed in MetricsProvider', () => {
  it('works', () => {

    rtl.render(
      <Test>
        <CallTrackOnUpdate />
      </Test>
    );

    rtl.fireEvent.click(rtl.screen.getByText(/Child/i))

    expect(analytics.track.mock.calls[0]).toMatchSnapshot();

    rtl.fireEvent.click(rtl.screen.getByText(/Provider/i))
    rtl.fireEvent.click(rtl.screen.getByText(/Child/i))
    expect(rtl.screen.getByTestId(/parentCount/i).textContent).toEqual('1')

    expect(analytics.track.mock.calls[1]).toMatchSnapshot();

  })
})
