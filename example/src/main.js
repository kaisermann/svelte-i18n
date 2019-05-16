import App from './App.svelte';
import './i18n.js'

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;