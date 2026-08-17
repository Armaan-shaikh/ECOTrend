'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { LocationSelector } from '../components/LocationSelector';
import { SpatialMap } from '../components/SpatialMap';
import { MetricsOverview } from '../components/MetricsOverview';
import { HistoricalAnalyticsChart } from '../components/HistoricalAnalyticsChart';
import { SeasonalityChart } from '../components/SeasonalityChart';
import { DataAuditDrawer } from '../components/DataAuditDrawer';
import { fetchLocationTree, fetchHistoricalAnalytics } from '../lib/api';
import { LocationTreeItem, HistoricalAnalyticsSummary } from '../lib/types';
import { Database, Shield, Layers, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [tree, setTree] = useState<LocationTreeItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc_us_ny_nyc_manhattan');
  const [selectedMetric, setSelectedMetric] = useState<string>('PM2.5');
  const [selectedDays, setSelectedDays] = useState<number>(90);

  const [analytics, setAnalytics] = useState<HistoricalAnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTree();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedLocationId, selectedMetric, selectedDays]);

  const loadTree = async () => {
    const data = await fetchLocationTree();
    setTree(data);
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchHistoricalAnalytics(selectedLocationId, selectedMetric, selectedDays);
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleRefreshPipeline = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-eco-bg flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onRefresh={handleRefreshPipeline}
        onOpenAudit={() => setIsAuditOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* 1. Spatial Hierarchy & Control Toolbar */}
        <LocationSelector
          tree={tree}
          selectedLocationId={selectedLocationId}
          selectedMetric={selectedMetric}
          selectedDays={selectedDays}
          onSelectLocation={setSelectedLocationId}
          onSelectMetric={setSelectedMetric}
          onSelectDays={setSelectedDays}
        />

        {/* 2. Key Metrics & Stat Summary Grid */}
        <MetricsOverview analytics={analytics} loading={loadingAnalytics} />

        {/* 3. Main Dashboard Grid: Spatial Map & Historical Time-Series */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Spatial Station Map (5 Cols) */}
          <div className="lg:col-span-5 h-[420px] lg:h-auto">
            <SpatialMap
              tree={tree}
              selectedLocationId={selectedLocationId}
              onSelectStation={setSelectedLocationId}
            />
          </div>

          {/* Historical Time-Series Chart (7 Cols) */}
          <div className="lg:col-span-7">
            <HistoricalAnalyticsChart analytics={analytics} loading={loadingAnalytics} />
          </div>
        </div>

        {/* 4. Seasonality Component Decomposition */}
        <SeasonalityChart analytics={analytics} loading={loadingAnalytics} />

        {/* 5. Phase 1 Scope Footer Info */}
        <footer className="border-t border-eco-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-eco-muted gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              EcoTrend Phase 1 Engine · <strong className="text-eco-text">Deterministic Historical Analytics Only</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-eco-muted font-mono text-[11px]">
            <span>PostgreSQL 16 + PostGIS + TimescaleDB</span>
            <span>·</span>
            <span>FastAPI + Next.js 14</span>
          </div>
        </footer>
      </main>

      {/* Data Quality Slide-over Audit Inspector */}
      <DataAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        selectedLocationId={selectedLocationId}
      />
    </div>
  );
}
