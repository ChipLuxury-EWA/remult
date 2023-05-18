import { browser } from "$app/environment";
import type { FindOptions, Repository } from "remult";
import { writable } from "svelte/store";

// TODO: move in remult repo
export const remultStore = <T>(repo: Repository<T>, initValues: T[] = []) => {
	const { subscribe, set, update } = writable<T[]>(initValues);

	return {
		subscribe,

		listen: (options?: FindOptions<T>) => {
			if (browser) {
				repo
					.liveQuery(options)
					.subscribe((info) => {
						set(info.items)
					})
			} else {
				throw new Error(`xxx.init() Too early!

You should do like: 
  let tasks = tasksStore<Task>(taskRepo, data.tasks)
  $: browser && tasks.init()
				`);
			}
		},
	};
}
