# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a VSCode extension that provides a grid-based preview of image and SVG assets. The extension follows the standard VSCode extension architecture with these key components:

- **Extension Entry Point** (`src/extension.ts`): Registers the main command and handles activation/deactivation
- **File System Provider** (`src/fileSystemProvider.ts`): Handles asset discovery and path resolution, supporting both absolute and workspace-relative paths
- **Webview Panel Provider** (`src/webviewPanelProvider.ts`): Creates and manages the webview UI with embedded HTML/CSS/JS
- **Type Definitions** (`src/types.ts`): TypeScript interfaces for AssetFile and WebviewMessage

The extension uses VSCode's webview API to display assets in a custom HTML interface with directory grouping, filtering, and click-to-open functionality.

## Key Patterns

- **Asset Discovery**: Uses `vscode.workspace.findFiles()` with glob patterns to locate supported file types
- **Configuration**: Reads from `vs-assets-viewer.path` setting, falls back to workspace root
- **Webview Communication**: Uses postMessage API for bidirectional communication between extension and webview
- **File Opening**: Delegates to VSCode's built-in file opening commands

## Development Commands

```bash
# Install dependencies
pnpm install

# Compile TypeScript
pnpm run compile

# Watch mode for development
pnpm run watch

# Lint code
pnpm run lint

# Format code
pnpm run format

# Build for production (using esbuild)
pnpm run build

# Package extension
pnpm run package
```

## Testing

Run tests with:
```bash
pnpm run test
```

## Supported File Types

The extension supports these asset types:
- Images: .png, .jpg, .jpeg, .gif, .bmp, .webp
- Vectors: .svg

Files are automatically excluded from node_modules directories during discovery.