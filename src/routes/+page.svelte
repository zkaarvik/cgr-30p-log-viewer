<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { flightStore, selectedFlightId } from "$lib/stores/flightStore";
  import { buildFlightGroups } from "$lib/flightUtils";

  const onSubmitLogfile = async (event: Event) => {
    const target = event?.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);

    const flights = await buildFlightGroups(files);
    flightStore.set(flights);
    selectedFlightId.set(null);
    goto(`${base}/flights`);
  };
</script>

<section class="hero">
  <div class="hero-copy">
    <h2>Upload CGR-30P logs</h2>
    <p>
      Upload a folder of CSVs to group flights automatically. Review engine,
      electrical, and performance traces with quick zoom and pan.
    </p>
  </div>

  <div class="card">
    <label class="field-label" for="logfiles">Log files (CSV)</label>
    <input
      class="file-input"
      type="file"
      id="logfiles"
      name="logfiles"
      accept=".csv,text/csv"
      multiple
      onchange={onSubmitLogfile}
    />
    <label class="field-label" for="logfolder">Or choose a folder</label>
    <input
      class="file-input"
      type="file"
      id="logfolder"
      name="logfolder"
      accept=".csv,text/csv"
      multiple
      webkitdirectory
      onchange={onSubmitLogfile}
    />
    <p class="hint">Accepted format: .csv files. Files stay in your browser.</p>
  </div>
</section>

<!-- TODO -->
<!-- <label for="logname"><b>... or enter filename if file is in github</b></label>

<form action="/viewlog" method="get">
  <div style:display="flex">
    <input type="text" id="logname" name="logname" required />
    <input type="submit" value="go" />
  </div>
</form> -->

<style>
  .hero {
    display: grid;
    grid-template-columns: minmax(240px, 1.1fr) minmax(240px, 1fr);
    gap: 28px;
    align-items: center;
  }

  .hero-copy h2 {
    margin: 0 0 10px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .hero-copy p {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  .card {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: var(--shadow);
  }

  .field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .file-input {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    border: 1px dashed var(--panel-border);
    background: #f8fafc;
    font-size: 14px;
  }

  .hint {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--muted);
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
    }
  }
</style>
