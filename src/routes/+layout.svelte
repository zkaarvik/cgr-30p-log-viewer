<script>
  let { children } = $props();

  export const prerender = true;
</script>

<h1>CGR-30P Log Viewer</h1>

{@render children()}
