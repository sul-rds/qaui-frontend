<script>
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
	<p>Not logged in</p>
{/if}
