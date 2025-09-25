<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { apiClient, type Circuit } from "$lib/api/client";

	import { CircuitEditorState } from "$lib/circuit_editor/CircuitEditorState.svelte";
	import CircuitEditorHeader from "$lib/circuit_editor/CircuitEditorHeader.svelte";
	import CircuitEditor from "$lib/circuit_editor/CircuitEditor.svelte";
	import LoadingComponent from "$lib/components/LoadingComponent.svelte";
	import ErrorComponent from "$lib/components/ErrorComponent.svelte";

	// Get circuit ID from params - using rune
	const circuitId = $derived(() => {
		const id = $page.params.id;
		if (!id) throw new Error("Circuit ID is required");
		return parseInt(id, 10);
	});

	// Circuit state
	let circuit: Circuit | null = $state(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Initialize circuit editor state
	const circuitState = new CircuitEditorState();

	// Load circuit data function
	async function loadCircuit() {
		try {
			loading = true;
			error = null;
			circuit = await apiClient.getCircuit(circuitId());
			// Set circuit in state and load flow data if it exists
			circuitState.setCircuit(circuit);
			if (circuit.svelte_flow_model) {
				circuitState.importFromApi(circuit.svelte_flow_model);
			}
		} catch (err) {
			error =
				err instanceof Error ? err.message : "Failed to load circuit";
			console.error("Error loading circuit:", err);
		} finally {
			loading = false;
		}
	}

	// Retry function for error component
	function retry() {
		loadCircuit();
	}

	// Load circuit data on mount
	onMount(() => {
		loadCircuit();
	});
</script>

<!-- Header -->
{#if loading}
	<LoadingComponent message="Loading circuit..." />
{:else if error}
	<ErrorComponent
		title="Error loading circuit"
		message={error}
		retryCallback={retry}
		retryText="Retry"
	/>
{:else if circuit}
	<CircuitEditorHeader {circuitState} />
	<!-- Main Editor -->
	<main class="relative flex-grow bg-gray-50">
		<div class="h-full">
			<CircuitEditor {circuitState} />
		</div>
	</main>

	<!-- Footer -->
	<footer class="min-h-16 flex-shrink-0 border-t bg-white">
		<div class="mx-auto max-w-7xl px-4 py-2">
			<p class="text-center text-xs text-gray-500">
				Click component buttons to add to editor • Drag components to
				position • Connect with handles
				{#if circuitState.saving}
					• <span class="text-blue-600">Saving...</span>
				{/if}
			</p>
		</div>
	</footer>
{/if}
