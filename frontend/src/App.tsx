import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { NewTaskPage } from './pages/NewTaskPage';
import { LiveRadarPage } from './pages/LiveRadarPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { EvidenceCheckerPage } from './pages/EvidenceCheckerPage';
import { TrendVisualizerPage } from './pages/TrendVisualizerPage';
import { SearchCatalogPage } from './pages/SearchCatalogPage';
import { CustomizePage } from './pages/CustomizePage';
import { MonthlyReportsPage } from './pages/MonthlyReportsPage';
import { SignalItem } from './types';

export function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validTabs = [
      'new-task',
      'radar',
      'opportunities',
      'evidence',
      'trends',
      'catalog',
      'monthly-reports',
      'capabilities'
    ];
    return validTabs.includes(hash) ? hash : 'new-task';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [selectedQuery, setSelectedQuery] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validTabs = [
        'new-task',
        'radar',
        'opportunities',
        'evidence',
        'trends',
        'catalog',
        'monthly-reports',
        'capabilities'
      ];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSelectRecent = (query: string) => {
    setSelectedQuery(query);
    setActiveTab('new-task');
  };

  const handleSelectSignalForMatching = (signal: SignalItem) => {
    setSelectedQuery(signal.title);
    setActiveTab('new-task');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'new-task':
        return (
          <NewTaskPage
            initialQuery={selectedQuery}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'radar':
        return (
          <LiveRadarPage
            onSelectSignalForMatching={handleSelectSignalForMatching}
          />
        );
      case 'opportunities':
        return <OpportunitiesPage />;
      case 'evidence':
        return <EvidenceCheckerPage />;
      case 'trends':
        return <TrendVisualizerPage />;
      case 'catalog':
        return <SearchCatalogPage />;
      case 'monthly-reports':
        return <MonthlyReportsPage />;
      case 'capabilities':
        return <CustomizePage />;
      default:
        return <NewTaskPage onNavigateToTab={setActiveTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSelectRecentQuery={handleSelectRecent}
    >
      {renderActivePage()}
    </Layout>
  );
}

export default App;
