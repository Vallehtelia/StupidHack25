#!/usr/bin/env python3

import os
import sys
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print(json.dumps({
        "success": False,
        "error": "OPENAI_API_KEY not found in environment variables"
    }))
    sys.exit(1)

client = OpenAI(api_key=api_key)

def get_shrek_response(user_input, conversation_history):
    
    try:
        with open("prompts/ShrekInstructions.txt", "r") as f:
            shrek_instructions = f.read()
    except FileNotFoundError:
        print(json.dumps({
            "success": False,
            "error": "ShrekInstructions.txt not found"
        }))
        sys.exit(1)
    
    if conversation_history:
        history_text = "\n".join([
            f"{'OLD CONVERSATION' if msg['role'] == 'user' else 'SHRek RESPONSE'}: {msg['content']}"
            for msg in conversation_history
        ])
        prompt = f"""
{shrek_instructions}

{history_text}

CURRENT USER INPUT: {user_input}

Remember our previous conversation and respond as Shrek in the exact JSON format specified above.
"""
    else:
        prompt = f"""
{shrek_instructions}

USER INPUT: {user_input}

Respond as Shrek in the exact JSON format specified above.
"""
    
    try:
        input_messages = [{"role": "system", "content": shrek_instructions}]
        
        for msg in conversation_history:
            input_messages.append({"role": msg['role'], "content": msg['content']})
        
        input_messages.append({"role": "user", "content": user_input})
        
        response = client.responses.create(
            model="gpt-5-nano",
            input=input_messages,
            text={
                "format": {
                    "type": "text"
                },
                "verbosity": "medium"
            },
            reasoning={
                "effort": "medium"
            },
            tools=[],
            store=True
        )
        
        shrek_response = response.output_text.strip()
        
        try:
            if "{" in shrek_response and "}" in shrek_response:
                start = shrek_response.find("{")
                end = shrek_response.rfind("}") + 1
                json_str = shrek_response[start:end]
                parsed_response = json.loads(json_str)
                
                return {
                    "success": True,
                    "response": parsed_response.get("response", "Hmm, what do you want?"),
                    "approved": parsed_response.get("approved", False),
                    "reason": parsed_response.get("reason", "No reason given")
                }
            else:
                return {
                    "success": True,
                    "response": shrek_response,
                    "approved": False,
                    "reason": "Response format unclear"
                }
                
        except json.JSONDecodeError:
            return {
                "success": True,
                "response": shrek_response,
                "approved": False,
                "reason": "Failed to parse response format"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"OpenAI API error: {str(e)}"
        }

def main():
    
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No user input provided. Usage: python shrek.py 'your message here' [conversation_history_json]"
        }))
        sys.exit(1)
    
    user_input = sys.argv[1]
    conversation_history = []
    
    if len(sys.argv) >= 3:
        try:
            conversation_history = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            print(json.dumps({
                "success": False,
                "error": "Invalid conversation history format"
            }))
            sys.exit(1)
    
    result = get_shrek_response(user_input, conversation_history)
    
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main()
