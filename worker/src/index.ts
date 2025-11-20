import { faker } from '@faker-js/faker';

export default {
	async fetch() {
		const count = faker.number.int({ min: 3, max: 8 });

		const items = Array.from({ length: count }, () => ({
			id: crypto.randomUUID(),
			title: faker.lorem.sentence(),
			description: faker.lorem.paragraph(),
		}));

		return new Response(JSON.stringify(items), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
} satisfies ExportedHandler<Env>;
