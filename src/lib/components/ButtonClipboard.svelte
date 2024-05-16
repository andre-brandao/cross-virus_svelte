<!-- CopyButton.svelte -->
<script>
    /**
	 * @type {string}
	 */
     export let text = 'Hello, world!';
    let copied = false;
  
    function copyText() {
      navigator.clipboard.writeText(text).then(() => {
        copied = true;
        setTimeout(() => {
          copied = false;
        }, 1000);
      }).catch(err => {
        console.error('Failed to copy text:', err);
      });
    }
  </script>
  
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-1 rounded text-nowrap w-fit"
    on:click={copyText}
  >
    {copied ? 'Copied!' : text}
  </button>
  