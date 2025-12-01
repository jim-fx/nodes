<span class="spinner"></span>

<style>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
  .spinner::before {
    content: "";
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    animation: spin 1s linear infinite;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='icon icon-tabler icons-tabler-outline icon-tabler-loader-2'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12 3a9 9 0 1 0 9 9' /%3E%3C/svg%3E");
    background-size: cover;
    z-index: 2;
  }
</style>
