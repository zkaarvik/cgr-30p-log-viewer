<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { error } from "@sveltejs/kit";

  const csvData = $state(page.state.logdata);
  const fileName = page.url.searchParams.get("logname");

  if (!csvData && !fileName) {
    // For now just go back to home
    goto("/");
  }

  // if fileName, fetch and use that data
  // else if csvData, use it directly
</script>

<b>Look a graph!</b><br />
csvData: {csvData ?? "null"}<br />
fileName: {fileName ?? "null"}
