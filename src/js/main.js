import '../styles/main.css';

const app = document.getElementById('app');
app.textContent = 'Welcome to LiwuLume - Bible App';

// Hot Module Replacement (HMR) - Accept updates for this module

if (import.meta.hot) {
  import.meta.hot.accept();
}
