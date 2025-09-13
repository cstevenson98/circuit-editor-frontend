<script lang="ts">
	import { goto } from '$app/navigation';

	// Mock data for networks - in real app this would come from API
	let networks = [
		{ id: 1, name: 'Simple RC Circuit' },
		{ id: 2, name: 'RLC Oscillator' },
		{ id: 3, name: 'Voltage Divider' }
	];

	function editNetwork(id: number) {
		goto(`/networks/${id}`);
	}

	function deleteNetwork(id: number) {
		networks = networks.filter((n) => n.id !== id);
	}
</script>

<!-- Header -->
<header class="border-b bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 py-6">
		<h1 class="text-3xl font-bold tracking-tight text-gray-900">Select a Network</h1>
	</div>
</header>

<!-- Main Content -->
<main class="flex-1 bg-gray-50 px-4 py-8">
	<div class="mx-auto max-w-7xl">
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each networks as network (network.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<h3 class="mb-4 text-lg font-semibold text-gray-900">{network.name}</h3>
					<div class="flex gap-2">
						<button
							onclick={() => editNetwork(network.id)}
							class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
						>
							Edit
						</button>
						<button
							onclick={() => deleteNetwork(network.id)}
							class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>

<!-- Footer -->
<footer class="border-t bg-white">
	<div class="mx-auto max-w-7xl px-4 py-4">
		<p class="text-center text-sm text-gray-500">Circuit Editor - Placeholder Footer</p>
	</div>
</footer>
