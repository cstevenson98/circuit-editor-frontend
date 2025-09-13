<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";
	import { apiClient, type Circuit } from "$lib/api/client";

	// Reactive state for circuits
	let circuits: Circuit[] = $state([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Load circuits on mount
	onMount(async () => {
		try {
			circuits = await apiClient.getCircuits();
		} catch (err) {
			error =
				err instanceof Error ? err.message : "Failed to load circuits";
			console.error("Error loading circuits:", err);
		} finally {
			loading = false;
		}
	});

	function editCircuit(id: number) {
		goto(resolve(`/circuits/${id}`));
	}

	async function deleteCircuit(id: number) {
		try {
			await apiClient.deleteCircuit(id);
			circuits = circuits.filter((c) => c.id !== id);
		} catch (err) {
			console.error("Error deleting circuit:", err);
			alert("Failed to delete circuit. Please try again.");
		}
	}

	async function createNewCircuit() {
		const name = prompt("Enter circuit name:");
		if (!name) return;

		try {
			console.log("Creating circuit with name:", name);
			const newCircuit = await apiClient.createCircuit({ name });
			console.log("Successfully created circuit:", newCircuit);
			circuits = [...circuits, newCircuit];
			alert("Circuit created successfully!");
		} catch (err) {
			console.error("Error creating circuit:", err);
			if (err instanceof Error) {
				alert(`Failed to create circuit: ${err.message}`);
			} else {
				alert("Failed to create circuit. Please try again.");
			}
		}
	}
</script>

<!-- Header -->
<header class="border-b bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 py-6">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">
				Circuit Library
			</h1>
			<button
				onclick={createNewCircuit}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
			>
				New Circuit
			</button>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="flex-1 bg-gray-50 px-4 py-8">
	<div class="mx-auto max-w-7xl">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div
						class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
					></div>
					<p class="mt-2 text-sm text-gray-600">
						Loading circuits...
					</p>
				</div>
			</div>
		{:else if error}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="mx-auto h-12 w-12 text-red-500">
						<svg
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
					<h3 class="mt-2 text-sm font-medium text-gray-900">
						Error loading circuits
					</h3>
					<p class="mt-1 text-sm text-gray-500">{error}</p>
					<button
						onclick={() => window.location.reload()}
						class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>Retry</button
					>
				</div>
			</div>
		{:else if circuits.length === 0}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="mx-auto h-12 w-12 text-gray-400">
						<svg
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
					</div>
					<h3 class="mt-2 text-sm font-medium text-gray-900">
						No circuits found
					</h3>
					<p class="mt-1 text-sm text-gray-500">
						Get started by creating your first circuit.
					</p>
					<button
						onclick={createNewCircuit}
						class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>Create Circuit</button
					>
				</div>
			</div>
		{:else}
			<div
				class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each circuits as circuit (circuit.id)}
					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div class="mb-4">
							<h3 class="text-lg font-semibold text-gray-900">
								{circuit.name}
							</h3>
							{#if circuit.description}
								<p class="mt-1 text-sm text-gray-600">
									{circuit.description}
								</p>
							{/if}
							<p class="mt-2 text-xs text-gray-500">
								Updated: {new Date(
									circuit.updated_at,
								).toLocaleDateString()}
							</p>
						</div>
						<div class="flex gap-2">
							<button
								onclick={() => editCircuit(circuit.id)}
								class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
							>
								Edit
							</button>
							<button
								onclick={() => deleteCircuit(circuit.id)}
								class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<!-- Footer -->
<footer class="border-t bg-white">
	<div class="mx-auto max-w-7xl px-4 py-4">
		<p class="text-center text-sm text-gray-500">
			Circuit Editor - Placeholder Footer
		</p>
	</div>
</footer>
