---
title: "Drag-and-Drop with Svelte 5"
ogDescription: "Implement a HTML5 drag-and-drop on Modern mobile browsers"
publishedDate: 2025-12-13
---

Yesterday I implemented a working drag and drop for Bookmarks and Tags in my [Breader app](https://breader.app).
This new feature allows me to drag bookmarks onto tags to assign them to the tag, and drag tags onto other tags to create the desired tag hierarchy.
This worked flawlessly on desktop, while on mobile the dragging over effect was visible but dropping had no effect.

## First Attempt: Over-Engineering

Claude initially suggested a massive 13-step [plan](/blog/planning-with-agents) involving custom touch handlers, synthetic drag events, haptic feedback...
It didn't work. I couldn't scroll anymore on my mobile phone, the touch event was completely broken.

## Second Attempt: Finding a Working Example

Then I did some research myself and found this inconspicuous [repository on GitHub](https://github.com/jz222/svelte-native-drag-and-drop/tree/master) that demonstrated how drag and drop can be achieved in Svelte.
It uses Svelte 3, but compared to _my_ app, it worked.

So I decided, as every good developer does, to copy it.
I used [repomix](https://repomix.com/) to convert that repo to an xml locally, then told Claude:

<!-- todo: style quotes -->

```bash
> Look at this. This works on mobile. Why does my implementation not work?

∴ Thinking…
```

Claude revised the plan to just add some CSS:

```css
/* Enable mobile drag */
li[draggable="true"] {
	-webkit-user-drag: element;
	user-select: none;
	-webkit-touch-callout: none;
}
```

I thought "This looks easy!". I deployed it, tested on mobile, but... nothing happened.

## Deep Debugging with Remote DevTools

So I had to do the thinking myself (again).

I asked Claude to add comprehensive logging to every drag event.
It did it very nicely, and if there is one thing I would recommend, it would be:

<!-- todo: add a info block component or so -->

Let Claude add console log commands and clean them up later. It can do this very well! You get **Console logs with emojis** for free.

I deployed again and fired up **[Chrome Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging)** to see what was actually happening on my phone.
Remote Debugging lets you connect your Android phone to your laptop and see the _actual_ Chrome DevTools console from your mobile browser.
It's invaluable for mobile web development.

Looking at the console on my phone, I saw this:

```
✅ 📱 touchstart fires
✅ 🔵 dragstart fires
✅ 🔵 dataTransfer.setData() succeeds
❌ 🟡 dragover fires BUT dataTransfer.types is EMPTY
```

I told Claude:

> Hey, this log is firing on mobile (line 96), but it works fine on desktop.

## The Real Problem: Mobile DataTransfer Bug

That's when Claude finally understood the root cause: **Mobile browsers don't reliably preserve `dataTransfer` data** when the drag was initiated by touch.
It's a known bug, especially in iOS Safari.

## The Solution: State-Based Fallback

The solution was to implement a `dragState.svelte.ts` store to capture the currently dragged element as a fallback, which looked something like this:

```typescript
// dragState.svelte.ts
let currentDragData = $state<{
	type: "bookmark" | "tag" | null;
	id: string | null;
}>({ type: null, id: null });

export const dragState = {
	set(type: "bookmark" | "tag", id: string) {
		currentDragData = { type, id };
	},

	getBookmarkId(): string | null {
		return currentDragData.type === "bookmark" ? currentDragData.id : null;
	},

	clear() {
		currentDragData = { type: null, id: null };
	},
};
```

And updated the drag handlers:

```typescript
// On dragstart (progressive enhancement)
function handleDragStart(event: DragEvent) {
	if (event.dataTransfer) {
		event.dataTransfer.setData("application/x-bookmark-id", bookmark.id);
	}
	dragState.set("bookmark", bookmark.id); // Fallback for mobile
}

// On drop (try both sources)
let bookmarkId = e.dataTransfer.getData("application/x-bookmark-id");
if (!bookmarkId) {
	bookmarkId = dragState.getBookmarkId();
	console.log("📱 [MOBILE FALLBACK] Using stored ID");
}
```

## Key Learnings

1. **Mobile browsers DO support drag-and-drop** - Don't let old Stack Overflow posts from 2015 fool you
2. **But dataTransfer is unreliable on mobile** - Known bug, especially iOS Safari
3. **Remote debugging is essential** - You can't fix what you can't see on the actual device
4. **AI collaboration works best with feedback loops** - Test, report back, iterate
5. **Comprehensive logging saves time** - Those emoji-tagged logs made debugging way easier
