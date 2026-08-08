const express = require("express");
const router = express.Router();
const Session = require("../models/session");
const auth=require("../middleware/auth")
router.post("/create", auth, async (req, res) => {
    try {
        const { content, keystrokes } = req.body;

        // -----------------------------
        // 1. BASIC TEXT INFORMATION
        // -----------------------------

        const words = content.trim()
            ? content.trim().split(/\s+/).length
            : 0;

        // -----------------------------
        // 2. ANALYZE WRITING EVENTS
        // -----------------------------

        const typingEvents = keystrokes.filter(
            (event) => event.type === "type"
        );

        const deleteEvents = keystrokes.filter(
            (event) => event.type === "delete"
        );

        const pasteEvents = keystrokes.filter(
            (event) => event.type === "paste"
        );

        // -----------------------------
        // 3. CALCULATE PAUSES
        // -----------------------------

        let pauses = [];

        for (let i = 1; i < keystrokes.length; i++) {
            const timeDifference =
                keystrokes[i].time - keystrokes[i - 1].time;

            // More than 2 seconds = pause
            if (timeDifference > 2000) {
                pauses.push(timeDifference);
            }
        }

        const pauseCount = pauses.length;

        const longestPause =
            pauseCount > 0 ? Math.max(...pauses) : 0;

        // -----------------------------
        // 4. PASTE INFORMATION
        // -----------------------------

        const pasteCount = pasteEvents.length;

        const largestPaste =
            pasteCount > 0
                ? Math.max(...pasteEvents.map(event => event.size || 0))
                : 0;

        // -----------------------------
        // 5. CREATE ANALYSIS
        // -----------------------------

        // -----------------------------
// 5. CREATE BEHAVIOR SCORE
// -----------------------------

let score = 50;
let evidence = [];

// Natural typing activity
if (typingEvents.length > 0) {
    score += 10;
    evidence.push("Typing activity was detected.");
}

// Revisions
if (deleteEvents.length > 0) {
    score += 10;
    evidence.push("The writer made revisions while composing.");
}

// Pauses
if (pauseCount > 0) {
    score += 10;
    evidence.push("Pauses between writing events were detected.");
}

// Large paste
if (largestPaste > 500) {
    score -= 30;
    evidence.push("A large block of text was pasted.");
} else if (pasteCount > 0) {
    score -= 5;
    evidence.push("Some pasted text was detected.");
}

// Keep score between 0 and 100
score = Math.max(0, Math.min(100, score));

let assessment;

if (score >= 70) {
    assessment = "Writing behavior appears consistent with organic composition.";
} else if (score >= 40) {
    assessment = "Writing behavior is mixed and requires further analysis.";
} else {
    assessment = "Writing behavior contains significant externally inserted content.";
}

const analysis = {
    wordCount: words,
    typingEvents: typingEvents.length,
    deletions: deleteEvents.length,
    pasteCount: pasteCount,
    largestPaste: largestPaste,
    pauseCount: pauseCount,
    longestPause: longestPause,

    score: score,
    assessment: assessment,
    evidence: evidence
};

        // -----------------------------
        // 6. SAVE SESSION
        // -----------------------------

        const session = new Session({
            userId: req.userId,
            content: content,
            keystrokes: keystrokes
        });

        await session.save();

        // -----------------------------
        // 7. SEND ONE RESPONSE
        // -----------------------------

        res.status(201).json({
            message: "Session analyzed successfully",
            analysis: analysis
        });

    } catch (error) {
        console.error("Error analyzing session:", error);

        res.status(500).json({
            message: "Failed to analyze session"
        });
    }
});

module.exports = router;