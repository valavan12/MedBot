# MedBot - Adverse Drug Reaction Reporting Chatbot

A trainable AI chatbot designed to collect adverse drug reaction (ADR) reports through intelligent conversation. The system uses OpenAI's GPT-4o to guide users through the reporting process, learning from interactions to improve question sequencing and data collection efficiency.

## Features

- **Intelligent Conversation Flow**: AI-powered chatbot that asks contextual follow-up questions
- **Trainable System**: Learns from user interactions to optimize question ordering
- **Progress Tracking**: Real-time progress indicator showing completion status
- **Data Export**: Export collected ADR reports in JSON format
- **HIPAA Compliance**: Privacy-focused design with secure data handling
- **Responsive Design**: Works on desktop and mobile devices
- **Session Management**: Persistent chat sessions with automatic saving

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Wouter (routing)
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4o
- **State Management**: TanStack Query
- **Storage**: In-memory storage (configurable for database)
- **UI Components**: Shadcn/ui

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- OpenAI API key

## Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd medbot
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   This will start both the Express backend and Vite frontend on port 5000.

4. **Open your browser**:
   Navigate to `http://localhost:5000` to access the application.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── chat/       # Chat-specific components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite development setup
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas and types
└── package.json            # Project dependencies
```

## API Endpoints

- `POST /api/sessions` - Create new chat session
- `GET /api/sessions/:sessionId` - Get session details
- `GET /api/sessions/:sessionId/messages` - Get chat messages
- `POST /api/sessions/:sessionId/messages` - Send message and get AI response
- `GET /api/sessions/:sessionId/report` - Get ADR report data
- `GET /api/sessions/:sessionId/export` - Export session data
- `POST /api/training-feedback` - Submit training feedback
- `GET /api/question-flow` - Get current question flow
- `GET /api/reports` - Get all ADR reports (analytics)

## Configuration

### Question Flow
The chatbot follows a predefined question flow that can be customized in `server/storage.ts`. Default questions include:

1. Medication identification
2. Symptom description
3. Severity assessment
4. Timeline establishment
5. Previous reactions
6. Patient demographics

### AI Prompts
AI behavior can be modified in the `generateAIResponse` function in `server/routes.ts`. The system prompt defines the chatbot's personality and instructions.

## Deployment Options

### Option 1: Replit Deployment (Recommended)
1. Push your code to a Git repository
2. Import the repository into Replit
3. Set the `OPENAI_API_KEY` environment variable in Replit
4. Click the "Deploy" button in Replit

### Option 2: Traditional Hosting
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set environment variables**:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   PORT=3000
   ```

3. **Start the production server**:
   ```bash
   npm start
   ```

### Option 3: Docker Deployment
1. **Create Dockerfile**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t medbot .
   docker run -p 3000:3000 -e OPENAI_API_KEY=your_key medbot
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o access | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Data Collection

The system collects the following ADR information:
- Medication name and dosage
- Reaction symptoms
- Severity rating (1-5 scale)
- Timeline and onset
- Patient demographics
- Previous reactions
- Other medications
- Additional notes

## Privacy and Security

- All data is handled according to HIPAA guidelines
- No personal health information is stored permanently without consent
- API communications are encrypted
- Session data can be exported and deleted

## Training and Learning

The chatbot learns from user interactions through:
- Question sequence optimization
- Response pattern analysis
- Completion rate tracking
- User satisfaction feedback

Training data is collected via the training feedback system and can be used to improve question flow and AI responses.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review API endpoints
- Examine console logs for debugging
- Ensure OpenAI API key is valid and has sufficient credits

## Troubleshooting

### Common Issues

1. **AI not responding**: Check OpenAI API key and account credits
2. **Session not saving**: Verify API endpoints are accessible
3. **Build errors**: Ensure Node.js version compatibility
4. **CORS issues**: Check frontend/backend port configuration

### Development Tips

- Use browser developer tools to monitor API calls
- Check server logs for detailed error messages
- Test with different OpenAI models if needed
- Monitor API usage and rate limits