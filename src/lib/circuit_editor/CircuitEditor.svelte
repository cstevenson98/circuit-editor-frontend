<script lang="ts">
    import {
        SvelteFlow,
        Controls,
        Background,
        BackgroundVariant,
        ConnectionMode,
        ConnectionLineType,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import ElectricalComponent from "$lib/circuit_editor/ElectricalComponent.svelte";
    import type { CircuitEditorState } from "$lib/circuit_editor/CircuitEditorState.svelte";

    type Props = {
        circuitState: CircuitEditorState;
    };

    let { circuitState }: Props = $props();

    // Register custom node types
    const nodeTypes = {
        electrical: ElectricalComponent,
    };
</script>

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
    fitViewOptions={{
        padding: 0.2,
    }}
>
    <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
    <Controls />
</SvelteFlow>

<style>
    /* Custom styling for SvelteFlow connection lines (new connections being drawn) */
    :global(.svelte-flow__connection-line) {
        stroke: #000000 !important;
        stroke-width: 3px !important;
    }

    /* Custom styling for SvelteFlow edge text */
    :global(.svelte-flow__edge-text) {
        font-size: 12px !important;
        font-weight: 600 !important;
        fill: #374151 !important;
    }

    /* Custom styling for SvelteFlow controls */
    :global(.svelte-flow__controls) {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
    }

    /* Custom styling for SvelteFlow control buttons */
    :global(.svelte-flow__controls-button) {
        background: white !important;
        border: none !important;
        color: #374151 !important;
        width: 32px !important;
        height: 32px !important;
    }

    :global(.svelte-flow__controls-button:hover) {
        background: #f3f4f6 !important;
        color: #111827 !important;
    }

    /* Remove global edge styling - colors now come from backend API */
    /* Individual edges will have their own style attribute with colors */
</style>
