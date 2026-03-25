<script>
	import { Button, TextInput } from 'carbon-components-svelte';

	import { pb, login } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let isLoggedIn = $state(pb.authStore.isValid);
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function doLogin() {
		error = '';
		loading = true;

		try {
			const loginResult = await login(email, password);
			if (loginResult.success) {
				goto(resolve('/'));
			} else {
				error = loginResult.error || 'Unknown error';
				isLoggedIn = pb.authStore.isValid;
			}
		} catch (e) {
			console.error(e);
			error = 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function doLogout() {
		await pb.authStore.clear();
		goto(resolve('/login'));
		isLoggedIn = pb.authStore.isValid;
		error = 'Successfully logged out';
	}
</script>

<section>
	{#if isLoggedIn}
		<p>Logged in as {pb.authStore.record?.email}</p>
		<Button onclick={doLogout} size="small">Logout</Button>
	{:else}
		<form onsubmit={doLogin}>
			<TextInput
				inline
				light
				labelText="Email"
				type="email"
				placeholder="Enter email..."
				required
				disabled={loading}
				bind:value={email}
			/>
			<TextInput
				inline
				light
				labelText="Password"
				type="password"
				placeholder="Enter password..."
				required
				disabled={loading}
				bind:value={password}
			/>
			<Button type="submit" disabled={loading} size="small">
				{loading ? 'Logging in...' : 'Login'}
			</Button>
			{#if error}<p class="error">{error}</p>{/if}
		</form>
	{/if}
</section>

<style>
	.error {
		color: red;
		margin-top: 1rem;
	}

	section {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 500px;
	}

	form {
		align-items: flex-end;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;

		& :global(.bx--text-input-wrapper) {
			width: 100%;
		}
	}
</style>
