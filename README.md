# OPT/STEM-OPT Unemployment Tracker

A fast, minimal web app for F-1 students to track unemployment days during post-completion OPT and STEM OPT periods.

## Features

- **Accurate Day Calculation**: Track unemployment days for both OPT (90-day limit) and STEM OPT (150-day total limit)
- **Visual Timeline**: See your employment/unemployment periods at a glance
- **Smart Validation**: Automatic overlap detection and date validation
- **Status Warnings**: Get alerts when approaching or exceeding unemployment limits
- **Local Storage**: Your data stays on your device - no server, no tracking
- **Mobile-Friendly**: Responsive design works on all devices
- **Export Ready**: Generate printable summaries (coming soon)

## Usage

1. Enter your EAD start and end dates for OPT
2. Indicate if you have STEM OPT extension
3. Add your employment periods (employer name, start/end dates)
4. View your unemployment days used and remaining
5. Monitor visual timeline and status warnings

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Tech Stack

- **Vue 3** + TypeScript + Composition API
- **Pinia** for state management
- **Tailwind CSS** for styling
- **date-fns** for date calculations
- **Vite** for blazing fast builds

## Deployment

This app automatically deploys to GitHub Pages via GitHub Actions.

### Setup GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to the `main` branch to trigger deployment

The app will be available at: `https://yourusername.github.io/opt-calculator/`

### Deploy to Vercel

1. Install the [Vercel CLI](https://vercel.com/docs/cli) and run `vercel login`
2. From the project root run `vercel` and follow the prompts (defaults work)
3. For future deploys run `vercel --prod` or connect the repo in the Vercel dashboard

This repo already contains a `vercel.json` so routing and build commands are configured out of the box.

#### Enable Analytics & Monitoring

Vercel provides native analytics and error tracking once the project is deployed:

- In the Vercel dashboard open **Project → Analytics** and enable **Web Analytics** (page views) and **Speed Insights**. The `<script src="/_vercel/insights/script.js">` tag in `index.html` is already present, so traffic data starts flowing as soon as you toggle the feature on.
- For error logs, open **Project → Observability → Error Monitoring** and enable it. Vercel will automatically capture uncaught exceptions and failed function invocations. You can optionally configure alert rules (Slack/email) from the same screen.
- Historical metrics can be exported as CSV directly from the Analytics UI if you want to archive usage reports.

### Manual Deployment

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## Important Notes

⚠️ **Educational Use Only**: This tool is for informational purposes. Always consult your international student office for official guidance.

📚 **Official Resources**: [USCIS OPT Information](https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students)

## License

MIT
