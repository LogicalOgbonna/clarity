# Clarity - Making the internet transparent, one document at a time

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.2.9-blue)](https://www.typescriptlang.org/)

Clarity is a powerful browser extension that helps users understand complex Terms of Service and Privacy Policy documents through AI-powered analysis and summarization. Built with React, TypeScript, and modern web technologies, it provides instant insights into legal documents across multiple languages.

## ✨ Features

- **Terms Analysis**: Automatically analyze Terms of Service and Privacy Policy documents
- **Instant Summaries**: Get AI-powered summaries of complex legal text
- **Multi-language Support**: Translate and analyze documents in multiple languages
- **Chat History**: Save and manage your analysis history
- **Smart Detection**: Automatically detect policy documents on web pages
- **Real-time Processing**: Fast, efficient document processing
- **Privacy-Focused**: Local processing with optional cloud integration

### 🛠️ Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/LogicalOgbonna/clarity.git
   cd clarity
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env

   # Create a file clarity.sqlite in the core/db folder
   touch core/db/clarity.sqlite # this is the database file for the core service
   ```

3. **Install dependencies**

   ```bash
   npm install # this must be npm not yarn or pnpm

   npm exec playwright install # if you don't have playwright installed

   npm run prisma:generate # generate the prisma client
   npm run prisma:migrate # migrate the database
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

5. **Run Locally**
   ```bash
   npm run dev:chrome
   npm run dev:firefox
   npm run dev:opera
   ```

6. **Build for Production**
   ```bash
   npm run build:chrome
   npm run build:firefox
   npm run build:opera
   ```


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and ESLint configuration
- Update documentation as needed
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [web-extension-starter](https://github.com/abhijithvijayan/web-extension-starter)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/LogicalOgbonna/clarity/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LogicalOgbonna/clarity/discussions)
- **Email**: [arinzeogbo@gmail.com](mailto:arinzeogbo@gmail.com)

## 🔮 Roadmap

- [ ] Support more document types (Refund Policy, Return Policy, etc.)
- [ ] Improve developer experience (e.g introduce [turborepo](https://turborepo.com/) for monorepo management and Better-Auth for authentication)
- [ ] User Dashboard (e.g. Compare Privacy Versions, Analytics, Usage, etc.)
- [ ] Better Error Handling and User Feedback
- [ ] For large system prompt in Chrome Prompt API, use a different approach to avoid[ QuotaExceededError](https://github.com/webmachinelearning/prompt-api?tab=readme-ov-file#tokenization-context-window-length-limits-and-overflow)
- [ ] A lot more features...
---

**Made with ❤️ for better digital literacy and user empowerment**
