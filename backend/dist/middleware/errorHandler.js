const errorCatcher = () => async (context, nextStep) => {
    try {
        await nextStep();
    }
    catch (trouble) {
        console.error('Server trouble', trouble);
        const messageText = trouble instanceof Error ? trouble.message : 'Unexpected issue';
        return context.json({ error: messageText }, 500);
    }
};
export { errorCatcher };
