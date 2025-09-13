<script lang="ts">
	import { page } from '$app/stores';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		ConnectionMode,
		ConnectionLineType
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import ElectricalComponent from '$lib/circuit_editor/ElectricalComponent.svelte';
	import {
		CircuitEditorState,
		type ComponentType
	} from '$lib/circuit_editor/CircuitEditorState.svelte.js';
	import CircuitEditorHeader from '$lib/circuit_editor/CircuitEditorHeader.svelte';

	// Register custom node types
	const nodeTypes = {
		electrical: ElectricalComponent
	};

	// Get network ID from params - using rune
	const networkId = $derived($page.params.id);

	// Mock network name - in real app would fetch from API
	const networkName = $derived(`Network ${networkId}`);

	// Initialize circuit editor state
	const circuitState = new CircuitEditorState();

	function saveNetwork() {
		// Export circuit data and save to server
		const circuitData = circuitState.exportCircuit();
		console.log('Saving network:', circuitData);
		alert('Network saved! (stub implementation)');
	}

	function analyzeNetwork() {
		// Validate circuit and send to analysis API
		const validation = circuitState.validateCircuit();
		const circuitData = circuitState.exportCircuit();

		console.log('Circuit validation:', validation);
		console.log('Analyzing network:', circuitData);

		if (!validation.isValid) {
			alert(`Circuit has errors: ${validation.errors.join(', ')}`);
			return;
		}

		if (validation.warnings.length > 0) {
			console.warn('Circuit warnings:', validation.warnings);
		}

		alert('Network analysis started! (stub implementation)');
	}

	function addComponent(componentType: ComponentType) {
		const nodeId = circuitState.addComponent(componentType);
		console.log(`Added ${componentType} component with ID: ${nodeId}`);
		console.log('Circuit stats:', circuitState.getCircuitStats());
	}
</script>

<!-- Header -->
<CircuitEditorHeader {networkName} {saveNetwork} {analyzeNetwork} {addComponent} />
<!-- Main Editor -->
<main class="relative flex-grow bg-gray-50">
	<div class="h-full">
		<SvelteFlow
			bind:nodes={circuitState.nodes}
			bind:edges={circuitState.edges}
			{nodeTypes}
			connectionMode={ConnectionMode.Loose}
			defaultEdgeOptions={{ type: 'step' }}
			connectionLineType={ConnectionLineType.Step}
			snapGrid={[20, 20]}
			fitView
		>
			<Controls />
			<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
		</SvelteFlow>
	</div>
</main>

<!-- Footer -->
<footer class="min-h-16 flex-shrink-0 border-t bg-white">
	<div class="mx-auto max-w-7xl px-4 py-2">
		<p class="text-center text-xs text-gray-500">
			Click component buttons to add to editor • Drag components to position • Connect with handles
		</p>
	</div>
</footer>
