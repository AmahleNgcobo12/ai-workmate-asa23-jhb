# Pushing this code to GitHub

Target repository: https://github.com/AmahleNgcobo12/ai-workmate-asa23-jhb

## 1. Install what you need

- Git: https://git-scm.com/downloads
- Node.js: https://nodejs.org (pick the LTS version)

## 2. Push it

Open a terminal in this folder (the one holding this file) and run:

```sh
git init
git add -A
git commit -m "Initial commit: AI Workplace Productivity Assistant"
git branch -M main
git remote add origin https://github.com/AmahleNgcobo12/ai-workmate-asa23-jhb.git
git push -u origin main
```

If GitHub asks for a password, it wants a **personal access token**, not your
account password. Create one at
https://github.com/settings/tokens (check the `repo` box), then paste it where
the password is asked for. If you have the GitHub CLI installed, `gh auth login`
signs you in once and removes the prompt entirely.

## 3. Run it after cloning

```sh
npm install
npm run dev
```

## About the .env file

`.env` holds only this app's public backend address and publishable key - the
values browsers are designed to see. Nothing private is committed. Please do not
add any private or secret key to this file before pushing, because the
repository is public.

## Turning on automatic sync afterwards

Lovable can only sync into a repository that it creates itself, so it cannot
adopt the one you just pushed to. To get changes from here pushed automatically:

1. Workspace settings -> Git -> GitHub -> Add connection -> Add account,
   pick your GitHub account, then Install & Authorize.
2. In this project: Project settings -> Git -> GitHub, then Connect and create
   the repository.
3. Lovable creates its own repository (named after the project). You can rename
   it later on GitHub under Settings -> General -> Repository name, as long as
   that name is free.
