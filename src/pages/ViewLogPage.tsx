import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useFileStore } from "$lib/fileStore";
import { parseLogfile, sortLogGroups } from "$lib/cgr30Parse";
import type { ParsedLogfile } from "$lib/types";
import { LogGroupInfo } from "$lib/types";
import { useScrollSpy } from "$lib/hooks/useScrollSpy";
import LogChart from "../components/LogChart";
import "./ViewLogPage.css";

const ViewLogPage = () => {
  const { file } = useFileStore();
  const [parsedLogfile, setParsedLogfile] = useState<ParsedLogfile | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!file) {
      setParsedLogfile(null);
      return;
    }

    const run = async () => {
      setIsLoading(true);
      const parsed = await parseLogfile(file);
      if (!cancelled) {
        setParsedLogfile(parsed);
        setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const sortedLogGroups = useMemo(
    () => (parsedLogfile ? sortLogGroups(parsedLogfile) : []),
    [parsedLogfile]
  );

  useEffect(() => {
    if (sortedLogGroups.length && !activeGroup) {
      setActiveGroup(sortedLogGroups[0].group);
    }
  }, [sortedLogGroups, activeGroup]);

  useScrollSpy({
    targets: ".chart-card[data-group]",
    onChange: (group) => setActiveGroup(group),
  });

  if (!file) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <p className="hint">Parsing log file…</p>;
  }

  if (!parsedLogfile) {
    return (
      <p className="hint">
        Could not parse this log file. Please try another CSV.
      </p>
    );
  }

  return (
    <div className="viewlog-layout">
      <aside className="nav-column">
        <div className="nav-title">Charts</div>
        <nav className="nav-list">
          {sortedLogGroups.map((sortedLogGroup) => (
            <a
              key={sortedLogGroup.group}
              href={`#section-${sortedLogGroup.group}`}
              className={
                activeGroup === sortedLogGroup.group ? "active" : undefined
              }
            >
              {LogGroupInfo[sortedLogGroup.group].title}
            </a>
          ))}
        </nav>
      </aside>

      <main className="content-column">
        <section className="aircraft-card">
          <div className="aircraft-header">
            <div className="aircraft-block">
              <div className="aircraft-label">Aircraft ID</div>
              <div className="aircraft-id">
                {parsedLogfile.preamble["Aircraft ID"] ?? "Unknown"}
              </div>
            </div>
            <div className="aircraft-block">
              <div className="aircraft-label">Flight Date</div>
              <div className="aircraft-id">
                {parsedLogfile.preamble["Local Time"] ?? "Unknown"}
              </div>
            </div>
          </div>
          <details className="details aircraft-details">
            <summary>
              <span>File Details</span>
              <span className="details-meta">Tap to expand</span>
            </summary>
            <table className="details-table">
              <tbody>
                {Object.entries(parsedLogfile.preamble).map(([name, value]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <p className="hint">
          Scroll or pinch to zoom. Shift + drag to select a timespan.
        </p>

        {sortedLogGroups.map((sortedLogGroup) => (
          <LogChart
            key={sortedLogGroup.group}
            logGroup={sortedLogGroup}
            xLimits={parsedLogfile.calculated.limits.x}
          />
        ))}
      </main>
    </div>
  );
};

export default ViewLogPage;
