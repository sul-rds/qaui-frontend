<script>
	import {
		Header,
		HeaderUtilities,
		HeaderActionLink,
		SkipToContent,
		Content,
		Grid,
		Row,
		Column
	} from 'carbon-components-svelte';
	import UserAvatarFilledAlt from 'carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte';

	import '$/carbon-theming.css';
	import '@fontsource-variable/mulish';
	import favicon from '$lib/assets/sul.41x40.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header company="SUL-RDS" platformName="Structured Data from Images - QA UI" href="/">
	<img slot="company" src={favicon} alt="Stanford University Libraries" class="sul-logo" />
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderActionLink icon={UserAvatarFilledAlt} href="/login"></HeaderActionLink>
	</HeaderUtilities>
</Header>

<Content>
	<section>
		{@render children?.()}
	</section>
</Content>

<style>
	:global {
		body {
			background-color: #efefef;
			font-family: 'Mulish Variable', sans-serif;
		}

		#main-content {
			height: calc(100vh - 3rem);
			overflow: hidden;
		}

		section {
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow: hidden;
		}

		a {
			color: var(--primary);
		}
	}

	.sul-logo {
		height: 30px;
		margin: 0 1rem 0 0;
		vertical-align: text-bottom;
	}
</style>
