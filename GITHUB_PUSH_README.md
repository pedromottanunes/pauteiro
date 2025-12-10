# How to push this project to GitHub (safe steps)

This project includes a helper script to initialize a Git repository and push to GitHub from your machine without sharing credentials here.

1. Open PowerShell in the project root (e.g. `d:\Full Job\GenContent - pautas`).
2. Review the script `scripts/push-to-github.ps1` to confirm you are comfortable with the operations.
3. Run the script:

```powershell
# Run with default remote and main branch
.\scripts\push-to-github.ps1

# Or explicitly provide remote and branch
.\scripts\push-to-github.ps1 -RemoteUrl "https://github.com/USERNAME/REPO.git" -Branch "main"
```

4. When prompted by `git`, authenticate. If asked for username and password, use your GitHub username and paste your Personal Access Token as the password.

Notes & Tips

- Do NOT paste your token into the chat. Use the terminal that runs on your computer.
- If the remote repository already has commits and the histories differ, run the helper with `-AllowUnrelatedHistories` to merge histories:

```powershell
.\scripts\push-to-github.ps1 -AllowUnrelatedHistories
```

- Alternatively, install and use GitHub CLI (`gh`) to authenticate once via `gh auth login` and the push will work without pasting tokens into the terminal.

After push

- Go to your GitHub repo page to confirm the files are present.
- If you want, I can prepare Render deployment steps and the recommended build/start commands for this project.
