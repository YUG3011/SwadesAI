const runSupportAgent = (userWords, storyTrail) => {
    const lastNote = storyTrail.at(-1)?.content ?? '';
    const replyLines = [
        'I can help with general questions and troubleshooting.',
        lastNote ? `I remember you said: "${lastNote}".` : 'Tell me more about what you need.',
        'If you have an order number or error message, share it so I can look it up.',
    ];
    if (userWords.toLowerCase().includes('faq')) {
        replyLines.unshift('Common answers: shipping usually takes 3-5 business days.');
    }
    return replyLines.join(' ');
};
export { runSupportAgent };
