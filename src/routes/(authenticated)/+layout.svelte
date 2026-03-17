<script>
	import { resolve } from '$app/paths';
	import { pb } from '$lib/pocketbase';
	let { children } = $props();
</script>

<svelte:head>
	<title>Not authenticated</title>
	<meta name="description" content="" />
</svelte:head>

{#if pb.authStore.isValid}
	{@render children?.()}
{:else}
	<section>
		<p>
			You must be <a href={resolve('/login')}>logged in</a> to view projects.
		</p>
	</section>
{/if}
