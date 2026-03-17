import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useFileStore } from "$lib/fileStore";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { setFile } = useFileStore();

  const onSubmitLogfile = (event: ChangeEvent<HTMLInputElement>) => {
    const logfile = event.target.files?.[0] ?? null;
    setFile(logfile);
    navigate("/viewlog");
  };

  return (
    <section className="hero">
      <div className="hero-copy">
        <h2>Upload a CGR-30P log</h2>
        <p>
          Drag in a CSV and review engine, electrical, and performance traces
          with quick zoom and pan.
        </p>
      </div>

      <div className="card">
        <label className="field-label" htmlFor="logfile">
          Log file (CSV)
        </label>
        <input
          className="file-input"
          type="file"
          id="logfile"
          name="logfile"
          accept="text/csv"
          onChange={onSubmitLogfile}
        />
        <p className="hint">Accepted format: text/csv. Files stay in your browser.</p>
      </div>
    </section>
  );
};

export default HomePage;
