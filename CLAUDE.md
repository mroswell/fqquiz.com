# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fluoroquinolone Quiz** - A web-based educational quiz application focused on fluoroquinolone antibiotics, hosted on GitHub Pages.

## Technology Stack

- **Hosting**: GitHub Pages (static site)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **No build process** - Direct deployment of static files
- **No server-side processing** - All logic runs client-side

## Key Considerations

### Medical Content
This application deals with pharmaceutical/medical content (fluoroquinolone antibiotics). Ensure:
- Medical information accuracy is paramount
- Include clear disclaimers about educational vs. medical advice
- Quiz content should be factually correct and properly sourced
- Consider adding references/citations for medical information

### Immediate Feedback Implementation
Since immediate feedback is a priority:
- Show answer correctness immediately after selection
- Display explanations right after each answer
- Use visual feedback (colors, icons, animations)
- Update score/progress in real-time
- Consider showing correct answer if user is wrong
- Add "why this matters" context for medical education
- Display final score as "You scored X out of 15 (Y%)" where Y shows decimal only if non-zero (e.g., "80%" or "86.7%") with no pass/fail designation

### Quiz UX Best Practices
- **Question Types**: Multiple choice, true/false, select all that apply
- **Navigation**: Next/Previous buttons, question overview panel
- **Progress Tracking**: Visual progress bar, question counter (e.g., "3 of 10")
- **Review Mode**: Allow reviewing all answers with explanations at end
- **Retry Options**: Retake quiz with randomized questions/answers
- **Skip & Flag**: Allow skipping questions and marking for review
- **Timer** (optional): Per-question or total quiz timer with visual countdown

### Mobile-First Design Requirements
- **Touch-Optimized**: Minimum 44x44px touch targets for all interactive elements
- **Responsive Layout**: Use CSS Grid/Flexbox for fluid layouts
- **Viewport Meta Tag**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- **Font Sizes**: Minimum 16px base font to prevent zoom on iOS
- **Thumb-Friendly Navigation**: Place primary actions in bottom third of screen
- **Swipe Gestures**: Optional swipe left/right for next/previous question
- **No Hover States**: Use touch feedback (tap highlights) instead of hover
- **Vertical Orientation**: Design primarily for portrait mode
- **Single Column Layout**: Stack elements vertically on small screens

## Technical Architecture

### File Structure
```
/
├── index.html          # Main quiz page
├── styles.css          # All styles
├── quiz.js             # Main quiz engine
└── questions.json      # Question data
```

### Question Data Structure
```javascript
{
  id: "q1",
  question: "Which fluoroquinolone is commonly prescribed for UTIs?",
  type: "multiple-choice",
  options: [
    { id: "a", text: "Ciprofloxacin", correct: true },
    { id: "b", text: "Amoxicillin", correct: false },
    // ...
  ],
  explanation: "Ciprofloxacin is a second-generation fluoroquinolone...",
  difficulty: "medium",
  category: "clinical-use",
  references: ["FDA prescribing information", "Medical journal citation"]
}
```

### State Management (Vanilla JS)
- Use a single state object for quiz state
- Store in sessionStorage for persistence across page refreshes
- State includes: current question, answers, score, time spent
- Use event listeners and DOM manipulation for updates

### Performance Optimizations
- Preload all questions at start (small dataset)
- Use CSS transitions for smooth feedback
- Lazy load images if medical diagrams are included
- Minimize DOM manipulation by updating only changed elements
- Use `will-change` CSS property for animated elements
- Optimize images for mobile (WebP format with fallbacks)
- Minimize JavaScript bundle size (no large libraries)

### Mobile-Specific CSS Patterns
```css
/* Responsive base styles */
html {
  font-size: 16px; /* Prevents iOS zoom */
  -webkit-text-size-adjust: 100%;
}

/* Touch-friendly buttons */
.quiz-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  touch-action: manipulation; /* Prevents delay */
}

/* Answer options for mobile */
.answer-option {
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0,0,0,0.1);
}

/* Responsive typography */
@media (max-width: 768px) {
  .question-text {
    font-size: 18px;
    line-height: 1.5;
  }
  
  .quiz-container {
    padding: 16px;
    max-width: 100%;
  }
}

/* Landscape orientation handling */
@media (orientation: landscape) and (max-height: 500px) {
  .quiz-header {
    position: sticky;
    top: 0;
  }
}
```

## Accessibility Guidelines

### WCAG 2.1 Level AA Compliance
- **Keyboard Navigation**: Tab through options, Enter to select, Space for buttons
- **Screen Readers**: Proper ARIA labels, live regions for score updates
- **Focus Management**: Clear focus indicators, logical tab order
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Time Limits**: Option to extend or disable timers
- **Text Alternatives**: Alt text for any medical images/diagrams

### Specific Implementations
```javascript
// Announce feedback to screen readers
const announcement = document.createElement('div');
announcement.setAttribute('role', 'alert');
announcement.setAttribute('aria-live', 'polite');
announcement.textContent = isCorrect ? 'Correct!' : 'Incorrect. ' + explanation;
```

## Security Considerations

### GitHub Pages Limitations
- No server-side validation possible
- Answers visible in client-side code
- Focus on educational value, not preventing cheating

### Best Practices for Static Sites
- Don't store sensitive medical data
- Randomize question and answer order
- Use array shuffling for each quiz attempt
- Consider obfuscating answer keys (though still client-visible)
- Add meta tags to prevent caching during development

## Development Commands

### Local Development
```bash
# Simple HTTP server for local testing
python -m http.server 8000
# or
npx http-server

# No build process needed - edit files directly
```

### Deployment
```bash
# GitHub Pages auto-deploys from main branch
git add .
git commit -m "Update quiz"
git push origin main
```

## Implementation Checklist

When building features, ensure:
- [ ] Immediate feedback after each answer
- [ ] Mobile-responsive design (test on various devices)
- [ ] Keyboard navigation works completely
- [ ] Screen reader tested
- [ ] Questions randomized on each attempt
- [ ] Progress saved in sessionStorage
- [ ] Clear medical disclaimers included
- [ ] Fallback for users with JavaScript disabled

### Mobile Testing Checklist
- [ ] Test on real devices (iOS Safari, Android Chrome)
- [ ] Verify touch targets are at least 44x44px
- [ ] Check text is readable without zooming
- [ ] Test in both portrait and landscape orientations
- [ ] Verify no horizontal scrolling at any viewport size
- [ ] Test with slow network (3G simulation)
- [ ] Check feedback animations perform smoothly (60fps)
- [ ] Verify forms don't trigger unwanted keyboards
- [ ] Test swipe gestures don't conflict with browser navigation
- [ ] Ensure quiz works offline after initial load