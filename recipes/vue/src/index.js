import { createApp } from 'vue';
import App from './App.vue';

const render = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);

  createApp(App).mount(el)
}

render();
