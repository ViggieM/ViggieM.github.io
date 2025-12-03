---
title: "How I use Claude Code"
ogDescription: "A list of best practices I have encountered over time"
publishedDate: 2025-11-18
---

## General tips

Update claude code regularly

## Commands

### `/research`

```markdown
- You are a thorough researcher.
- You use tools like web search and context7 to find documentation and answers.
- You always think about several alternatives to solve a problem and list the option that you recommend the most last.

Do some research on the following topic:

<research_topic>
$ARGUMENTS
</research_topic>
```

### `/plan`

```markdown
Draft a detailed, step-by-step blueprint for building this feature:

<feature>
  $ARGUMENTS
</feature>

Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step. Prioritize best practices, and incremental progress, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

IMPORTANT: focus very hard on the task at hand. Plan only for the task at hand, do not include any unsolicitated UX improvements, and keep the UI design minimal.

Add only tests when asked to, but make sure the code is testable.
```

#### Alternative

```
Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step. Prioritize best practices, and incremental progress, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

Store the plan in plan.md. Also create a todo.md to keep state.

The spec is in the file called: $ARGUMENTS
```

### `/summarize`

```md
Create `{timestamp}-{slug}.md` with a complete summary of our research session.
Save it inside the `.claude/research` directory in the project.

Here are some last instructions that you need to account for: $ARGUMENTS

Include:

- URLs to resources as footnotes, e.g.:

<markdown>
Tis is an interesting statement about sharks[^1].

[^1]:
    Sharks suffocate when they don't move, according to [Science Journal](https://example.com)
    </markdown>
```

## Resources

[Massively Parallel Procrastination](https://blog.fsck.com/)

read: A small review prompt hack

[Superpowers: How I'm using coding agents in October 2025](https://blog.fsck.com/2025/10/09/superpowers/)

plugins?
[Call Me A Jerk: Persuading AI to Comply with Objectionable Requests - Wharton Generative AI Labs](https://gail.wharton.upenn.edu/research-and-insights/call-me-a-jerk-persuading-ai/)

[Claude Skills are awesome, maybe a bigger deal than MCP](https://simonwillison.net/2025/Oct/16/claude-skills/)

[Equipping agents for the real world with Agent Skills \ Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

[claude-cookbooks/skills at main · anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks/tree/main/skills)

[Managing context on the Claude Developer Platform | Claude](https://claude.com/blog/context-management)

[Claude Code is My Computer](https://steipete.me/posts/2025/claude-code-is-my-computer)

[github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main)

[Turn Claude Code into Your Own INCREDIBLE UI Designer (using Playwright MCP Subagents) - YouTube](https://www.youtube.com/watch?v=xOO8Wt_i72s)

# How I use Claude Code

## Nice to know

Find out how much you consume with

```
npx ccusage@latest
```

---

Resume a previous session:

```bash
claude -c/--continue
claude -r/--resume
```

Actually, just use `claude --help` from time to time, because you will see each time interesting things.

---

How to undo in Claude Code without wasting tokens? Use [ccundo](https://github.com/RonitSachdev/ccundo). Read also [How to Undo in Claude Code? - DEV Community](https://dev.to/ronit_sachdev/how-to-undo-in-claude-code-2cbp)

```bash
pnpm install -g ccundo

# 1. Check what changed
ccundo list

# 2. Preview the changes
ccundo preview

# 3. Undo it
ccundo undo
```

---

Update Claude Code regularly.

```bash
pnpm up -g --latest
```

## Simple prompts

> commit everything in logical chunks

Source: https://steipete.me/posts/2025/claude-code-is-my-computer

## Useful commands

`/research`

I like to have a command that does some research on a specific topic, like "What different MCP servers are available to convert Figma into code?"
