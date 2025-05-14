import type { PageLoad } from "./$types";
import { parseLogfile } from "$lib/cgr30Parse.js";
import { fileStore } from "$lib/stores/fileStore";
import { get } from "svelte/store";

export const load: PageLoad = async ({ params }) => {
  const file = get(fileStore);
  if (!file) {
    return { parsedLogfile: null };
  }

  const parsedLogfile = await parseLogfile(file);
  return { parsedLogfile };
};
