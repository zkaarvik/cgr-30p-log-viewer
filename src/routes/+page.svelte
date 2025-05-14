<script lang="ts">
  import { goto } from "$app/navigation";
  import { fileStore } from "$lib/stores/fileStore";

  const onSubmitLogfile = async (event: Event) => {
    const target = event?.target as HTMLInputElement;
    const logfile = target.files?.[0];

    fileStore.set(logfile ?? null);
    goto("/viewlog");
  };
</script>

<label for="logfile"><b>Provide a log file</b></label>
<input
  type="file"
  id="logfile"
  name="logfile"
  accept="text/csv"
  onchange={onSubmitLogfile}
/>

<!-- TODO -->
<!-- <label for="logname"><b>... or enter filename if file is in github</b></label>

<form action="/viewlog" method="get">
  <div style:display="flex">
    <input type="text" id="logname" name="logname" required />
    <input type="submit" value="go" />
  </div>
</form> -->
