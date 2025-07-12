// Main application initialization
// Clean Architecture - Presentation Layer

export function initializeApp() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="container">
            <header>
                <h1>🚀 MDSG - Markdown Site Generator</h1>
                <p>Create beautiful markdown websites with GitHub integration</p>
            </header>
            <main>
                <div class="getting-started">
                    <h2>Getting Started</h2>
                    <p>This project is under development following Clean Architecture principles.</p>
                    <ul>
                        <li>✅ Project structure created</li>
                        <li>🔄 GitHub OAuth integration (coming soon)</li>
                        <li>🔄 Markdown editor with live preview (coming soon)</li>
                        <li>🔄 Custom domain support (coming soon)</li>
                    </ul>
                </div>
            </main>
        </div>
    `;
}
