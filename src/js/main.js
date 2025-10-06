import '../styles/tailwind.css';

const app = document.getElementById('app');
app.textContent = 'Welcome to LiwuLume - Bible App';

if (import.meta.hot) {
  import.meta.hot.accept();
}
