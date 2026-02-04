---
title: "Claude Code Cheatsheet"
ogDescription: "A list of fundamentals that can save you a lot of time and tokens"
publishedDate: 2025-11-18
tags:
  - Claude Code
---

### 1. Update Claude Code regularly

One the most important you should do regularly is to update to the latest version.
Updates and bug fixes come out nearly every single day.

```bash
pnpm up -g --latest
# or
claude update
```

### 2. Read `claude --help` to familiarize yourself with the options

Some of the commands I use regularily:

```bash
# Resume a previous session
claude -c/--continue
claude -r/--resume
```

Inside Claude Code I mostly use

```bash
/clear  # start a new session with new context regularily
/mcp  # check the status of the MCP servers
/context  # check how much context space I have left and when it is time to start a new session
```

### 3. Keep your prompts simple

Example:

```text
commit everything in logical chunks
```

Source: https://steipete.me/posts/2025/claude-code-is-my-computer

### 4. Use commands

One of the best commands I have encountered is this[^1]:

```text
Draft a detailed, step-by-step blueprint for building this project.
Then, once you have a solid plan, break it down into small, iterative chunks that build on each other.
Look at these chunks and then go another round to break it into small steps.
review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward.
Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step.
Prioritize best practices, and incremental progress, ensuring no big jumps in complexity at any stage.
Make sure that each prompt builds on the previous prompts, and ends with wiring things together.
There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags.
The goal is to output prompts, but context, etc is important as well.

Store the plan in plan.md. Also create a todo.md to keep state.

The spec is in the file called: $ARGUMENTS
```

Note the `$ARGUMENTS` keyword. It helps you pass different keywords to your command, as if you were using a command line tool.

### 5. Use skills

### 6. Use Git Worktrees (or at least branches)

Technically, you could make a directory `.trees/` inside your repo and create git worktrees there[^2]:

```bash
mkdir .trees
git worktree add .trees/ui_feature
git worktree add .trees/testing_feature
git worktree add .trees/quality_feature
```

Then, after completion:

```
use the git merge command to merge in all of the worktrees in the .trees folder and fix any conflicts if there are any
```

But I found it to conflict with code searches, since claude will find duplicate files an use up unnecessary tokens.
So it is preferable to:

```bash
git worktree add ../ui_feature
git worktree add ../testing_feature
git worktree add ../quality_feature
```

### 7. Use MCP servers

## Nice tools around Claude Code

### Undo in Claude Code without wasting tokens

Use [ccundo](https://github.com/RonitSachdev/ccundo).

```bash
pnpm install -g ccundo

# 1. Check what changed
ccundo list

# 2. Preview the changes
ccundo preview

# 3. Undo it
ccundo undo
```

Read [How to Undo in Claude Code? - DEV Community](https://dev.to/ronit_sachdev/how-to-undo-in-claude-code-2cbp) - it's where I got

### Check your token usage

Find out how much you consume with

```bash
npx ccusage@latest
```

[^1]: Source: [My LLM codegen workflow atm | Harper Reed's Blog](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)

[^2]: As described in [Claude Code: A Highly Agentic Coding Assistant - DeepLearning.AI](https://learn.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant/lesson/66b35/introduction)
