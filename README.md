# Clarity - AI-Powered Terms of Service Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-17.0.2-blue)](https://reactjs.org/)

Clarity is a powerful browser extension that helps users understand complex Terms of Service and Privacy Policy documents through AI-powered analysis and summarization. Built with React, TypeScript, and modern web technologies, it provides instant insights into legal documents across multiple languages.

## ✨ Features

- **📄 Terms Analysis**: Automatically analyze Terms of Service and Privacy Policy documents
- **🔍 Instant Summaries**: Get AI-powered summaries of complex legal text
- **🌐 Multi-language Support**: Translate and analyze documents in multiple languages
- **💾 Chat History**: Save and manage your analysis history
- **🎯 Smart Detection**: Automatically detect policy documents on web pages
- **⚡ Real-time Processing**: Fast, efficient document processing
- **🔒 Privacy-Focused**: Local processing with optional cloud integration

## 🚀 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/terms-of-use-extension.git
   cd terms-of-use-extension
   ```

2. **Install dependencies**
   ```bash
   npm install

   npm exec playwright install
   ```

3. **Build the extension**
   ```bash
   # For Chrome
   npm run build:chrome
   
   # For Firefox
   npm run build:firefox
   
   # For Opera
   npm run build:opera
   
   # Build for all browsers
   npm run build
   ```

4. **Load the extension in your browser**
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `extension/chrome` folder
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", and select the `extension/firefox` folder
   - **Opera**: Go to `opera://extensions/`, enable "Developer mode", click "Load unpacked", and select the `extension/opera` folder

### Production Installation

Download the latest release from the [Releases page](https://github.com/your-username/terms-of-use-extension/releases) and install the appropriate file for your browser.

## 🛠️ Development

### Available Scripts

- `npm run dev:chrome` - Start development build for Chrome with hot reload
- `npm run dev:firefox` - Start development build for Firefox with hot reload
- `npm run dev:opera` - Start development build for Opera with hot reload
- `npm run build:chrome` - Build production version for Chrome
- `npm run build:firefox` - Build production version for Firefox
- `npm run build:opera` - Build production version for Opera
- `npm run build` - Build for all supported browsers
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

### Project Structure

```
├── source/                    # Source code
│   ├── Background/           # Background script and API
│   ├── ContentScript/        # Content script for page interaction
│   ├── Popup/               # Extension popup UI
│   │   ├── components/      # React components
│   │   │   ├── chat/       # Chat interface
│   │   │   ├── home/       # Home page
│   │   │   └── settings/   # Settings page
│   │   └── utils/          # Utility functions
│   ├── Options/            # Extension options page
│   ├── common/             # Shared utilities
│   │   ├── clarity/        # AI processing logic
│   │   ├── scrapper/       # Document scraping
│   │   └── types/          # TypeScript definitions
│   └── styles/             # Global styles
├── extension/              # Built extension files
├── views/                  # HTML templates
└── webpack.config.js       # Webpack configuration
```

### Key Components

- **Background Script**: Handles API communication and extension lifecycle
- **Content Script**: Detects and extracts policy documents from web pages
- **Popup Interface**: Main user interface with chat functionality
- **Options Page**: Extension settings and configuration
- **AI Processing**: Document analysis and summarization logic


### API Integration

The extension integrates with a backend API for advanced AI processing. Configure the API URL in your environment or update the `API_URL` constant in the content script.

## 📱 Browser Support

- **Chrome**: Version 138+
- **Firefox**: Latest version
- **Opera**: Version 36+

## 🎯 Usage

1. **Install the extension** in your preferred browser
2. **Navigate to any website** with Terms of Service or Privacy Policy
3. **Click the Clarity icon** in your browser toolbar
4. **Start a conversation** about the policy document
5. **Get instant insights** and summaries
6. **Save important findings** to your chat history

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and ESLint configuration
- Write tests for new features
- Update documentation as needed
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)
- Uses React and TypeScript for modern development
- Powered by AI for intelligent document analysis

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LogicalOgbonna/clarity/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LogicalOgbonna/clarity/discussions)
- **Email**: [arinze@gmail.com](mailto:arinze@gmail.com)

## 🔮 Roadmap


---

**Made with ❤️ for better digital literacy and user empowerment**
