# ai/content_suggestion/services.py

def generate_suggestions(post_content=None, user_id=None, suggestion_type='general'):
    """
    Generates dummy AI suggestions.
    In a real application, this would involve calls to an AI model.
    """
    suggestions = []

    if suggestion_type == 'content_idea' or suggestion_type == 'general':
        suggestions.extend([
            {"type": "content_idea", "content": "Idea: Write about the future of AI in social media."},
            {"type": "content_idea", "content": "Idea: Share a success story related to your product/service."},
            {"type": "content_idea", "content": "Idea: Ask your audience a thought-provoking question."}
        ])

    if suggestion_type == 'hashtag' or suggestion_type == 'general':
        base_hashtags = ["#AI", "#SocialMedia", "#Tech"]
        if post_content:
            # Dummy logic: add hashtags based on keywords (very naive)
            if "python" in post_content.lower():
                base_hashtags.append("#PythonProgramming")
            if "flask" in post_content.lower():
                base_hashtags.append("#FlaskDev")
        suggestions.append({"type": "hashtag", "content": " ".join(base_hashtags)})
        suggestions.append({"type": "hashtag", "content": "#Innovation #DigitalMarketing"})


    if suggestion_type == 'rewrite' and post_content:
        suggestions.append({
            "type": "rewrite",
            "content": f"Original: {post_content[:50]}...\nRewrite suggestion: Have you considered phrasing it like this: '{post_content[:30]}... but with a fresh perspective!'?"
        })
    elif suggestion_type == 'rewrite' and not post_content:
         suggestions.append({"type": "rewrite", "content": "Provide some text to get a rewrite suggestion."})


    if not suggestions:
        suggestions.append({"type": "info", "content": "No specific suggestions generated for the given criteria."})

    # In a real app, you might save these to AISuggestion model if persistence is needed before user interaction
    # For now, we just return them.
    # If user_id is provided, you could tailor suggestions or save them linked to the user.

    return suggestions[:5] # Return a max of 5 suggestions for now
