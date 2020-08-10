import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { MetricsContext, ReadyContext, voidAnalytics } from './MetricsProvider';
import { AnalyticsType, MetricsType, PageViewInstanceProps, PageViewProps } from 'src/types';

const PageView: React.FC<PageViewInstanceProps> = (props) => {

  const {
    name,
    properties,
    category,
    pageKey,
    analytics,
    children = null,
    ready = true,
  } = props;

  const allReady = useContext(ReadyContext) && ready

  const callPage = useCallback(() => {
    analytics.page(name, properties, category)
  }, [name, properties, category])

  useEffect(() => {
    if (allReady) {
      callPage();
    }
  }, [pageKey, allReady])

  return (
    <>
      {children}
    </>
  );
}

const CaptureReady: React.FC<{ ready: boolean }> = ({ ready, children }) => {
  const allReady = useContext(ReadyContext) && ready;
  return (
    <ReadyContext.Provider value={allReady}>
      {children}
    </ReadyContext.Provider>
  )
}

export default function useMetrics(properties: object = {}) {

  const capturedMetrics = useContext(MetricsContext);

  // think of this like a node in an n-tree
  const metricsRef = useRef<MetricsType>({
    analytics: {
      track: (name, bubbledProps) => {
        capturedMetrics.analytics.track(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        })
      },
      page: (name, bubbledProps, category) => {
        capturedMetrics.analytics.page(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        }, category)
      }
    },
    properties,
  })
  Object.assign(metricsRef.current, { properties })

  const pageViewRef = useRef<MetricsType>({
    analytics: voidAnalytics,
    properties: {}
  })

  // if (!metricsProvided) {
  //   throw new Error('AddProperties must be nested within MetricsProvider')
  // }

  const Capture = React.useMemo((): React.FC<{ ready?: boolean }> => ({ children, ready }) => {

    if (typeof ready === 'boolean') {
      return (
        <MetricsContext.Provider value={metricsRef.current}>
          <CaptureReady ready={ready}>
            {children}
          </CaptureReady>
        </MetricsContext.Provider>
      )
    }

    return (
      <MetricsContext.Provider value={metricsRef.current}>
        {children}
      </MetricsContext.Provider>
    )
  }, [])

  const PageViewInstance = React.useMemo((): React.FC<PageViewProps> => (props) => {
    const {
      children,
      name: pageName,
      category: pageCategory,
    } = props

    Object.assign(pageViewRef.current.analytics, {
      track: (name, bubbledProps = {}) => {
        capturedMetrics.analytics.track(name, {
          ...metricsRef.current.properties,
          ...bubbledProps,
          pageName,
          pageCategory,
        })
      },
      page: (name, bubbledProps = {}, category) => {
        capturedMetrics.analytics.page(name, {
          ...metricsRef.current.properties,
          ...bubbledProps,
          pageName,
          pageCategory,
        }, category)
      }
    } as AnalyticsType)

    return (
      <PageView analytics={pageViewRef.current.analytics} {...props}>
        <MetricsContext.Provider value={pageViewRef.current}>
          {children}
        </MetricsContext.Provider>
      </PageView>
    )
  }, [capturedMetrics])

  return {
    analytics: metricsRef.current.analytics,
    Capture,
    PageView: PageViewInstance,
  }
}
