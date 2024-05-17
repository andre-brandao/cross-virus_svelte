<script>
  import { SidebarClose, CircleX } from "lucide-svelte";
  import { onMount, onDestroy } from 'svelte';
  let isOpen = false;
  /**
	 * @type {HTMLDivElement}
	 */
  let dialogRef;

  export let config = {
    title: 'Modal Title Placeholder',
    openButtonText: 'Open Modal',
  }

  function toggleDialog() {
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => dialogRef.focus(), 0);
    }
  }

  function closeDialog() {
    isOpen = false;
  }

  // Handling Escape key to close the dialog
  /**
	 * @param {{ key: string; }} event
	 */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeDialog();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    z-index: 10;
  }

  .backdrop.open {
    display: block;
  }

  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%; /* Responsive width */
    /* max-width: 900px; */
    padding: 20px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto; /* Adds scroll to the dialog if content exceeds its max-height */
    max-height: 90vh; /* Prevents the dialog from being too tall */
    z-index: 20;
  }
</style>

<button on:click={toggleDialog} 	class="group flex justify-center items-center text-center rounded-md p-2 transition ease-in-out bg-secondary text-white hover:text-black hover:bg-primary hover:shadow-md hover:shadow-primary px-5"
>{config.openButtonText}</button>

{#if isOpen}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="backdrop open" on:click={closeDialog}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="dialog rounded-lg" on:click|stopPropagation bind:this={dialogRef} tabindex="-1">
      <div class='flex justify-between p-1 bg-slate-300 rounded mb-2'>
        <span class="font-bold text-lg">{config.title}</span>
        <button on:click={toggleDialog} class='rounded-full bg-red-300 hover:bg-red-600'>
          <CircleX />
        </button>
      </div>
      <div>
        <slot>This is a modal</slot>
      </div>
    </div>
  </div>
{/if}
