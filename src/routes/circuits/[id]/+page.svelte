<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		ConnectionMode,
		ConnectionLineType,
	} from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";
	import { apiClient, type Circuit } from "$lib/api/client";

	import ElectricalComponent from "$lib/circuit_editor/ElectricalComponent.svelte";
	import {
		CircuitEditorState,
		type ComponentType,
	} from "$lib/circuit_editor/CircuitEditorState.svelte";
	import CircuitEditorHeader from "$lib/circuit_editor/CircuitEditorHeader.svelte";

	// Register custom node types
	const nodeTypes = {
		electrical: ElectricalComponent,
	};

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
	let saving = $state(false);

	// Initialize circuit editor state
	const circuitState = new CircuitEditorState();

	// Load circuit data on mount
	onMount(async () => {
		try {
			circuit = await apiClient.getCircuit(circuitId());
			// Load flow data if it exists
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
	});

	async function saveCircuit() {
		if (!circuit) return;
		console.log("Saving circuit:", circuit);

		try {
			saving = true;
			// Export circuit data using the new API conversion method
			const apiModel = circuitState.exportToApi();
			console.log("Saving circuit:", apiModel);

			// Update flow data via API
			await apiClient.updateCircuitWithFlowData(circuit.id, apiModel);

			alert("Circuit saved successfully!");
		} catch (err) {
			console.error("Error saving circuit:", err);
			alert("Failed to save circuit. Please try again.");
		} finally {
			saving = false;
		}
	}

	function analyzeCircuit() {
		if (!circuit) return;

		// Validate circuit and send to analysis API
		const validation = circuitState.validateCircuit();
		const circuitData = circuitState.exportCircuit();

		console.log("Circuit validation:", validation);
		console.log("Analyzing circuit:", circuitData);

		if (!validation.isValid) {
			alert(`Circuit has errors: ${validation.errors.join(", ")}`);
			return;
		}

		if (validation.warnings.length > 0) {
			console.warn("Circuit warnings:", validation.warnings);
		}

		// TODO: Send to analysis API when available
		alert("Circuit analysis started! (Analysis API not yet implemented)");
	}

	function addComponent(componentType: ComponentType) {
		const nodeId = circuitState.addComponent(componentType);
		console.log(`Added ${componentType} component with ID: ${nodeId}`);
		console.log("Circuit stats:", circuitState.getCircuitStats());
	}
</script>

<!-- Header -->
{#if loading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
			></div>
			<p class="mt-2 text-sm text-gray-600">Loading circuit...</p>
		</div>
	</div>
{:else if error}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div class="mx-auto h-12 w-12 text-red-500">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>
			<h3 class="mt-2 text-sm font-medium text-gray-900">
				Error loading circuit
			</h3>
			<p class="mt-1 text-sm text-gray-500">{error}</p>
			<button
				onclick={() => window.location.reload()}
				class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>Retry</button
			>
		</div>
	</div>
{:else if circuit}
	<CircuitEditorHeader
		circuitName={circuit.name}
		{saveCircuit}
		{analyzeCircuit}
		{addComponent}
	/>
	<!-- Main Editor -->
	<main class="relative flex-grow bg-gray-50">
		<div class="h-full">
			<SvelteFlow
				bind:nodes={circuitState.nodes}
				bind:edges={circuitState.edges}
				{nodeTypes}
				connectionMode={ConnectionMode.Loose}
				defaultEdgeOptions={{
					type: "step",
					// Remove static styling - colors now come from backend
				}}
				connectionLineType={ConnectionLineType.Step}
				snapGrid={[20, 20]}
				fitView
			>
				<Controls />
				<Background
					variant={BackgroundVariant.Dots}
					gap={20}
					size={1}
				/>
			</SvelteFlow>
		</div>
	</main>

	<!-- Footer -->
	<footer class="min-h-16 flex-shrink-0 border-t bg-white">
		<div class="mx-auto max-w-7xl px-4 py-2">
			<p class="text-center text-xs text-gray-500">
				Click component buttons to add to editor • Drag components to
				position • Connect with handles
				{#if saving}
					• <span class="text-blue-600">Saving...</span>
				{/if}
			</p>
		</div>
	</footer>
{/if}

<style>
	/* Custom styling for SvelteFlow connection lines (new connections being drawn) */
	:global(.svelte-flow__connection-line) {
		stroke: #000000 !important;
		stroke-width: 3px !important;
	}

	/* Remove global edge styling - colors now come from backend API */
	/* Individual edges will have their own style attribute with colors */
</style>
