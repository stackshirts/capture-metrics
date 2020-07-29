import React, { useRef, useState } from 'react'
import * as rtl from '@testing-library/react';
import { MetricsProvider, useMetrics } from '../index';

const analytics = {
  page: jest.fn(),
  track: jest.fn(),
}

afterEach(() => {
  jest.resetAllMocks()
})

const TrackOnClick: React.FC = () => {
  const { analytics } = useMetrics()
  const ref = useRef(0);

  return (
    <button
      onClick={() => {
        ref.current += 1;
        analytics.track('updated', { count: ref.current })
      }}
    >
      TrackOnClick
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
        <TrackOnClick />
      </Test>
    );

    rtl.fireEvent.click(rtl.screen.getByText(/TrackOnClick/i))

    expect(analytics.track.mock.calls[0]).toMatchSnapshot();

    rtl.fireEvent.click(rtl.screen.getByText(/Provider/i))
    rtl.fireEvent.click(rtl.screen.getByText(/TrackOnClick/i))
    expect(rtl.screen.getByTestId(/parentCount/i).textContent).toEqual('1')

    expect(analytics.track.mock.calls[1]).toMatchSnapshot();

  })
})


const TestReady: React.FC = ({ children }) => {

  const { Capture } = useMetrics({ TestReady: 'props' })
  const [ready, setReady] = useState(false);

  return (
    <Capture ready={ready}>
      <button onClick={() => setReady(true)}>
        TestReady
      </button>
      {children}
    </Capture>
  )
}

const TestPageView: React.FC = ({ children }) => {

  const { PageView } = useMetrics({ TestPageView: 'props' })

  return (
    <PageView name="Page" category="Category" properties={{ PageView: 'props' }}>
      {children}
    </PageView>
  )
}

describe('only calls page() when ready', () => {
  it('works', () => {

    rtl.render(
      <Test>
        <TestReady>
          <TestPageView />
        </TestReady>
      </Test>
    );

    expect(analytics.page).toHaveBeenCalledTimes(0);
    rtl.fireEvent.click(rtl.screen.getByText(/TestReady/i))
    expect(analytics.page).toHaveBeenCalledTimes(1);

  })
})

describe('PageView will capture props in useMetrics and on itself', () => {
  it('works', () => {

    rtl.render(
      <Test>
        <TestReady>
          <TestPageView>
            <TrackOnClick />
          </TestPageView>
        </TestReady>
      </Test>
    );

    rtl.fireEvent.click(rtl.screen.getByText(/TrackOnClick/i))

    expect(analytics.track.mock.calls[0]).toMatchSnapshot();

  })
})
