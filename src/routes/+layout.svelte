<script>
	import { setContext } from 'svelte';
	import {
		Header,
		HeaderUtilities,
		HeaderActionLink,
		SkipToContent,
		Content
	} from 'carbon-components-svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import UserAvatarFilledAlt from 'carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte';

	import '$lib/styles/carbon-theming.css';
	import '$lib/styles/styles.css';
	import '@fontsource-variable/mulish';
	import favicon from '$lib/assets/sul.41x40.png';

	let { children } = $props();

	const homeLink = [{ name: 'Structured Data from Images - QA UI', link: '/' }];

	let breadcrumbs = $state(homeLink);
	setContext('breadcrumbs', {
		get: () => breadcrumbs,
		set: (/** @type {{link: string, name: string}[]} */ value) => {
			if (value && value.every((crumb) => crumb.name)) {
				breadcrumbs = [...homeLink, ...value];
			} else {
				breadcrumbs = homeLink;
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="version" content={__COMMIT_HASH__} />
	<meta name="dcterms.modified" content={__BUILD_TIME__} />
</svelte:head>

<Header companyName="SUL-RDS">
	<svelte:fragment slot="platform">
		<!--eslint-disable-next-line svelte/no-at-html-tags -->
		{@html breadcrumbs
			.map((crumb) => `<a href=${crumb.link}>${crumb.name}</a>`)
			.join('<span> → </span>')}
	</svelte:fragment>
	<img slot="company" src={favicon} alt="Stanford University Libraries" class="sul-logo" />
	<svelte:fragment slot="skipToContent">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderActionLink icon={Search} href="/search"></HeaderActionLink>
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
