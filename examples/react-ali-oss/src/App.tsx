import { useState } from 'react';

import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <img src="https://search-operate.cdn.bcebos.com/e8cbce1d53432a6950071bf26b640e2b.gif" />
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="src/assets/react.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/vite.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <img src="src/assets/2.png" style={{ width: 1200 }} />
    </>
  );
}

export default App;
