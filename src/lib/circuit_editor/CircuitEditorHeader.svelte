<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import type {
		ComponentTypeLabel,
		CircuitEditorState,
	} from "$lib/circuit_editor/CircuitEditorState.svelte";

	type Props = {
		circuitState: CircuitEditorState;
	};

	let { circuitState }: Props = $props();

	function goBack() {
		goto(resolve("/"));
	}

	// Component types for the toolbar
	const componentTypes: ComponentTypeLabel[] = [
		{ type: "voltage", label: "V", name: "Voltage Source" },
		{ type: "resistor", label: "R", name: "Resistor" },
		{ type: "capacitor", label: "C", name: "Capacitor" },
		{ type: "inductor", label: "L", name: "Inductor" },
	] as const;
</script>

<header class="min-h-16 flex-shrink-0 border-b bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 py-4">
		<div class="flex items-center justify-between">
			<!-- Left side: Back button and title -->
			<div class="flex items-center gap-4">
				<button
					onclick={goBack}
					class="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back
				</button>
				<h1 class="text-2xl font-bold tracking-tight text-gray-900">
					Editing Circuit "{circuitState.circuit?.name ||
						"Unknown Circuit"}"
				</h1>
			</div>

			<!-- Right side: Action buttons and component toolbar -->
			<div class="flex items-center gap-4">
				<!-- Save and Analyze buttons -->
				<div class="flex gap-2">
					<button
						onclick={() => circuitState.saveCircuit()}
						disabled={circuitState.saving}
						class="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
					>
						{circuitState.saving ? "Saving..." : "Save"}
					</button>
					<button
						onclick={() => circuitState.analyzeCircuit()}
						class="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
					>
						Analyze
					</button>
				</div>

				<!-- Component toolbar -->
				<div class="ml-4 flex gap-2 border-l pl-4">
					{#each componentTypes as component (component.type)}
						<button
							onclick={() =>
								circuitState.addComponent(component.type)}
							class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-gray-100 font-bold text-gray-700 transition-colors hover:bg-gray-200"
							title={component.name}
						>
							{component.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</header>
