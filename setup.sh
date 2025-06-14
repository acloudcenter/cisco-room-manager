#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up development environment...${NC}"

# Get the directory of this script
TEMPLATE_DIR="$HOME/dev-setup-template"

# Copy configuration files
echo -e "${GREEN}Copying ESLint configuration...${NC}"
cp "$TEMPLATE_DIR/eslint.config.mjs" ./

echo -e "${GREEN}Copying Prettier configuration...${NC}"
cp "$TEMPLATE_DIR/.prettierrc" ./

# Copy GitHub Actions workflow files
echo -e "${GREEN}Setting up GitHub Actions workflows...${NC}"
mkdir -p .github/workflows
cp "$TEMPLATE_DIR/.github/workflows/security-pipeline.yml" ./.github/workflows/

# Copy documentation
echo -e "${GREEN}Copying security documentation...${NC}"
cp "$TEMPLATE_DIR/SECURITY.md" ./
echo -e "${GREEN}Copying GitHub setup guide...${NC}"
cp "$TEMPLATE_DIR/GITHUB.md" ./

# Copy SonarCloud configuration
echo -e "${GREEN}Copying SonarCloud configuration...${NC}"
cp "$TEMPLATE_DIR/sonar-project.properties" ./
echo -e "${YELLOW}IMPORTANT: You need to update sonar-project.properties with your organization and project key${NC}"

# Extract dev dependencies from template package.json
echo -e "${GREEN}Installing development dependencies...${NC}"
npm install --save-dev eslint prettier husky lint-staged @eslint/compat @eslint/eslintrc @eslint/js @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-unused-imports globals

# Initialize Husky
echo -e "${GREEN}Setting up Husky for git hooks...${NC}"
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"

# Create basic lint-staged configuration if it doesn't exist
if [ ! -f ".lintstagedrc" ] && [ ! -f ".lintstagedrc.js" ] && [ ! -f ".lintstagedrc.json" ]; then
  echo -e "${GREEN}Creating lint-staged configuration...${NC}"
  cat > .lintstagedrc.json << EOF
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
EOF
fi

# Add scripts to package.json if they don't exist
if [ -f "package.json" ]; then
  echo -e "${GREEN}Updating package.json scripts...${NC}"
  # Check if jq is installed
  if command -v jq >/dev/null 2>&1; then
    # Use jq to add scripts if they don't exist
    if ! grep -q '"lint":' package.json; then
      jq '.scripts.lint = "eslint --fix"' package.json > package.json.tmp && mv package.json.tmp package.json
    fi
    if ! grep -q '"format":' package.json; then
      jq '.scripts.format = "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""' package.json > package.json.tmp && mv package.json.tmp package.json
    fi
  else
    echo -e "${YELLOW}jq not installed. Please manually add the following scripts to your package.json:${NC}"
    echo '"lint": "eslint --fix",'
    echo '"format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""'
  fi
fi

echo -e "${GREEN}Setup complete! Your project now has consistent ESLint and Prettier configurations.${NC}"
echo -e "${YELLOW}You can run the following commands:${NC}"
echo -e "  ${GREEN}npm run lint${NC} - to lint your code"
echo -e "  ${GREEN}npm run format${NC} - to format your code"
echo -e "  ${GREEN}git commit${NC} - will automatically run lint-staged before committing"
