<script>
  function onSubmitLogfile() {
    // save data into state
    // nav to viewlog to display
  }
</script>

<label for="logfile"><b>Provide a log file</b></label>
<input
  type="file"
  id="logfile"
  name="logfile"
  accept="text/csv"
  onchange={onSubmitLogfile}
/>

<label for="logname"><b>... or enter filename if file is in github</b></label>

<form action="/viewlog" method="get">
  <div style:display="flex">
    <input type="text" id="logname" name="logname" required />
    <input type="submit" value="go" />
  </div>
</form>
