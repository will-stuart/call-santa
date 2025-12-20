# 🎅 Call Santa

A magical web app that lets children have voice conversations with Santa Claus using AI-powered voice technology.

## ✨ Features

- **Voice Calls with Santa** - Real-time AI voice conversations powered by ElevenLabs
- **Personalization** - Add children's names and context for personalized conversations
- **Season Pass** - Unlimited calls subscription via Stripe
- **Progressive Web App** - Install on mobile devices for a native app experience
- **Beautiful UI** - Festive Christmas theme with snowfall effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (for payments)
- An ElevenLabs account (for voice AI)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/call-santa.git
cd call-santa
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Add your Supabase credentials to `.env`

### Required Supabase Secrets

Configure these secrets in your Supabase project:

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `ELEVENLABS_AGENT_ID` | Your ElevenLabs conversational agent ID |
| `PREMIUM_OVERRIDE_EMAILS` | (Optional) Comma-separated emails for premium access |

### Database Tables

The app uses the following tables:
- `profiles` - User profiles
- `children` - Children's names and context for personalization
- `call_logs` - Call history and duration tracking
- `subscriptions` - Stripe subscription status

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payments**: Stripe
- **Voice AI**: ElevenLabs Conversational AI
- **Deployment**: Lovable

## 📁 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth)
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   └── integrations/   # Supabase client
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or support, email: northpole@callsanta.app
