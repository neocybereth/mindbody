#!/bin/bash

echo "🚀 Mindbody Chat Setup"
echo "====================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Create .env.local file
cat > .env.local << EOF
# Mindbody API Configuration
MINDBODY_API_KEY=your_api_key_here
MINDBODY_SITE_ID=-99
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password

# OpenRouter Configuration (for AI chat functionality)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Model selection (defaults to claude-3.5-sonnet)
DEFAULT_MODEL=anthropic/claude-3.5-sonnet

# Optional Mindbody settings
MINDBODY_API_URL=https://api.mindbodyonline.com/public/v6
CACHE_TTL_MINUTES=5
MCP_SERVER_NAME=mindbody-mcp
MCP_SERVER_VERSION=2.0.0
EOF

echo ""
echo "✅ Created .env.local file"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your credentials:"
echo "   - Mindbody API credentials from: https://developers.mindbodyonline.com/"
echo "   - OpenRouter API key from: https://openrouter.ai/"
echo "2. Run 'npm install' (if you haven't already)"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Need help? Check SETUP.md for detailed instructions"

