<script>
	import { setContext } from 'svelte';
	import {
		Header,
		HeaderUtilities,
		HeaderActionLink,
		SkipToContent,
		Content
	} from 'carbon-components-svelte';
	import UserAvatarFilledAlt from 'carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte';

	import '$lib/styles/carbon-theming.css';
	import '$lib/styles/styles.css';
	import '@fontsource-variable/mulish';
	import favicon from '$lib/assets/sul.41x40.png';

	let { children } = $props();

	let platformName = $state('Structured Data from Images - QA UI');
	setContext('header', {
		get: () => platformName,
		set: (value) => {
			platformName = 'Structured Data from Images - QA UI';
			if (value && value.every(Boolean)) {
				platformName += ' → ' + value.join(' → ');
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="version" content={__COMMIT_HASH__} />
	<meta name="dcterms.modified" content={__BUILD_TIME__} />
</svelte:head>

<Header companyName="SUL-RDS" {platformName} href="/">
	<img slot="company" src={favicon} alt="Stanford University Libraries" class="sul-logo" />
	<svelte:fragment slot="skipToContent">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderActionLink icon={UserAvatarFilledAlt} href="/login"></HeaderActionLink>
	</HeaderUtilities>
</Header>

<Content>
	{@render children?.()}
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
			display: flex;
			flex-direction: column;
			gap: 1rem;
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
