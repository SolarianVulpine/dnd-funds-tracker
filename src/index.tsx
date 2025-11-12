import { createRoot } from "react-dom/client";

export function App() {
  return <h1>Hello Atlas</h1>;
}

// Find div with an ID attribte of "root" fromthe index.html
const container = document.getElementById("root") as HTMLElement;
// Make that div container the root element for the react application
const root = createRoot(container);
// Render the App component into "root" div
root.render(<App />);