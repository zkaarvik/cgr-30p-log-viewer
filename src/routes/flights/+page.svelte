<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { flightStore, selectedFlightId } from "$lib/stores/flightStore";

  const formatDate = (flightDate: string) => {
    const parsed = new Date(flightDate);
    if (Number.isNaN(parsed.getTime())) return flightDate;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(parsed);
  };

  const selectFlight = (id: string) => {
    selectedFlightId.set(id);
    goto(`${base}/viewlog`);
  };
</script>

<section class="flights">
  <div class="header">
    <div>
      <h2>Select a flight</h2>
      <p>Choose a flight to view its charts.</p>
    </div>
    <button class="secondary" on:click={() => goto(`${base}/`)}>
      Upload more logs
    </button>
  </div>

  {#if $flightStore.length === 0}
    <div class="empty">
      <p>No flights loaded yet.</p>
      <button on:click={() => goto(`${base}/`)}>Upload a folder</button>
    </div>
  {:else}
    <div class="table-wrap">
      <table class="flight-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Date</th>
            <th>Aircraft</th>
            <th>Files</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each $flightStore as flight}
            <tr>
              <td class="flight-cell">Flight {flight.flightNumber}</td>
              <td>{formatDate(flight.flightDate)}</td>
              <td>{flight.aircraftId ?? "Aircraft Unknown"}</td>
              <td>
                {flight.files.length} file{flight.files.length === 1 ? "" : "s"}
              </td>
              <td>
                <div class="file-tags">
                  {#each flight.files as file}
                    <span class="file-tag">{file.suffix ?? "CSV"}</span>
                  {/each}
                </div>
              </td>
              <td class="actions">
                <button class="primary" on:click={() => selectFlight(flight.id)}>
                  View charts
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  .flights {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  h2 {
    margin: 0 0 6px;
    font-size: 26px;
  }

  p {
    margin: 0;
    color: var(--muted);
  }

  .table-wrap {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .flight-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead th {
    text-align: left;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    background: rgba(16, 24, 38, 0.04);
    padding: 12px 16px;
  }

  tbody td {
    padding: 14px 16px;
    border-top: 1px solid rgba(16, 24, 38, 0.06);
    vertical-align: middle;
  }

  tbody tr:hover {
    background: rgba(31, 111, 235, 0.05);
  }

  .flight-cell {
    font-weight: 600;
  }

  .actions {
    text-align: right;
    white-space: nowrap;
  }

  .file-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .file-tag {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px dashed var(--panel-border);
    color: var(--muted);
  }

  button {
    border: none;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  button.primary {
    background: var(--accent);
    color: white;
  }

  button.secondary {
    background: rgba(31, 111, 235, 0.1);
    color: #1f4ed8;
  }

  .empty {
    background: var(--panel);
    border: 1px dashed var(--panel-border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  @media (max-width: 860px) {
    .table-wrap {
      overflow-x: auto;
    }

    .flight-table {
      min-width: 720px;
    }
  }
</style>
