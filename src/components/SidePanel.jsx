import React from "react";
import TrafficTab from "./TrafficTab";
import DemographicTab from "./DemographicTab";
import BrowserTab from "./BrowserTab";
import LandingTab from "./LandingTab";

const SidePanel = ({
  drawerActive,
  closeDrawer,
  panelTab,
  setPanelTab,
  landingChartData,
  landingChartSeries,
  landingPagesData,
  browserChartData,
  browserData,
  countryChartData,
  countryData,
  trafficChartData,
  trafficChartSeries,
  trafficData,
  fmtDuration,
}) => {
  const tabs = ["Landing", "Browser", "Demographic", "Traffic acquisition"];

  return (
    <div
      className={`fixed inset-0 z-50 ${
        drawerActive ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`
          absolute right-0 bottom-0
          md:top-6 md:bottom-6 md:right-6
          w-full md:w-[78vw] lg:w-[68vw] xl:w-[58vw]
          
          /* HEIGHT CONTROL */
          h-[88svh] md:h-[calc(100vh-3rem)]
          
          bg-[#020617]
          border-t md:border border-slate-800
          shadow-[0_0_40px_rgba(0,0,0,0.6)]
          rounded-t-2xl md:rounded-xl
          
          transform transition-transform duration-300
          ease-[cubic-bezier(.22,.61,.36,1)]
          ${
            drawerActive
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-x-full"
          }
        `}
      >
        {/* ===== HEADER (FIXED HEIGHT) ===== */}
        <div className="sticky top-0 z-10 bg-[#020617]/95 backdrop-blur border-b border-slate-800">
          {/* Drag handle (mobile only) */}
          <div className="md:hidden flex justify-center py-2">
            <span className="h-1.5 w-10 rounded-full bg-slate-700" />
          </div>

          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-50">
                  Deep dive analytics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Granular performance breakdowns
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="h-9 px-4 rounded-full bg-slate-900 text-[11px] font-medium text-slate-200 hover:bg-slate-800 border border-slate-700 transition"
              >
                Close
              </button>
            </div>

            {/* MOBILE TABS */}
            <div className="mt-4 flex md:hidden gap-2 overflow-x-auto scrollbar-hide">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setPanelTab(t)}
                  className={`flex-shrink-0 px-4 h-9 text-xs rounded-full transition ${
                    panelTab === t
                      ? "bg-teal-600 text-white"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== BODY (NO EXTRA SCROLL) ===== */}
        <div className="flex h-[calc(100%-128px)] md:h-[calc(100%-80px)] overflow-hidden">
          {/* DESKTOP TABS */}
          <aside className="hidden md:flex w-44 flex-col gap-2 p-4 border-r border-slate-800">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setPanelTab(t)}
                className={`text-sm text-left px-3 py-2.5 rounded-lg transition ${
                  panelTab === t
                    ? "bg-teal-600 text-white"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </aside>

          {/* CONTENT */}
          <section className="flex-1 min-w-0 px-4 sm:px-6 py-4 overflow-y-auto text-sm text-slate-100">
            {panelTab === "Landing" && (
              <LandingTab
                landingChartData={landingChartData}
                landingChartSeries={landingChartSeries}
                landingPagesData={landingPagesData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Browser" && (
              <BrowserTab
                browserChartData={browserChartData}
                browserData={browserData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Demographic" && (
              <DemographicTab
                countryChartData={countryChartData}
                countryData={countryData}
                fmtDuration={fmtDuration}
              />
            )}

            {panelTab === "Traffic acquisition" && (
              <TrafficTab
                trafficChartData={trafficChartData}
                trafficChartSeries={trafficChartSeries}
                trafficData={trafficData}
                fmtDuration={fmtDuration}
              />
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

export default SidePanel;
