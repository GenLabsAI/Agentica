import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react'
import "./index.css"
import App from "./App"
import "../node_modules/@vscode/codicons/dist/codicon.css"
import "./codicon-custom.css" // kilocode_change

import { getHighlighter } from "./utils/highlighter"

posthog.init("phc_NoawSGU9FSXBbaDIGjllpmHI3I8ixeOMBwwJw6VlcQG", {
  api_host: "https://us.i.posthog.com",
  person_profiles: 'always'
});

// Initialize Shiki early to hide initialization latency (async)
getHighlighter().catch((error: Error) => console.error("Failed to initialize Shiki highlighter:", error))

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PostHogProvider client={posthog}>
			<App />
		</PostHogProvider>
	</StrictMode>,
)
