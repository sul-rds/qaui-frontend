<script>
	import { Button } from 'carbon-components-svelte';
	import Login from 'carbon-icons-svelte/lib/Login.svelte';
	import { pb } from '$lib/pocketbase';

	import Projects from '$components/Projects.svelte';

	let isLoggedIn = $state(pb.authStore.isValid);
</script>

<h1>Structured Data from Images - QA UI</h1>

<section>
	{#if !isLoggedIn}
		<p>
			<Button href="/login" icon={Login} size="small">Login to get started...</Button>
		</p>
	{:else}
		<p>Logged in as {pb.authStore.record?.email}</p>

		<Projects />
	{/if}
</section>

<style>
	section {
		margin: 1rem 0;
	}
</style>
