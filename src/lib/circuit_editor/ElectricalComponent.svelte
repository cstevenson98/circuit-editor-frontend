<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';

	export let data: {
		type: 'voltage' | 'resistor' | 'capacitor' | 'inductor';
		label?: string;
	};

	// Get the appropriate label for the component type
	function getComponentLabel(type: string): string {
		switch (type) {
			case 'voltage':
				return 'V';
			case 'resistor':
				return 'R';
			case 'capacitor':
				return 'C';
			case 'inductor':
				return 'L';
			default:
				return '?';
		}
	}

	// Get colors based on component type
	function getComponentColor(type: string): string {
		switch (type) {
			case 'voltage':
				return 'bg-red-500';
			case 'resistor':
				return 'bg-green-500';
			case 'capacitor':
				return 'bg-blue-500';
			case 'inductor':
				return 'bg-purple-500';
			default:
				return 'bg-gray-500';
		}
	}
</script>

<div
	class="electrical-component flex min-h-24 min-w-24 flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-4 shadow-sm"
>
	<!-- Left handle -->
	<Handle type="source" position={Position.Left} id="left" class="handle-left" />

	<!-- Component icon -->
	<div class="flex flex-col items-center gap-2">
		<!-- Simple SVG circle for now as requested -->
		<svg width="32" height="32" viewBox="0 0 32 32" class="component-icon">
			<circle cx="16" cy="16" r="12" class={`${getComponentColor(data.type)} fill-current`} />
		</svg>

		<!-- Component label -->
		<span class="text-sm font-bold text-gray-700">
			{data.label || getComponentLabel(data.type)}
		</span>
	</div>

	<!-- Right handle -->
	<Handle type="source" position={Position.Right} id="right" class="handle-right" />
</div>

<style>
	.electrical-component {
		position: relative;
	}

	:global(.handle-left),
	:global(.handle-right) {
		width: 8px;
		height: 8px;
		background: #374151;
		border: 2px solid white;
	}

	:global(.handle-left) {
		left: -4px;
	}

	:global(.handle-right) {
		right: -4px;
	}
</style>
